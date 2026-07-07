import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { latestProjects } from '../../data/mockData'

const statuses = ['In Progress', 'In Progress', 'Completed', 'In Review']

export default function AdminProjects() {
  return (
    <div>
      <PageHeader title="Projects" subtitle="Monitor all projects posted across the platform." />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Budget</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {latestProjects.map((p, i) => (
              <tr key={p.id}>
                <td className="px-5 py-4 font-medium text-ink-900">{p.title}</td>
                <td className="px-5 py-4 text-ink-500">{p.location}</td>
                <td className="px-5 py-4 text-ink-700">{p.budget}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={statuses[i]} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-brand-600 text-xs font-medium hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
