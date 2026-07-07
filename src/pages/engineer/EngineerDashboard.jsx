import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis } from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { projectOverviewData, recentQuotations, paymentOverview } from '../../data/mockData'

const stats = [
  { label: 'Applied Projects', value: 18, icon: 'Send', color: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Active Projects', value: 3, icon: 'Loader', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Completed', value: 27, icon: 'CheckCircle2', color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Total Earnings', value: '₹8,40,000', icon: 'Wallet', color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function EngineerDashboard() {
  const total = projectOverviewData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Track your applications, active work, and earnings."
        action={
          <Link to="/engineer/projects" className="btn-primary">
            Browse Projects
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4">Project Status Overview</h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectOverviewData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                    {projectOverviewData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ink-900">{total}</span>
                <span className="text-xs text-ink-500">Total</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {projectOverviewData.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-ink-700">{d.name}</span>
                  <span className="text-ink-500">({d.value})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-ink-900">Earnings Overview</h3>
            <span className="text-xs text-ink-500">{paymentOverview.period}</span>
          </div>
          <p className="text-2xl font-bold text-ink-900 mb-4">{paymentOverview.total}</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentOverview.points}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-ink-900 mb-4">My Recent Quotations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="pb-2 font-medium">Project</th>
              <th className="pb-2 font-medium">Amount</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {recentQuotations.map((q) => (
              <tr key={q.id}>
                <td className="py-3 text-ink-900">{q.project}</td>
                <td className="py-3 text-ink-900 font-medium">{q.amount}</td>
                <td className="py-3">
                  <StatusBadge status={q.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
