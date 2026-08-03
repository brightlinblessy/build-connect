import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { getOpenProjects } from '../../firebase/firestore'

function formatBudget(p) {
  if (!p.budgetMin && !p.budgetMax) return 'Budget on request'
  const min = p.budgetMin ? Number(p.budgetMin).toLocaleString('en-IN') : null
  const max = p.budgetMax ? Number(p.budgetMax).toLocaleString('en-IN') : null
  if (min && max) return `₹${min} - ₹${max}`
  return `₹${min || max}`
}

export default function AvailableProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getOpenProjects()
      .then((data) => active && setProjects(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <PageHeader title="Available Projects" subtitle="Browse open projects and submit your quotation." />

      {loading ? (
        <p className="text-sm text-ink-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">No open projects right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="card p-5">
              <h3 className="font-semibold text-ink-900">{p.title}</h3>
              <p className="flex items-center gap-1.5 text-xs text-ink-500 mt-2">
                <MapPin size={13} /> {p.location || p.category || 'Location not set'}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                <Wallet size={13} /> {formatBudget(p)}
              </p>
              {p.description && <p className="text-xs text-ink-700 mt-2 line-clamp-2">{p.description}</p>}
              <Link to={`/engineer/quotations?project=${p.id}`} className="btn-primary w-full mt-4 text-sm py-2 text-center">
                Submit Quotation
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
