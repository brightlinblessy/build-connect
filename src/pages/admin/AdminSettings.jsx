import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'

const toggles = [
  { key: 'newRegistrations', label: 'Allow New Registrations', desc: 'Enable or disable public sign-ups.' },
  { key: 'autoVerify', label: 'Auto-Verify Engineers', desc: 'Skip manual review for new engineer accounts.' },
  { key: 'maintenance', label: 'Maintenance Mode', desc: 'Temporarily take the platform offline for users.' },
]

export default function AdminSettings() {
  const [state, setState] = useState({ newRegistrations: true, autoVerify: false, maintenance: false })

  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Configure global BuildConnect platform behavior." />
      <div className="max-w-2xl card divide-y divide-ink-100">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-ink-900">{t.label}</p>
              <p className="text-xs text-ink-500 mt-0.5">{t.desc}</p>
            </div>
            <button
              onClick={() => setState((s) => ({ ...s, [t.key]: !s[t.key] }))}
              className={`w-11 h-6 rounded-full transition relative shrink-0 ${state[t.key] ? 'bg-brand-600' : 'bg-ink-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  state[t.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
