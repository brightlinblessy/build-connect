import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, X, FileText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { postProject } from '../../firebase/firestore'
import { uploadUserFile } from '../../firebase/auth'
import { categories } from '../../data/constants'

export default function PostProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    location: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    description: '',
    visibility: 'Public',
  })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addFiles(fileList) {
    setFiles((prev) => [...prev, ...Array.from(fileList || [])])
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSubmitting(true)
    try {
      const attachmentURLs = (
        await Promise.all(
          files.map((file) => uploadUserFile(file, `projects/${user.uid}/${Date.now()}-${file.name}`)),
        )
      ).filter(Boolean)

      await postProject(user.uid, { ...form, attachmentURLs })
      setDone(true)
      setTimeout(() => navigate('/client/projects'), 1200)
    } catch (err) {
      setError(err?.message || 'Could not post the project. Please try again.')
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
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">{error}</p>}
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

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Location</label>
            <input
              placeholder="City, State"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className="input-field"
            />
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
            <label className="border-2 border-dashed border-ink-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink-500 cursor-pointer hover:border-brand-400">
              <UploadCloud size={22} />
              <p className="text-sm">Choose Files</p>
              <p className="text-xs">PDF, DOC, JPG, PNG (Max 20MB)</p>
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-ink-700 bg-ink-100/60 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText size={13} className="shrink-0" /> {f.name}
                    </span>
                    <button type="button" onClick={() => removeFile(i)} className="text-ink-500 hover:text-red-600 shrink-0">
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
