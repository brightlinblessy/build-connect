import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile } from '../firebase/auth'

const AuthContext = createContext(null)

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Right after registration, the Firestore profile document can take a
// moment to finish writing while `onAuthStateChanged` has already fired.
// Retry a few times with a short backoff before giving up, instead of
// permanently treating the user as "no role".
async function fetchProfileWithRetry(uid, attempts = 6, delayMs = 350) {
  for (let i = 0; i < attempts; i++) {
    const profile = await getUserProfile(uid)
    if (profile) return profile
    if (i < attempts - 1) await wait(delayMs)
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const currentUid = useRef(null)

  const loadProfile = useCallback(async (uid) => {
    setProfileError(null)
    try {
      const p = await fetchProfileWithRetry(uid)
      // Ignore stale results if the user has since changed/logged out.
      if (currentUid.current !== uid) return
      if (!p) {
        setProfile(null)
        setProfileError('not-found')
      } else {
        setProfile(p)
      }
    } catch (err) {
      console.error('Failed to load user profile', err)
      if (currentUid.current !== uid) return
      setProfile(null)
      setProfileError(err?.code === 'permission-denied' ? 'permission-denied' : 'error')
    } finally {
      if (currentUid.current === uid) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      currentUid.current = firebaseUser?.uid ?? null

      if (firebaseUser) {
        setLoading(true)
        loadProfile(firebaseUser.uid)
      } else {
        setProfile(null)
        setProfileError(null)
        setLoading(false)
      }
    })
    return unsub
  }, [loadProfile])

  const refreshProfile = useCallback(() => {
    if (currentUid.current) {
      setLoading(true)
      loadProfile(currentUid.current)
    }
  }, [loadProfile])

  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    isAuthenticated: !!user,
    profileError,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
