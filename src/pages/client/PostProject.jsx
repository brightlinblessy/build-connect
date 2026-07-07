import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { postProject } from '../../firebase/firestore'
import { categories } from '../../data/mockData'

export default function PostProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    description: '',
    visibility: 'Public',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (user) {
        await postProject(user.uid, form)
      }
      setDone(true)
      setTimeout(() => navigate('/client/projects'), 1200)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Post New Project" subtitle="Describe your project so engineers can send accurate quotes." />

      <div className="max-w-2xl card p-6">
        {done && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
            Project posted! Redirecting to your projects...
          </p>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Project Title</label>
            <input
              required
              placeholder="Enter project title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Budget Min (₹)</label>
              <input
                type="number"
                placeholder="200000"
                value={form.budgetMin}
                onChange={(e) => set('budgetMin', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Budget Max (₹)</label>
              <input
                type="number"
                placeholder="500000"
                value={form.budgetMax}
                onChange={(e) => set('budgetMax', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
            <textarea
              rows={4}
              placeholder="Provide details about your project..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Attachments</label>
            <div className="border-2 border-dashed border-ink-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink-500 cursor-pointer hover:border-brand-400">
              <UploadCloud size={22} />
              <p className="text-sm">Choose Files</p>
              <p className="text-xs">PDF, DOC, JPG, PNG (Max 20MB)</p>
              <input type="file" multiple className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Visibility</label>
            <div className="flex gap-3">
              {['Public', 'Private'].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => set('visibility', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    form.visibility === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-300 text-ink-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  )
}
