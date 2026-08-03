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
  'auth/requires-recent-login': 'For your security, please log out and log back in before doing this.',
  'auth/credential-already-in-use': 'That phone number is already linked to a different account.',
  'auth/provider-already-linked': 'You already have a phone number linked to this account.',
  'auth/unauthorized-domain':
    'This domain isn\u2019t authorized for sign-in yet. Add it under Firebase Console \u2192 Authentication \u2192 Settings \u2192 Authorized domains.',
  'auth/operation-not-allowed':
    'This sign-in method isn\u2019t enabled yet. Turn it on under Firebase Console \u2192 Authentication \u2192 Sign-in method.',
  'auth/internal-error': 'Something went wrong on the sign-in provider\u2019s side. Please try again.',
  'redirect-sign-in-failed': 'Sign-in failed after redirecting back. Please try again.',
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
