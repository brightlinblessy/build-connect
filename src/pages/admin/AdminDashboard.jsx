import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import { adminOverviewStats } from '../../data/mockData'

const registrationData = [
  { month: 'Jan', users: 1800 },
  { month: 'Feb', users: 2200 },
  { month: 'Mar', users: 2600 },
  { month: 'Apr', users: 3100 },
  { month: 'May', users: 3600 },
  { month: 'Jun', users: 4200 },
]

const revenueData = [
  { month: 'Jan', revenue: 320000 },
  { month: 'Feb', revenue: 410000 },
  { month: 'Mar', revenue: 380000 },
  { month: 'Apr', revenue: 520000 },
  { month: 'May', revenue: 610000 },
  { month: 'Jun', revenue: 700000 },
]

const categoryData = [
  { name: 'Civil Engineer', value: 35, color: '#2563EB' },
  { name: 'Architect', value: 20, color: '#7C3AED' },
  { name: 'Structural', value: 18, color: '#A855F7' },
  { name: 'MEP', value: 15, color: '#0D9488' },
  { name: 'Contractor', value: 12, color: '#F97316' },
]

const recentActivities = [
  { id: 1, text: 'New user registered', time: '5 mins ago' },
  { id: 2, text: 'New project posted', time: '20 mins ago' },
  { id: 3, text: 'Payment received', time: '45 mins ago' },
  { id: 4, text: 'New engineer verified', time: '1 hour ago' },
]

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Platform-wide analytics and activity." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {adminOverviewStats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xl font-bold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500 mt-1">{s.label}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm">User Registrations</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm">Revenue Overview</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm">Top Categories</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" innerRadius={30} outerRadius={54} strokeWidth={0}>
                    {categoryData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-xs">
              {categoryData.map((d) => (
                <li key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-ink-700">{d.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-ink-900 mb-4 text-sm">Recent Activities</h3>
        <ul className="divide-y divide-ink-100">
          {recentActivities.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-ink-900">{a.text}</span>
              <span className="text-xs text-ink-500">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
