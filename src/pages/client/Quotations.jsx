import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { recentQuotations } from '../../data/mockData'

export default function Quotations() {
  return (
    <div>
      <PageHeader title="Received Quotations" subtitle="Review and respond to quotes from engineers." />
      <div className="space-y-4">
        {recentQuotations.map((q) => (
          <div key={q.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink-900 text-sm">{q.project}</p>
              <p className="text-xs text-ink-500 mt-0.5">from {q.engineer}</p>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-base font-bold text-ink-900">{q.amount}</p>
              <StatusBadge status={q.status} />
              {q.status === 'Pending' && (
                <div className="flex gap-2">
                  <button className="btn-primary px-4 py-1.5 text-xs">Accept</button>
                  <button className="btn-secondary px-4 py-1.5 text-xs">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
