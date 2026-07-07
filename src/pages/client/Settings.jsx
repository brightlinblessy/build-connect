import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'

const toggles = [
  { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.' },
  { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive updates about quotations and payments via email.' },
  { key: 'smsNotif', label: 'SMS Notifications', desc: 'Get text alerts for important account activity.' },
  { key: 'marketing', label: 'Marketing Emails', desc: 'Occasional tips, offers, and product updates.' },
]

export default function Settings() {
  const [state, setState] = useState({ twoFactor: false, emailNotif: true, smsNotif: false, marketing: false })

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage security and notification preferences." />
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
        <div className="p-5">
          <button className="text-sm font-medium text-red-600 hover:underline">Delete Account</button>
        </div>
      </div>
    </div>
  )
}
