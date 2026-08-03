import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dashboardPathForRole } from '../../utils/roles'
import ProfileIssue from './ProfileIssue'

// Wraps the Login/Register/ForgotPassword pages so an already-authenticated
// user is bounced straight to their dashboard instead of seeing the auth
// screen again.
//
// Important: we only redirect once we actually know the role. If the user
// is authenticated but the role hasn't resolved yet, redirecting to
// dashboardPathForRole(null) would send them right back to this same
// route and loop forever — so we show the profile diagnostic instead.
export default function GuestRoute({ children }) {
  const { isAuthenticated, role, loading, profileError } = useAuth()

  if (loading) return null
  if (isAuthenticated && role) return <Navigate to={dashboardPathForRole(role)} replace />
  if (isAuthenticated && !role) return <ProfileIssue reason={profileError} />

  return children
}
