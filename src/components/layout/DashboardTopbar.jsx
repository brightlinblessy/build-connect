import { Bell, MessageSquare, Search, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function DashboardTopbar({ title = 'Dashboard', onMenuClick }) {
  const { profile } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-ink-100 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 -ml-2" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-ink-100 rounded-lg px-3 py-2 w-72">
          <Search size={16} className="text-ink-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/client/messages" className="relative p-2 text-ink-700 hover:text-brand-600">
          <MessageSquare size={20} />
        </Link>
        <Link to="/client/notifications" className="relative p-2 text-ink-700 hover:text-brand-600">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </Link>
        <div className="flex items-center gap-2 pl-3 border-l border-ink-100">
          <img
            src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'User')}`}
            alt=""
            className="w-9 h-9 rounded-full bg-ink-100"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-ink-900 leading-tight">{profile?.name || 'Guest'}</p>
            <p className="text-xs text-ink-500 capitalize leading-tight">{profile?.role || title}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
