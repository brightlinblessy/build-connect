import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'

const disputes = [
  { id: 'd1', project: 'Shopping Complex', raisedBy: 'Er. Neha Sharma', reason: 'Payment delay', status: 'Open' },
  { id: 'd2', project: 'Villa Construction', raisedBy: 'John Doe', reason: 'Scope disagreement', status: 'In Review' },
  { id: 'd3', project: 'Residential Building', raisedBy: 'Er. Amit Singh', reason: 'Milestone rejected', status: 'Completed' },
]

export default function Disputes() {
  return (
    <div>
      <PageHeader title="Disputes" subtitle="Resolve disputes raised between clients and engineers." />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Raised By</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {disputes.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-4 font-medium text-ink-900">{d.project}</td>
                <td className="px-5 py-4 text-ink-500">{d.raisedBy}</td>
                <td className="px-5 py-4 text-ink-700">{d.reason}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-brand-600 text-xs font-medium hover:underline">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
