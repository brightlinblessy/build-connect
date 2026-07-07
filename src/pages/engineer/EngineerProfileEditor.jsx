import { Star, MapPin } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'

const projectThumbs = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=150&fit=crop',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=150&fit=crop',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&h=150&fit=crop',
]

const stats = [
  { label: 'Projects Completed', value: '80+' },
  { label: 'Experience', value: '8 Years' },
  { label: 'Hourly Rate', value: '₹1200/hr' },
]

const tabs = ['About', 'Portfolio', 'Reviews', 'Certificates']

export default function EngineerProfileEditor() {
  const { profile } = useAuth()

  return (
    <div>
      <PageHeader title="My Profile" subtitle="This is how clients see your public profile." />

      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <img
              src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'Amit Singh')}`}
              alt=""
              className="w-24 h-24 rounded-full border-4 border-white bg-brand-50"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-ink-900">{profile?.name || 'Er. Amit Singh'}</h2>
              <p className="text-sm text-ink-500">Civil Engineer</p>
              <p className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={13} fill="currentColor" /> 4.9 (98 Reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> Delhi, India
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm px-4 py-2">Edit Profile</button>
              <button className="btn-primary text-sm px-4 py-2">Preview Public View</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink-100/60 rounded-lg p-4 text-center">
                <p className="font-bold text-ink-900">{s.value}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-6 border-b border-ink-100 mt-6">
            {tabs.map((t, i) => (
              <button
                key={t}
                className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
                  i === 0 ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-1.5">About</h4>
              <p className="text-sm text-ink-500 leading-relaxed">
                Professional Civil Engineer with 8+ years of experience in residential and infrastructure
                construction projects.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {['AutoCAD', 'Revit', 'STAAD Pro', 'MS Project', 'Site Supervision'].map((skill) => (
                  <span key={skill} className="text-xs bg-ink-100 text-ink-700 px-3 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-2">Languages</h4>
              <p className="text-sm text-ink-500">English, Hindi</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-2">Recent Portfolio</h4>
              <div className="grid grid-cols-3 gap-3">
                {projectThumbs.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
