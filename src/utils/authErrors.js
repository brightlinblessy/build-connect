// Maps Firebase Auth / Firestore error codes to short, friendly messages
// so the Login/Register/ForgotPassword screens never show raw
// "Firebase: Error (auth/xyz)." strings to the user.

const MESSAGES = {
  'auth/invalid-email': 'That email address looks invalid. Double-check and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/user-not-found': 'No account found with that email. Check the email or register.',
  'auth/wrong-password': 'Incorrect password. Try again or reset your password.',
  'auth/invalid-credential': 'Incorrect email or password. Try again or reset your password.',
  'auth/invalid-login-credentials': 'Incorrect email or password. Try again or reset your password.',
  'auth/email-already-in-use': 'An account already exists with this email. Try logging in instead.',
  'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing. Please try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/invalid-verification-code': 'That verification code is incorrect. Please try again.',
  'auth/invalid-phone-number': 'That phone number looks invalid. Include the country code.',
  'auth/missing-password': 'Please enter your password.',
  'permission-denied': "You don't have permission to do that.",
}

export function getAuthErrorMessage(err) {
  const code = err?.code || ''
  if (MESSAGES[code]) return MESSAGES[code]
  // Fall back to a cleaned-up version of Firebase's raw message.
  const raw = (err?.message || 'Something went wrong. Please try again.')
    .replace('Firebase: ', '')
    .replace(/\s*\(auth\/[a-z-]+\)\.?/i, '')
  return raw
}
