// Authentication service functions.
// Covers: Email/Password, Google, Phone OTP, Facebook, LinkedIn(*),
// Forgot Password, Email Verification. (LinkedIn requires a custom
// OAuth provider configured in the Firebase console under
// Authentication > Sign-in method > OpenID Connect.)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  updateProfile,
  deleteUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage, googleProvider, facebookProvider } from './config'

const VALID_ROLES = [
  'client',
  'civilEngineer',
  'architect',
  'structuralEngineer',
  'mepEngineer',
  'contractor',
]

// --- Email / Password ---

export async function registerWithEmail({ name, email, password, role }) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Please choose a valid account type before registering.')
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await sendEmailVerification(cred.user)
  await createUserProfile(cred.user.uid, { name, email, role })
  return cred.user
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function resendVerificationEmail() {
  if (auth.currentUser) return sendEmailVerification(auth.currentUser)
}

// --- Social logins ---
//
// signInWithPopup() is what most Firebase examples show, but it's
// unreliable in a lot of real-world browser setups: strict popup
// blockers, mobile browsers, in-app/webview browsers, and increasingly
// common Cross-Origin-Opener-Policy (COOP) restrictions all cause it to
// silently fail or throw errors like `auth/popup-blocked` and
// `auth/popup-closed-by-user` even though nothing is actually wrong with
// the Google/Facebook app configuration. When that happens we
// transparently fall back to a full-page redirect instead, which works
// everywhere popups don't.

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
])

const PENDING_ROLE_KEY = 'bc_pending_social_role'
const REDIRECT_ERROR_KEY = 'bc_social_auth_error'

async function signInWithProvider(provider, role) {
  try {
    const cred = await signInWithPopup(auth, provider)
    await createUserProfile(
      cred.user.uid,
      { name: cred.user.displayName, email: cred.user.email, role },
      { onlyIfMissing: true },
    )
    return cred.user
  } catch (err) {
    if (POPUP_FALLBACK_CODES.has(err?.code)) {
      // Popup couldn't open/complete — fall back to a full-page
      // redirect. The page will reload once the provider sends the
      // person back; completeRedirectSignIn() (called on app startup)
      // finishes creating the profile from there.
      sessionStorage.setItem(PENDING_ROLE_KEY, role)
      await signInWithRedirect(auth, provider)
      return null // navigation away happens here; nothing left to do
    }
    throw err
  }
}

export function loginWithGoogle(role = 'client') {
  return signInWithProvider(googleProvider, role)
}

export function loginWithFacebook(role = 'client') {
  return signInWithProvider(facebookProvider, role)
}

// Call once when the app boots (see AuthContext) to pick up the result
// of a signInWithRedirect() that just brought the person back here.
// Safe to call every time — it resolves to null when there's no pending
// redirect result to process.
export async function completeRedirectSignIn() {
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null
    const role = sessionStorage.getItem(PENDING_ROLE_KEY) || 'client'
    sessionStorage.removeItem(PENDING_ROLE_KEY)
    await createUserProfile(
      result.user.uid,
      { name: result.user.displayName, email: result.user.email, role },
      { onlyIfMissing: true },
    )
    return result.user
  } catch (err) {
    // Surface this on the next Login/Register page render rather than
    // losing it — the page has just done a full reload so any local
    // component state from before the redirect is gone.
    sessionStorage.removeItem(PENDING_ROLE_KEY)
    sessionStorage.setItem(REDIRECT_ERROR_KEY, err?.code || err?.message || 'redirect-sign-in-failed')
    return null
  }
}

// Read (and clear) any error stashed by completeRedirectSignIn() so the
// Login/Register page can display it after the redirect round-trip.
export function consumePendingSocialAuthError() {
  const code = sessionStorage.getItem(REDIRECT_ERROR_KEY)
  sessionStorage.removeItem(REDIRECT_ERROR_KEY)
  return code
}

// --- Phone OTP ---

export function initRecaptcha(containerId) {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
}

export function sendOtp(phoneNumber, recaptchaVerifier) {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
}

export function confirmOtp(confirmationResult, code) {
  return confirmationResult.confirm(code)
}

// Links a verified phone number to the CURRENTLY SIGNED-IN account, so
// that account (not a brand-new phone-only user) is what signs in next
// time someone uses "Phone OTP" on the Login page. Call this instead of
// confirmOtp() when the person is already logged in (e.g. from
// Settings) and just wants to attach/confirm their phone number.
export function linkPhoneToAccount(confirmationResult, code) {
  const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, code)
  if (!auth.currentUser) throw new Error('You need to be logged in to link a phone number.')
  return linkWithCredential(auth.currentUser, credential)
}

// --- Session ---

export function logout() {
  return signOut(auth)
}

// --- Firestore user profile helpers ---

async function createUserProfile(uid, data, { onlyIfMissing = false } = {}) {
  const ref = doc(db, 'users', uid)
  if (onlyIfMissing) {
    const snap = await getDoc(ref)
    if (snap.exists()) return
  }
  await setDoc(
    ref,
    {
      ...data,
      twoFactorEnabled: false,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Used by every "Edit Profile" / "Save Changes" screen (Client Profile,
// Engineer Profile Editor, Settings toggles). Partial update — only the
// fields passed in are changed, everything else on the profile is left
// alone.
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  // Keep the Firebase Auth displayName in sync so it shows up correctly
  // anywhere the app reads auth.currentUser directly.
  if (data.name && auth.currentUser && auth.currentUser.uid === uid) {
    await updateProfile(auth.currentUser, { displayName: data.name })
  }
}

// Permanently deletes the signed-in user's account (Auth + Firestore
// profile). Firebase requires a *recent* login for this — if the
// session is older, Firebase throws `auth/requires-recent-login` and the
// caller should ask the person to log in again before retrying.
export async function deleteAccount() {
  const user = auth.currentUser
  if (!user) throw new Error('You need to be logged in to delete your account.')
  await deleteDoc(doc(db, 'users', user.uid))
  await deleteUser(user)
}

// --- Civil Engineer detailed registration ---
// Used by the dedicated "Civil Engineer Registration Form"
// (src/pages/auth/CivilEngineerRegister.jsx). Creates the auth account,
// uploads all supporting documents/images to Storage, and writes a rich
// engineer profile to Firestore. Kept separate from registerWithEmail()
// so the simple Register.jsx flow is untouched.

// Shared file-upload helper — used by registration and by the profile
// editors when someone changes their photo/resume/certificate/etc. after
// signing up.
export async function uploadUserFile(file, path) {
  if (!file) return null
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

async function uploadIfPresent(file, path) {
  return uploadUserFile(file, path)
}

export async function registerCivilEngineer({
  name,
  email,
  password,
  phone,
  phoneVerified,
  photoFile,
  resumeFile,
  degreeFile,
  govIdFile,
  portfolioFiles = [],
  ...profileFields
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await sendEmailVerification(cred.user)

  const uid = cred.user.uid

  const [photoURL, resumeURL, degreeCertificateURL, govIdURL] = await Promise.all([
    uploadIfPresent(photoFile, `avatars/${uid}/${Date.now()}-${photoFile?.name || 'photo'}`),
    uploadIfPresent(resumeFile, `engineers/${uid}/resume-${Date.now()}-${resumeFile?.name || 'resume'}`),
    uploadIfPresent(degreeFile, `engineers/${uid}/degree-${Date.now()}-${degreeFile?.name || 'degree'}`),
    uploadIfPresent(govIdFile, `engineers/${uid}/govid-${Date.now()}-${govIdFile?.name || 'govid'}`),
  ])

  const portfolioURLs = (
    await Promise.all(
      portfolioFiles.map((file, i) =>
        uploadIfPresent(file, `engineers/${uid}/portfolio-${Date.now()}-${i}-${file.name}`),
      ),
    )
  ).filter(Boolean)

  await createUserProfile(uid, {
    ...profileFields,
    name,
    email,
    role: 'civilEngineer',
    phone: phone || null,
    phoneVerified: !!phoneVerified,
    photoURL,
    resumeURL,
    degreeCertificateURL,
    govIdURL,
    portfolioURLs,
  })

  return cred.user
}
