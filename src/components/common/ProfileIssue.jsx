import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../firebase/auth'

const COPY = {
  'not-found': {
    title: "We couldn't find your profile",
    body: "Your account was created, but the profile record hasn't shown up yet. This can happen right after registering — try again in a moment.",
  },
  'permission-denied': {
    title: "You don't have access to this profile",
    body: 'Your account exists but Firestore is blocking access to it. Check your firestore.rules, or contact support.',
  },
  error: {
    title: 'Something went wrong loading your account',
    body: 'We hit an unexpected error fetching your profile. Please try again.',
  },
}

// Rendered instead of redirecting when a user is authenticated but we
// can't determine their role. Showing this (rather than looping between
// routes) is what prevents a blank / crashed page.
export default function ProfileIssue({ reason }) {
  const { refreshProfile } = useAuth()
  const copy = COPY[reason] || COPY.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-100/60 px-4">
      <div className="w-full max-w-md card p-8 text-center">
        <span className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} />
        </span>
        <h1 className="text-lg font-bold text-ink-900">{copy.title}</h1>
        <p className="text-sm text-ink-500 mt-2">{copy.body}</p>

        <div className="flex gap-3 mt-6">
          <button onClick={() => logout()} className="btn-secondary flex-1">
            Log out
          </button>
          <button onClick={() => refreshProfile()} className="btn-primary flex-1">
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
