// Authentication service functions.
// Covers: Email/Password, Google, Phone OTP, Facebook, LinkedIn(*),
// Forgot Password, Email Verification. (LinkedIn requires a custom
// OAuth provider configured in the Firebase console under
// Authentication > Sign-in method > OpenID Connect.)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, facebookProvider } from './config'

const VALID_ROLES = [
  'client',
  'admin',
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

export async function loginWithGoogle(role = 'client') {
  const cred = await signInWithPopup(auth, googleProvider)
  await createUserProfile(cred.user.uid, {
    name: cred.user.displayName,
    email: cred.user.email,
    role,
  }, { onlyIfMissing: true })
  return cred.user
}

export async function loginWithFacebook(role = 'client') {
  const cred = await signInWithPopup(auth, facebookProvider)
  await createUserProfile(cred.user.uid, {
    name: cred.user.displayName,
    email: cred.user.email,
    role,
  }, { onlyIfMissing: true })
  return cred.user
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
