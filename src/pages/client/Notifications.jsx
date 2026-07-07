import { FileText, UserCheck, Wallet, Clock } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { notifications } from '../../data/mockData'

const icons = { quotation: FileText, application: UserCheck, payment: Wallet, status: Clock }
const colors = {
  quotation: 'text-brand-600 bg-brand-50',
  application: 'text-violet-600 bg-violet-50',
  payment: 'text-emerald-600 bg-emerald-50',
  status: 'text-amber-600 bg-amber-50',
}

export default function Notifications() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on your projects, quotations, and payments."
        action={<button className="text-sm font-medium text-brand-600 hover:underline">Mark all as read</button>}
      />
      <div className="card divide-y divide-ink-100">
        {notifications.map((n) => {
          const Icon = icons[n.type]
          return (
            <div key={n.id} className="flex items-start gap-4 p-4">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[n.type]}`}>
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <p className="text-sm text-ink-900">{n.text}</p>
                <p className="text-xs text-ink-500 mt-0.5">{n.time}</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-brand-600 mt-2" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
