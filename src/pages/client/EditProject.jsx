import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { UploadCloud, X, FileText, ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getDocumentById, updateProject } from '../../firebase/firestore'
import { uploadUserFile } from '../../firebase/auth'
import { categories } from '../../data/constants'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(null) // null while loading
  const [existingAttachments, setExistingAttachments] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getDocumentById('projects', id)
      .then((project) => {
        if (!active) return
        if (!project || (user && project.clientId !== user.uid)) {
          setNotFound(true)
          return
        }
        setForm({
          title: project.title || '',
          category: project.category || categories[0],
          location: project.location || '',
          budgetMin: project.budgetMin || '',
          budgetMax: project.budgetMax || '',
          deadline: project.deadline || '',
          description: project.description || '',
          visibility: project.visibility || 'Public',
        })
        setExistingAttachments(project.attachmentURLs || [])
      })
      .catch(() => setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, user])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addFiles(fileList) {
    setNewFiles((prev) => [...prev, ...Array.from(fileList || [])])
  }

  function removeNewFile(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingAttachment(index) {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSubmitting(true)
    try {
      const uploadedURLs = (
        await Promise.all(
          newFiles.map((file) => uploadUserFile(file, `projects/${user.uid}/${Date.now()}-${file.name}`)),
        )
      ).filter(Boolean)

      await updateProject(id, {
        ...form,
        attachmentURLs: [...existingAttachments, ...uploadedURLs],
      })
      setDone(true)
      setTimeout(() => navigate('/client/projects'), 1200)
    } catch (err) {
      setError(err?.message || 'Could not save changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Project" subtitle="Loading project details..." />
      </div>
    )
  }

  if (notFound) {
    return (
      <div>
        <PageHeader title="Edit Project" subtitle="This project couldn't be found." />
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500 mb-4">
            It may have been deleted, or it doesn't belong to your account.
          </p>
          <Link to="/client/projects" className="btn-primary text-sm px-4 py-2 inline-block">
            Back to My Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Project"
        subtitle="Update your project's details."
        action={
          <Link to="/client/projects" className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Projects
          </Link>
        }
      />

      <div className="max-w-2xl card p-6">
        {done && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
            Changes saved! Redirecting to your projects...
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

            {existingAttachments.length > 0 && (
              <ul className="mb-2 space-y-1">
                {existingAttachments.map((url, i) => (
                  <li key={url} className="flex items-center justify-between text-xs text-ink-700 bg-ink-100/60 rounded-lg px-3 py-2">
                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 truncate hover:underline">
                      <FileText size={13} className="shrink-0" /> Attachment {i + 1}
                    </a>
                    <button type="button" onClick={() => removeExistingAttachment(i)} className="text-ink-500 hover:text-red-600 shrink-0">
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="border-2 border-dashed border-ink-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink-500 cursor-pointer hover:border-brand-400">
              <UploadCloud size={22} />
              <p className="text-sm">Choose Files</p>
              <p className="text-xs">PDF, DOC, JPG, PNG (Max 20MB)</p>
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
            {newFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {newFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-ink-700 bg-ink-100/60 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText size={13} className="shrink-0" /> {f.name}
                    </span>
                    <button type="button" onClick={() => removeNewFile(i)} className="text-ink-500 hover:text-red-600 shrink-0">
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
