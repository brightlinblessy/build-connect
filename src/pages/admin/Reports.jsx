import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../../components/common/PageHeader'

const growthData = [
  { month: 'Jan', projects: 320 },
  { month: 'Feb', projects: 410 },
  { month: 'Mar', projects: 460 },
  { month: 'Apr', projects: 540 },
  { month: 'May', projects: 610 },
  { month: 'Jun', projects: 700 },
]

export default function Reports() {
  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Export platform performance reports." />
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-900 text-sm">Project Growth (6 Months)</h3>
          <button className="btn-secondary text-xs py-1.5 px-3">Export CSV</button>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="projects" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
