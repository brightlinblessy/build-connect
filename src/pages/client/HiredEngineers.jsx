import { Star } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { featuredEngineers, avatarUrl } from '../../data/mockData'

export default function HiredEngineers() {
  return (
    <div>
      <PageHeader title="Hired Engineers" subtitle="Professionals currently working on your projects." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredEngineers.map((eng) => (
          <div key={eng.id} className="card p-5 flex flex-col items-center text-center">
            <img src={avatarUrl(eng.avatarSeed)} alt={eng.name} className="w-16 h-16 rounded-full bg-brand-50" />
            <h3 className="mt-3 font-semibold text-ink-900 text-sm">{eng.name}</h3>
            <p className="text-xs text-ink-500">{eng.title}</p>
            <p className="flex items-center gap-1 text-xs text-amber-500 font-medium mt-1">
              <Star size={13} fill="currentColor" /> {eng.rating} ({eng.reviews})
            </p>
            <button className="btn-secondary w-full mt-4 text-xs py-2">Message</button>
          </div>
        ))}
      </div>
    </div>
  )
}
