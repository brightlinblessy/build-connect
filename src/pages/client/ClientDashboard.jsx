import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis } from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getProjectsByClient, getQuotationsByClient, getHiredEngineers, getPaymentsByClient } from '../../firebase/firestore'

const STATUS_COLORS = {
  Open: '#94A3B8',
  'In Progress': '#2563EB',
  'In Review': '#F59E0B',
  Completed: '#16A34A',
  Cancelled: '#EF4444',
}

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [quotations, setQuotations] = useState([])
  const [hires, setHires] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([
      getProjectsByClient(user.uid),
      getQuotationsByClient(user.uid),
      getHiredEngineers(user.uid),
      getPaymentsByClient(user.uid),
    ])
      .then(([p, q, h, pay]) => {
        if (!active) return
        setProjects(p)
        setQuotations(q)
        setHires(h)
        setPayments(pay)
      })
      .catch((err) => {
        console.error('Failed to load client dashboard data:', err)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'In Progress').length
    const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return [
      { label: 'Total Projects', value: projects.length, icon: 'FolderKanban', color: 'text-brand-600', bg: 'bg-brand-50' },
      { label: 'Active Projects', value: active, icon: 'Loader', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Hired Engineers', value: hires.length, icon: 'Users', color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Total Spent', value: formatCurrency(totalSpent), icon: 'Wallet', color: 'text-amber-600', bg: 'bg-amber-50' },
    ]
  }, [projects, hires, payments])

  const projectOverviewData = useMemo(() => {
    const counts = {}
    projects.forEach((p) => {
      const status = p.status || 'Open'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#64748B' }))
  }, [projects])

  const totalProjects = projectOverviewData.reduce((sum, d) => sum + d.value, 0)
  const recentProjects = projects.slice(0, 5)
  const recentQuotations = quotations.slice(0, 5)

  const paymentPoints = useMemo(
    () =>
      [...payments]
        .filter((p) => p.createdAt?.toDate)
        .sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate())
        .slice(-8)
        .map((p) => ({ date: formatDate(p.createdAt), amount: Number(p.amount || 0) })),
    [payments],
  )
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  if (loading) return <p className="text-sm text-ink-500">Loading dashboard...</p>

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
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Overview donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4">Project Overview</h3>
          {projectOverviewData.length === 0 ? (
            <p className="text-sm text-ink-500">No projects posted yet.</p>
          ) : (
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
                  <span className="text-2xl font-bold text-ink-900">{totalProjects}</span>
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
          )}
        </div>

        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Recent Projects</h3>
            <Link to="/client/projects" className="text-xs font-medium text-brand-600 hover:underline">
              View All
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing here yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentProjects.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{p.title}</p>
                    <p className="text-xs text-ink-500">{p.location || '—'}</p>
                  </div>
                  <StatusBadge status={p.status || 'Open'} />
                </li>
              ))}
            </ul>
          )}
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
          {recentQuotations.length === 0 ? (
            <p className="text-sm text-ink-500">No quotations yet.</p>
          ) : (
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
                      <td className="py-3 text-ink-900">{q.projectTitle || 'Project'}</td>
                      <td className="py-3 text-ink-500">{q.engineerName || '—'}</td>
                      <td className="py-3 text-ink-900 font-medium">{formatCurrency(q.amount)}</td>
                      <td className="py-3">
                        <StatusBadge status={q.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-ink-900">Payment Overview</h3>
            <span className="text-xs text-ink-500">All time</span>
          </div>
          <p className="text-2xl font-bold text-ink-900 mb-4">{formatCurrency(totalPayments)}</p>
          {paymentPoints.length === 0 ? (
            <p className="text-sm text-ink-500">No payments recorded yet.</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentPoints}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
                  <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
