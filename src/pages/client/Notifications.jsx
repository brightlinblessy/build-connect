import { useEffect, useState } from 'react'
import { FileText, UserCheck, Wallet, Clock, Bell } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { listenToNotifications, markNotificationRead } from '../../firebase/firestore'

const icons = { quotation: FileText, application: UserCheck, payment: Wallet, status: Clock, hire: UserCheck }
const colors = {
  quotation: 'text-brand-600 bg-brand-50',
  application: 'text-violet-600 bg-violet-50',
  payment: 'text-emerald-600 bg-emerald-50',
  status: 'text-amber-600 bg-amber-50',
  hire: 'text-violet-600 bg-violet-50',
}

function timeAgo(ts) {
  if (!ts?.toDate) return ''
  const diffMs = Date.now() - ts.toDate().getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = listenToNotifications(user.uid, (data) => {
      setNotifications(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  function markAllRead() {
    notifications.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id))
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on your projects, quotations, and payments."
        action={
          notifications.some((n) => !n.read) && (
            <button onClick={markAllRead} className="text-sm font-medium text-brand-600 hover:underline">
              Mark all as read
            </button>
          )
        }
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="card p-10 text-center">
          <Bell size={22} className="mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500">You're all caught up — no notifications yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Bell
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className="w-full flex items-start gap-4 p-4 text-left hover:bg-ink-100/40 transition"
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[n.type] || 'text-ink-600 bg-ink-100'}`}>
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-ink-900">{n.title ? `${n.title} — ${n.message}` : n.message || n.text}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
