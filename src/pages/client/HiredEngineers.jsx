import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { getHiredEngineersWithProfiles } from '../../firebase/firestore'
import { engineerLabel } from '../../utils/roles'

export default function HiredEngineers() {
  const { user } = useAuth()
  const [hires, setHires] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getHiredEngineersWithProfiles(user.uid)
      .then((data) => active && setHires(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  return (
    <div>
      <PageHeader
        title="Hired Engineers"
        subtitle="Professionals you've hired directly or through a project."
        action={
          <Link to="/client/engineers" className="btn-primary text-sm px-4 py-2">
            Find Engineers
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading...</p>
      ) : hires.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500 mb-4">You haven't hired anyone yet.</p>
          <Link to="/client/engineers" className="btn-primary text-sm px-4 py-2 inline-block">
            Browse Engineers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hires.map((hire) => {
            const eng = hire.engineer
            return (
              <div key={hire.id} className="card p-5 flex flex-col items-center text-center">
                <img
                  src={
                    eng?.photoURL ||
                    `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(eng?.name || hire.engineerName || 'Engineer')}`
                  }
                  alt=""
                  className="w-16 h-16 rounded-full bg-brand-50 object-cover"
                />
                <h3 className="mt-3 font-semibold text-ink-900 text-sm">{eng?.name || hire.engineerName || 'Engineer'}</h3>
                <p className="text-xs text-ink-500">{engineerLabel(eng?.role)}</p>
                <div className="mt-2">
                  <StatusBadge status={hire.status || 'Active'} />
                </div>
                <div className="w-full flex gap-2 mt-4">
                  {eng?.id && (
                    <Link to={`/client/engineers/${eng.id}`} className="btn-secondary flex-1 text-xs py-2 text-center">
                      Profile
                    </Link>
                  )}
                  <Link to={eng?.id ? `/client/messages?with=${eng.id}` : '/client/messages'} className="btn-primary flex-1 text-xs py-2 text-center">
                    Message
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
