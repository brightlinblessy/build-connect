import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { recentProjects } from '../../data/mockData'

export default function ActiveProjects() {
  return (
    <div>
      <PageHeader title="Active Projects" subtitle="Projects you're currently working on." />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Client Location</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {recentProjects.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-4 font-medium text-ink-900">{p.title}</td>
                <td className="px-5 py-4 text-ink-500">{p.location}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-brand-600 text-xs font-medium hover:underline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
