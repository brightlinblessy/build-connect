import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getProjectsByClient, deleteDocument } from '../../firebase/firestore'

function formatBudget(p) {
  if (!p.budgetMin && !p.budgetMax) return '—'
  const min = p.budgetMin ? Number(p.budgetMin).toLocaleString('en-IN') : null
  const max = p.budgetMax ? Number(p.budgetMax).toLocaleString('en-IN') : null
  if (min && max) return `₹${min} - ₹${max}`
  return `₹${min || max}`
}

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(projectId) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeletingId(projectId)
    try {
      await deleteDocument('projects', projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch {
      window.alert('Could not delete the project. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (!user) return
    let active = true
    getProjectsByClient(user.uid)
      .then((data) => active && setProjects(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

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

      {loading ? (
        <p className="text-sm text-ink-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500 mb-4">You haven't posted any projects yet.</p>
          <Link to="/client/post-project" className="btn-primary text-sm px-4 py-2 inline-block">
            Post Your First Project
          </Link>
        </div>
      ) : (
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
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-4 font-medium text-ink-900">{p.title}</td>
                  <td className="px-5 py-4 text-ink-500">{p.location || '—'}</td>
                  <td className="px-5 py-4 text-ink-700">{formatBudget(p)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status || 'Open'} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link to="/client/quotations" className="text-brand-600 text-xs font-medium hover:underline">
                        View Quotes
                      </Link>
                      <Link
                        to={`/client/projects/${p.id}/edit`}
                        className="text-ink-500 hover:text-brand-600"
                        title="Edit project"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-ink-500 hover:text-red-600 disabled:opacity-50"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
