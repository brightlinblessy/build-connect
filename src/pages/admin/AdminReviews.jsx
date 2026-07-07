import { Star, Trash2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { featuredEngineers, avatarUrl } from '../../data/mockData'

export default function AdminReviews() {
  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate reviews submitted across the platform." />
      <div className="space-y-4">
        {featuredEngineers.map((eng) => (
          <div key={eng.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={avatarUrl(eng.avatarSeed)} alt="" className="w-10 h-10 rounded-full bg-brand-50" />
              <div>
                <p className="font-medium text-ink-900 text-sm">{eng.name}</p>
                <p className="text-xs text-ink-500">"Great communication and quality work."</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star size={13} fill="currentColor" /> {eng.rating}
              </span>
              <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
