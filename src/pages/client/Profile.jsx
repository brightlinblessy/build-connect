import { useState } from 'react'
import { Camera } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: '',
    location: '',
    company: '',
  })

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal and account information." />
      <div className="max-w-2xl card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(form.name || 'User')}`}
              alt=""
              className="w-20 h-20 rounded-full bg-brand-50"
            />
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center border-2 border-white">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="font-semibold text-ink-900">{form.name || 'Your Name'}</p>
            <p className="text-xs text-ink-500 capitalize">{profile?.role || 'Client'}</p>
          </div>
        </div>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
            <input value={form.email} disabled className="input-field bg-ink-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, State"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Company (optional)</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="button" className="btn-primary w-full py-2.5">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
