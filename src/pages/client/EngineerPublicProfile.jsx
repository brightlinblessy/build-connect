import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, CheckCircle2, MessageSquare } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getEngineerById, createHire, getHiredEngineers, pushNotification } from '../../firebase/firestore'
import { engineerLabel } from '../../utils/roles'

export default function EngineerPublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [engineer, setEngineer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [alreadyHired, setAlreadyHired] = useState(false)
  const [hiring, setHiring] = useState(false)
  const [hireError, setHireError] = useState('')
  const [hireSuccess, setHireSuccess] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setNotFound(false)

    Promise.all([getEngineerById(id), user ? getHiredEngineers(user.uid) : Promise.resolve([])])
      .then(([eng, hires]) => {
        if (!active) return
        if (!eng) {
          setNotFound(true)
        } else {
          setEngineer(eng)
          setAlreadyHired(hires.some((h) => h.engineerId === id))
        }
      })
      .catch(() => {
        if (active) setNotFound(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, user])

  async function handleHire() {
    if (!user || !engineer) return
    setHiring(true)
    setHireError('')
    try {
      await createHire({
        clientId: user.uid,
        engineerId: engineer.id,
        engineerName: engineer.name || '',
        clientName: profile?.name || '',
        status: 'Active',
        projectId: null,
      })
      await pushNotification(engineer.id, {
        type: 'hire',
        title: 'You have a new hire!',
        message: `${profile?.name || 'A client'} hired you directly from your profile.`,
      })
      setAlreadyHired(true)
      setHireSuccess(true)
    } catch (err) {
      setHireError(err?.message || 'Could not complete the hire. Please try again.')
    } finally {
      setHiring(false)
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading profile...</p>

  if (notFound) {
    return (
      <div>
        <PageHeader title="Engineer not found" subtitle="This profile may have been removed." />
        <Link to="/client/engineers" className="text-brand-600 text-sm font-medium hover:underline">
          ← Back to Find Engineers
        </Link>
      </div>
    )
  }

  const displayPhoto =
    engineer.photoURL || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(engineer.name || 'Engineer')}`

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      {hireSuccess && (
        <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
          <CheckCircle2 size={15} /> You've hired {engineer.name}. Find them under{' '}
          <Link to="/client/hired-engineers" className="font-medium underline">
            Hired Engineers
          </Link>
          .
        </p>
      )}
      {hireError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{hireError}</p>}

      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-600 to-brand-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <img src={displayPhoto} alt="" className="w-24 h-24 rounded-full border-4 border-white bg-brand-50 object-cover" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-ink-900">{engineer.name || 'Unnamed Engineer'}</h2>
              <p className="text-sm text-ink-500 mt-0.5">{engineerLabel(engineer.role)}</p>
              <p className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                {engineer.phoneVerified && (
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <CheckCircle2 size={13} /> Phone Verified
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {engineer.city ? `${engineer.city}, ${engineer.state}` : 'Location not set'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/client/messages?with=${engineer.id}`)}
                className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5"
              >
                <MessageSquare size={15} /> Message
              </button>
              <button
                type="button"
                onClick={handleHire}
                disabled={hiring || alreadyHired}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
              >
                {alreadyHired ? 'Hired' : hiring ? 'Hiring...' : 'Hire Engineer'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Experience', value: engineer.experienceYears ? `${engineer.experienceYears} yrs` : '—' },
              { label: 'Availability', value: engineer.availability || '—' },
              { label: 'Preferred Location', value: engineer.preferredLocation || '—' },
            ].map((s) => (
              <div key={s.label} className="bg-ink-100/60 rounded-lg p-4 text-center">
                <p className="font-bold text-ink-900 truncate">{s.value}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-1.5">About</h4>
              <p className="text-sm text-ink-500 leading-relaxed">
                {engineer.about ||
                  `${engineerLabel(engineer.role)}${engineer.specialization ? ` specializing in ${engineer.specialization}` : ''}${
                    engineer.experienceYears ? ` with ${engineer.experienceYears}+ years of experience.` : '.'
                  }`}
              </p>
            </div>

            {engineer.skills?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {engineer.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-ink-100 text-ink-700 px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-2">Qualification</h4>
              <p className="text-sm text-ink-500">
                {engineer.qualification || 'Not specified'}
                {engineer.languages ? ` · Speaks ${engineer.languages}` : ''}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <DocLink label="Resume / CV" url={engineer.resumeURL} />
              <DocLink label="Degree Certificate" url={engineer.degreeCertificateURL} />
            </div>

            {engineer.portfolioURLs?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Portfolio</h4>
                <div className="grid grid-cols-3 gap-3">
                  {engineer.portfolioURLs.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-28 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocLink({ label, url }) {
  return (
    <div className="bg-ink-100/60 rounded-lg px-3 py-2.5">
      <p className="text-xs text-ink-500">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 font-medium hover:underline">
          View file
        </a>
      ) : (
        <p className="text-ink-500">Not uploaded</p>
      )}
    </div>
  )
}
