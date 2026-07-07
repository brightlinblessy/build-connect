import { ShieldCheck, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { featuredEngineers, avatarUrl } from '../../data/mockData'

export default function Verification() {
  return (
    <div>
      <PageHeader title="Verification" subtitle="Approve engineer credentials and certifications." />
      <div className="space-y-4">
        {featuredEngineers.map((eng) => (
          <div key={eng.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={avatarUrl(eng.avatarSeed)} alt="" className="w-10 h-10 rounded-full bg-brand-50" />
              <div>
                <p className="font-medium text-ink-900 text-sm">{eng.name}</p>
                <p className="text-xs text-ink-500">{eng.title} &middot; Certificate uploaded</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 btn-primary text-xs py-1.5 px-4">
                <ShieldCheck size={13} /> Approve
              </button>
              <button className="flex items-center gap-1.5 btn-secondary text-xs py-1.5 px-4">
                <X size={13} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
