import { Link } from 'react-router-dom'
import { MapPin, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { latestProjects } from '../../data/mockData'

export default function AvailableProjects() {
  return (
    <div>
      <PageHeader title="Available Projects" subtitle="Browse open projects and submit your quotation." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {latestProjects.map((p) => (
          <div key={p.id} className="card p-5">
            <h3 className="font-semibold text-ink-900">{p.title}</h3>
            <p className="flex items-center gap-1.5 text-xs text-ink-500 mt-2">
              <MapPin size={13} /> {p.location}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
              <Wallet size={13} /> {p.budget}
            </p>
            <Link to="/engineer/quotations" className="btn-primary w-full mt-4 text-sm py-2">
              Submit Quotation
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
