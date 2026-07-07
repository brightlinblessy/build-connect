import { NavLink } from 'react-router-dom'
import { Building2, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../firebase/auth'

export default function DashboardSidebar({ items }) {
  const { profile } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-900 text-white h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Building2 size={18} className="text-white" />
        </span>
        <span className="font-bold text-base">BuildConnect</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'sidebar-link-active' : 'sidebar-link')}
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <img
            src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'User')}`}
            alt=""
            className="w-8 h-8 rounded-full bg-white/10"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name || 'Guest User'}</p>
            <p className="text-xs text-slate-400 capitalize truncate">{profile?.role || 'client'}</p>
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
