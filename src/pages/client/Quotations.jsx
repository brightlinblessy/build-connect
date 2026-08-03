import { useEffect, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getQuotationsByClient, acceptQuotation, rejectQuotation } from '../../firebase/firestore'

export default function Quotations() {
  const { user } = useAuth()
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    getQuotationsByClient(user.uid)
      .then((data) => active && setQuotations(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function handleAccept(q) {
    setBusyId(q.id)
    setError('')
    try {
      await acceptQuotation(q)
      setQuotations((prev) =>
        prev.map((x) => (x.id === q.id ? { ...x, status: 'Accepted' } : x.projectId === q.projectId && x.status === 'Pending' ? { ...x, status: 'Rejected' } : x)),
      )
    } catch (err) {
      setError(err?.message || 'Could not accept this quotation.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(q) {
    setBusyId(q.id)
    setError('')
    try {
      await rejectQuotation(q)
      setQuotations((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'Rejected' } : x)))
    } catch (err) {
      setError(err?.message || 'Could not reject this quotation.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Received Quotations" subtitle="Review and respond to quotes from engineers." />
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-500">Loading quotations...</p>
      ) : quotations.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">
            No quotations yet. Once you post a project, engineers will send quotes here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink-900 text-sm">{q.projectTitle || 'Project'}</p>
                <p className="text-xs text-ink-500 mt-0.5">from {q.engineerName || 'an engineer'}</p>
                {q.description && <p className="text-xs text-ink-500 mt-1 max-w-md">{q.description}</p>}
              </div>
              <div className="flex items-center gap-6">
                <p className="text-base font-bold text-ink-900">
                  {q.amount ? `₹${Number(q.amount).toLocaleString('en-IN')}` : '—'}
                </p>
                <StatusBadge status={q.status} />
                {q.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(q)}
                      disabled={busyId === q.id}
                      className="btn-primary px-4 py-1.5 text-xs disabled:opacity-60"
                    >
                      {busyId === q.id ? 'Working...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(q)}
                      disabled={busyId === q.id}
                      className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
