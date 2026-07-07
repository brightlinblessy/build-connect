import PageHeader from '../../components/common/PageHeader'
import { featuredEngineers, avatarUrl } from '../../data/mockData'

const users = [
  ...featuredEngineers.map((e) => ({ ...e, role: e.title, status: 'Active' })),
  { id: 'client-1', name: 'John Doe', title: 'Client', avatarSeed: 'John-Doe', role: 'Client', status: 'Active' },
]

export default function Users() {
  return (
    <div>
      <PageHeader title="Users" subtitle="Manage clients, engineers, and their account status." />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-4 flex items-center gap-3">
                  <img src={avatarUrl(u.avatarSeed)} alt="" className="w-8 h-8 rounded-full bg-brand-50" />
                  <span className="font-medium text-ink-900">{u.name}</span>
                </td>
                <td className="px-5 py-4 text-ink-500">{u.role}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-red-600 text-xs font-medium hover:underline">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
