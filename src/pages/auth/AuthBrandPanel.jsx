import { Building2, ShieldCheck, MessageSquare, CreditCard } from 'lucide-react'
import { heroStats } from '../../data/mockData'

const features = [
  { icon: ShieldCheck, text: 'Verified civil engineers, architects & contractors' },
  { icon: MessageSquare, text: 'Real-time chat & quotation tracking' },
  { icon: CreditCard, text: 'Secure milestone-based payments' },
]

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[46%] shrink-0 bg-navy-900 text-white px-12 py-12 overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 size={22} className="text-white" />
          </span>
          <span className="text-xl font-bold">BuildConnect</span>
        </div>
        <p className="text-slate-400 text-sm mt-1 ml-0.5">Civil Engineer Marketplace</p>
      </div>

      <div className="relative">
        <h1 className="text-3xl font-bold leading-tight">
          Find &amp; hire the best construction professionals for your project
        </h1>
        <p className="text-slate-300 text-sm mt-4 max-w-sm">
          Clients, engineers, architects, contractors and admins all work from one connected
          platform — post projects, submit quotations, chat, and manage payments in one place.
        </p>

        <ul className="mt-8 space-y-4">
          {features.map((f) => (
            <li key={f.text} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <f.icon size={16} />
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative grid grid-cols-4 gap-4 pt-8 border-t border-white/10">
        {heroStats.map((s) => (
          <div key={s.label}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
