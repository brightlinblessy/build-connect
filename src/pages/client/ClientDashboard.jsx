import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis } from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import {
  clientDashboardStats,
  projectOverviewData,
  recentProjects,
  recentQuotations,
  paymentOverview,
} from '../../data/mockData'

export default function ClientDashboard() {
  const total = projectOverviewData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your projects."
        action={
          <Link to="/client/post-project" className="btn-primary">
            + Post New Project
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {clientDashboardStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Overview donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4">Project Overview</h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectOverviewData}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
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

        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Recent Projects</h3>
            <Link to="/client/projects" className="text-xs font-medium text-brand-600 hover:underline">
              View All
            </Link>
          </div>
          <ul className="divide-y divide-ink-100">
            {recentProjects.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.title}</p>
                  <p className="text-xs text-ink-500">{p.location}</p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Recent Quotations</h3>
            <Link to="/client/quotations" className="text-xs font-medium text-brand-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                  <th className="pb-2 font-medium">Project Title</th>
                  <th className="pb-2 font-medium">Engineer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {recentQuotations.map((q) => (
                  <tr key={q.id}>
                    <td className="py-3 text-ink-900">{q.project}</td>
                    <td className="py-3 text-ink-500">{q.engineer}</td>
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

        {/* Payment Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-ink-900">Payment Overview</h3>
            <span className="text-xs text-ink-500">{paymentOverview.period}</span>
          </div>
          <p className="text-2xl font-bold text-ink-900 mb-4">{paymentOverview.total}</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentOverview.points}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
