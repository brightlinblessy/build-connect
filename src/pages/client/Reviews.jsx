import { Star } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { featuredEngineers, avatarUrl } from '../../data/mockData'

export default function Reviews() {
  return (
    <div>
      <PageHeader title="Reviews & Ratings" subtitle="Rate engineers after project completion." />
      <div className="space-y-4">
        {featuredEngineers.map((eng) => (
          <div key={eng.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={avatarUrl(eng.avatarSeed)} alt="" className="w-12 h-12 rounded-full bg-brand-50" />
              <div>
                <p className="font-medium text-ink-900 text-sm">{eng.name}</p>
                <p className="text-xs text-ink-500">{eng.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} className={i <= Math.round(eng.rating) ? 'text-amber-500' : 'text-ink-300'} fill="currentColor" />
              ))}
            </div>
            <button className="btn-secondary text-xs py-1.5 px-4">Write Review</button>
          </div>
        ))}
      </div>
    </div>
  )
}
