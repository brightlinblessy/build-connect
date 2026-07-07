import * as Icons from 'lucide-react'

export default function StatCard({ label, value, icon, color = 'text-brand-600', bg = 'bg-brand-50', change }) {
  const Icon = Icons[icon] || Icons.Circle
  return (
    <div className="card p-5 flex items-center gap-4">
      <span className={`w-11 h-11 rounded-lg flex items-center justify-center ${bg} ${color}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xl font-bold text-ink-900 leading-tight">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
        {change && <p className="text-xs text-emerald-600 font-medium mt-0.5">{change}</p>}
      </div>
    </div>
  )
}
