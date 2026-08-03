import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'

export default function DashboardLayout({ navItems, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex bg-ink-100/60 min-h-screen">
      <DashboardSidebar items={navItems} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <div className="relative h-full">
              <button
                className="absolute -right-10 top-4 text-white p-2"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
              <DashboardSidebar items={navItems} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <DashboardTopbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
