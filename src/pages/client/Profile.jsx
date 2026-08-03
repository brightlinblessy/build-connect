import { useState } from 'react'
import { Camera, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile, uploadUserFile } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    company: profile?.company || '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(file) {
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)
    try {
      let photoURL
      if (photoFile) {
        photoURL = await uploadUserFile(photoFile, `avatars/${user.uid}/${Date.now()}-${photoFile.name}`)
      }
      await updateUserProfile(user.uid, {
        name: form.name,
        phone: form.phone,
        location: form.location,
        company: form.company,
        ...(photoURL ? { photoURL } : {}),
      })
      await refreshProfile()
      setSaved(true)
      setPhotoFile(null)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const displayPhoto =
    photoPreview || profile?.photoURL || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(form.name || 'User')}`

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal and account information." />

      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4 max-w-2xl">
          <CheckCircle2 size={15} /> Profile updated.
        </p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 max-w-2xl">{error}</p>}

      <div className="max-w-2xl card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img src={displayPhoto} alt="" className="w-20 h-20 rounded-full bg-brand-50 object-cover" />
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center border-2 border-white cursor-pointer">
              <Camera size={13} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-ink-900">{form.name || 'Your Name'}</p>
            <p className="text-xs text-ink-500 capitalize">{profile?.role || 'Client'}</p>
          </div>
        </div>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
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
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
