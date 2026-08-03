import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { avatarUrl } from '../../data/constants'
import {
  getHiredEngineersWithProfiles,
  getReviewsGivenByClient,
  getReviewsForEngineer,
  submitReview,
} from '../../firebase/firestore'
import { engineerLabel } from '../../utils/roles'

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Stars({ value, size = 18 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'text-amber-500' : 'text-ink-300'} fill="currentColor" />
      ))}
    </div>
  )
}

function ReviewModal({ hire, onClose, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ rating, comment })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-900">Review {hire.engineer?.name || hire.engineerName}</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button type="button" key={i} onClick={() => setRating(i)}>
                  <Star size={26} className={i <= rating ? 'text-amber-500' : 'text-ink-300'} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="input-field resize-none"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {saving ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ClientReviews() {
  const { user, profile } = useAuth()
  const [hires, setHires] = useState([])
  const [given, setGiven] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(null)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getHiredEngineersWithProfiles(user.uid), getReviewsGivenByClient(user.uid)])
      .then(([h, r]) => {
        if (!active) return
        setHires(h)
        setGiven(r)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function handleSubmitReview({ rating, comment }) {
    if (!user || !reviewing) return
    await submitReview({
      projectId: reviewing.projectId || null,
      clientId: user.uid,
      clientName: profile?.name || '',
      engineerId: reviewing.engineerId,
      engineerName: reviewing.engineer?.name || reviewing.engineerName || '',
      rating,
      comment,
    })
    setGiven((prev) => [...prev, { engineerId: reviewing.engineerId, rating, comment }])
  }

  if (loading) return <p className="text-sm text-ink-500">Loading...</p>

  if (hires.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-ink-500">Hire an engineer first, then come back here to leave a review.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {hires.map((hire) => {
          const existing = given.find((r) => r.engineerId === hire.engineerId)
          return (
            <div key={hire.id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={hire.engineer?.photoURL || avatarUrl(hire.engineer?.name || hire.engineerName || 'Engineer')}
                  alt=""
                  className="w-12 h-12 rounded-full bg-brand-50 object-cover"
                />
                <div>
                  <p className="font-medium text-ink-900 text-sm">{hire.engineer?.name || hire.engineerName || 'Engineer'}</p>
                  <p className="text-xs text-ink-500">{engineerLabel(hire.engineer?.role)}</p>
                </div>
              </div>
              {existing ? (
                <div className="flex items-center gap-3">
                  <Stars value={existing.rating} />
                  <span className="text-xs text-ink-500">Reviewed</span>
                </div>
              ) : (
                <button onClick={() => setReviewing(hire)} className="btn-secondary text-xs py-1.5 px-4">
                  Write Review
                </button>
              )}
            </div>
          )
        })}
      </div>
      {reviewing && <ReviewModal hire={reviewing} onClose={() => setReviewing(null)} onSubmit={handleSubmitReview} />}
    </>
  )
}

function EngineerReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getReviewsForEngineer(user.uid)
      .then((data) => active && setReviews(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  if (loading) return <p className="text-sm text-ink-500">Loading...</p>

  if (reviews.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-ink-500">No reviews yet. Reviews from clients will show up here.</p>
      </div>
    )
  }

  const average = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length

  return (
    <div>
      <div className="card p-5 flex items-center gap-4 mb-4">
        <span className="text-3xl font-bold text-ink-900">{average.toFixed(1)}</span>
        <div>
          <Stars value={average} />
          <p className="text-xs text-ink-500 mt-1">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink-900 text-sm">{r.clientName || 'A client'}</p>
              <Stars value={r.rating} size={14} />
            </div>
            {r.comment && <p className="text-sm text-ink-700 mt-2">{r.comment}</p>}
            <p className="text-xs text-ink-500 mt-2">{formatDate(r.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Reviews() {
  const { profile } = useAuth()
  const isEngineer = profile?.role && profile.role !== 'client'

  return (
    <div>
      <PageHeader
        title="Reviews & Ratings"
        subtitle={isEngineer ? 'See what clients are saying about your work.' : 'Rate engineers after project completion.'}
      />
      {isEngineer ? <EngineerReviews /> : <ClientReviews />}
    </div>
  )
}
