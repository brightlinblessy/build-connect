import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { recentQuotations } from '../../data/mockData'

export default function EngineerPayments() {
  return (
    <div>
      <PageHeader title="Payments" subtitle="Track earnings and payment history." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earnings" value="₹8,40,000" icon="Wallet" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Payments" value="₹95,000" icon="Clock" color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="This Month" value="₹3,25,000" icon="TrendingUp" color="text-brand-600" bg="bg-brand-50" />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {recentQuotations.map((q) => (
              <tr key={q.id}>
                <td className="px-5 py-4 font-medium text-ink-900">{q.project}</td>
                <td className="px-5 py-4 text-ink-500">John Doe</td>
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
