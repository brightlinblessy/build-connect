import { useEffect, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getProjectsByEngineer, updateProjectStatus } from '../../firebase/firestore'

const NEXT_STATUS = {
  'In Progress': 'In Review',
  'In Review': 'Completed',
}

export default function ActiveProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getProjectsByEngineer(user.uid)
      .then((data) => active && setProjects(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function advance(project) {
    const next = NEXT_STATUS[project.status]
    if (!next) return
    setBusyId(project.id)
    try {
      await updateProjectStatus(project.id, next)
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: next } : p)))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Active Projects" subtitle="Projects you're currently working on." />

      {loading ? (
        <p className="text-sm text-ink-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">
            No active projects yet. Submit a quotation on an open project to get started.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-4 font-medium text-ink-900">{p.title}</td>
                  <td className="px-5 py-4 text-ink-500">{p.location || '—'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {NEXT_STATUS[p.status] && (
                      <button
                        onClick={() => advance(p)}
                        disabled={busyId === p.id}
                        className="text-brand-600 text-xs font-medium hover:underline disabled:opacity-60"
                      >
                        {busyId === p.id ? 'Updating...' : `Mark as ${NEXT_STATUS[p.status]}`}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
