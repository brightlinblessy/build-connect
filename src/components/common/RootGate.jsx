import { Navigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dashboardPathForRole } from '../../utils/roles'
import ProfileIssue from './ProfileIssue'
import Home from '../../pages/public/Home'

// The very first screen of the app. Renders nothing but a brief loading
// state, then sends the visitor to the right place:
//   - not logged in            -> the public marketing Home page (with
//                                 Login/Register in the header)
//   - logged in as client      -> /client/dashboard
//   - logged in as an engineer -> /engineer/dashboard
//   - logged in but no role yet -> diagnostic screen (never a redirect
//     loop, even if the profile doc failed to load)
export default function RootGate() {
  const { isAuthenticated, role, loading, profileError } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-ink-100/60">
        <span className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse">
          <Building2 size={22} className="text-white" />
        </span>
        <p className="text-sm text-ink-500">Loading BuildConnect...</p>
      </div>
    )
  }

  if (!isAuthenticated) return <Home />

  if (!role) return <ProfileIssue reason={profileError} />

  return <Navigate to={dashboardPathForRole(role)} replace />
}
