import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { latestProjects, recentQuotations } from '../../data/mockData'

export default function SubmitQuotation() {
  const [form, setForm] = useState({
    projectTitle: latestProjects[0].title,
    cost: '',
    duration: '',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Project Title</label>
              <select value={form.projectTitle} onChange={(e) => set('projectTitle', e.target.value)} className="input-field">
                {latestProjects.map((p) => (
                  <option key={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Estimated Cost (₹)</label>
                <input
                  type="number"
                  placeholder="245000"
                  value={form.cost}
                  onChange={(e) => set('cost', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Duration (Days)</label>
                <input
                  type="number"
                  placeholder="60"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="Provide details about your quotation..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Attachments</label>
              <div className="border-2 border-dashed border-ink-300 rounded-lg py-6 flex flex-col items-center gap-2 text-ink-500 cursor-pointer hover:border-brand-400">
                <UploadCloud size={20} />
                <p className="text-sm">Choose Files</p>
                <p className="text-xs">PDF, Excel, DOC (Max 20MB)</p>
                <input type="file" multiple className="hidden" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              Submit Quotation
            </button>
          </form>
        </div>

        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-ink-900 mb-4">Submitted Quotations</h3>
          <ul className="divide-y divide-ink-100 text-sm">
            {recentQuotations.map((q) => (
              <li key={q.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">{q.project}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{q.amount}</p>
                </div>
                <StatusBadge status={q.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
