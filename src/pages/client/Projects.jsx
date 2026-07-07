import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { latestProjects } from '../../data/mockData'

const statuses = ['In Progress', 'In Progress', 'Completed', 'Completed']

export default function Projects() {
  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="All projects you've posted on BuildConnect."
        action={
          <Link to="/client/post-project" className="btn-primary">
            + Post New Project
          </Link>
        }
      />
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
                  <Link to="/client/quotations" className="text-brand-600 text-xs font-medium hover:underline">
                    View Quotes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
