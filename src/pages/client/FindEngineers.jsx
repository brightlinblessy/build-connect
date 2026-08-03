import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, CheckCircle2, Star } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { getEngineers } from '../../firebase/firestore'
import { engineerLabel, ENGINEER_ROLES } from '../../utils/roles'

export default function FindEngineers() {
  const [engineers, setEngineers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    let active = true
    getEngineers()
      .then((data) => {
        if (active) setEngineers(data)
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Failed to load engineers.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return engineers.filter((eng) => {
      if (roleFilter !== 'all' && eng.role !== roleFilter) return false
      if (availabilityFilter !== 'all' && eng.availability !== availabilityFilter) return false
      if (!term) return true
      const haystack = [eng.name, eng.specialization, eng.city, eng.state, eng.preferredLocation, ...(eng.skills || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [engineers, search, roleFilter, availabilityFilter])

  return (
    <div>
      <PageHeader title="Find Engineers" subtitle="Browse registered professionals and hire the right fit for your project." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or location..."
            className="input-field pl-9"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:w-56">
          <option value="all">All specialties</option>
          {ENGINEER_ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="input-field sm:w-48">
          <option value="all">Any availability</option>
          <option value="Immediate">Immediate</option>
          <option value="Notice Period">Notice Period</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-500">Loading engineers...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500">
            {engineers.length === 0
              ? 'No engineers have registered yet. Check back soon!'
              : 'No engineers match your search. Try adjusting the filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((eng) => (
            <div key={eng.id} className="card p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <img
                  src={eng.photoURL || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(eng.name || 'Engineer')}`}
                  alt=""
                  className="w-14 h-14 rounded-full bg-brand-50 object-cover"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900 text-sm truncate">{eng.name || 'Unnamed Engineer'}</h3>
                  <p className="text-xs text-ink-500 truncate">{engineerLabel(eng.role)}</p>
                  {eng.phoneVerified && (
                    <p className="flex items-center gap-1 text-xs text-green-700 font-medium mt-0.5">
                      <CheckCircle2 size={12} /> Verified
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-ink-500 mt-3 flex items-center gap-1">
                <MapPin size={12} /> {eng.city ? `${eng.city}, ${eng.state}` : 'Location not set'}
              </p>

              {eng.specialization && <p className="text-xs text-ink-700 mt-1.5">{eng.specialization}</p>}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {(eng.skills || []).slice(0, 4).map((skill) => (
                  <span key={skill} className="text-[11px] bg-ink-100 text-ink-700 px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-ink-500 mt-3">
                <span>{eng.experienceYears ? `${eng.experienceYears} yrs exp` : 'Experience N/A'}</span>
                {eng.availability && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Star size={12} fill="currentColor" /> {eng.availability}
                  </span>
                )}
              </div>

              <Link to={`/client/engineers/${eng.id}`} className="btn-primary w-full mt-4 text-xs py-2 text-center">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
