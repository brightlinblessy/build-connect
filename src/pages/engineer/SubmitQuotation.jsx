import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UploadCloud, X, FileText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getOpenProjects, getQuotationsByEngineer, submitQuotation, pushNotification } from '../../firebase/firestore'
import { uploadUserFile } from '../../firebase/auth'

export default function SubmitQuotation() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const preselectedProjectId = searchParams.get('project')

  const [projects, setProjects] = useState([])
  const [myQuotations, setMyQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  const [projectId, setProjectId] = useState('')
  const [cost, setCost] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getOpenProjects(), getQuotationsByEngineer(user.uid)])
      .then(([proj, quotes]) => {
        if (!active) return
        setProjects(proj)
        setMyQuotations(quotes)
        setProjectId(preselectedProjectId || proj[0]?.id || '')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function addFiles(fileList) {
    setFiles((prev) => [...prev, ...Array.from(fileList || [])])
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user || !projectId) return
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    setError('')
    setSubmitting(true)
    try {
      const attachmentURLs = (
        await Promise.all(
          files.map((file) => uploadUserFile(file, `quotations/${user.uid}/${Date.now()}-${file.name}`)),
        )
      ).filter(Boolean)

      await submitQuotation({
        projectId: project.id,
        projectTitle: project.title,
        clientId: project.clientId,
        engineerId: user.uid,
        engineerName: profile?.name || '',
        amount: Number(cost),
        durationDays: Number(duration) || null,
        description,
        attachmentURLs,
      })

      await pushNotification(project.clientId, {
        type: 'quotation',
        title: 'New quotation received',
        message: `${profile?.name || 'An engineer'} sent a quotation for "${project.title}".`,
      })

      const refreshed = await getQuotationsByEngineer(user.uid)
      setMyQuotations(refreshed)
      setCost('')
      setDuration('')
      setDescription('')
      setFiles([])
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 2500)
    } catch (err) {
      setError(err?.message || 'Could not submit the quotation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="My Quotations" subtitle="Submit a quotation for a project and track your submissions." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Quotation Submission</h3>
          {submitted && (
            <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
              Quotation submitted successfully!
            </p>
          )}
          {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">{error}</p>}

          {loading ? (
            <p className="text-sm text-ink-500">Loading open projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-ink-500">There are no open projects to quote on right now. Check back soon!</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Project Title</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-field">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Estimated Cost (₹)</label>
                  <input
                    required
                    type="number"
                    placeholder="245000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide details about your quotation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Attachments</label>
                <label className="border-2 border-dashed border-ink-300 rounded-lg py-6 flex flex-col items-center gap-2 text-ink-500 cursor-pointer hover:border-brand-400">
                  <UploadCloud size={20} />
                  <p className="text-sm">Choose Files</p>
                  <p className="text-xs">PDF, Excel, DOC (Max 20MB)</p>
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
              <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Quotation'}
              </button>
            </form>
          )}
        </div>

        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-ink-900 mb-4">Submitted Quotations</h3>
          {myQuotations.length === 0 ? (
            <p className="text-sm text-ink-500">You haven't submitted any quotations yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 text-sm">
              {myQuotations.map((q) => (
                <li key={q.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900">{q.projectTitle || 'Project'}</p>
                    <p className="text-xs text-ink-500 mt-0.5">₹{Number(q.amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
