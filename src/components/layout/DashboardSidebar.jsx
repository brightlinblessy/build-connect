import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Building2, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../firebase/auth'
import { listenToNotifications } from '../../firebase/firestore'
import { avatarUrl } from '../../data/constants'
import { ROLE_CONFIGS } from '../../utils/roles'

export default function DashboardSidebar({ items }) {
  const { profile, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const unsub = listenToNotifications(user.uid, (data) => {
      setUnreadCount(data.filter((n) => !n.read).length)
    })
    return unsub
  }, [user])

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-white h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Building2 size={18} className="text-white" />
        </span>
        <span className="font-bold text-base">BuildConnect</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const badge = item.badgeKey === 'notifications' ? unreadCount : item.badge
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'sidebar-link-active' : 'sidebar-link')}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <img
            src={profile?.photoURL || avatarUrl(profile?.name || 'User')}
            alt=""
            className="w-8 h-8 rounded-full bg-white/10 object-cover shrink-0"
            style={{ border: `1.5px solid ${ROLE_CONFIGS[profile?.role || 'client']?.hex || '#2563EB'}` }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate text-white">{profile?.name || 'Guest User'}</p>
            <span
              className={`inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 mt-0.5 rounded-full ${
                ROLE_CONFIGS[profile?.role || 'client']?.sidebarClass || 'text-blue-300 bg-blue-900/30'
              }`}
            >
              {ROLE_CONFIGS[profile?.role || 'client']?.label || 'Client'}
            </span>
          </div>
        </div>
        <button onClick={() => logout()} className="sidebar-link w-full">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
