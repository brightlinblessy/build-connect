import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { recentQuotations } from '../../data/mockData'

export default function AdminPayments() {
  return (
    <div>
      <PageHeader title="Payments & Revenue" subtitle="Platform-wide payment activity and commission tracking." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value="₹45,80,000" icon="Wallet" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Platform Commission" value="₹4,58,000" icon="Percent" color="text-brand-600" bg="bg-brand-50" />
        <StatCard label="Pending Payouts" value="₹3,20,000" icon="Clock" color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Disputed Payments" value="4" icon="AlertTriangle" color="text-red-600" bg="bg-red-50" />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Engineer</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {recentQuotations.map((q) => (
              <tr key={q.id}>
                <td className="px-5 py-4 font-medium text-ink-900">{q.project}</td>
                <td className="px-5 py-4 text-ink-500">{q.engineer}</td>
                <td className="px-5 py-4 text-ink-900">{q.amount}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={q.status === 'Accepted' ? 'Paid' : 'Pending'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
