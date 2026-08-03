import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Search,
  Star,
  FolderKanban,
  Users,
  Heart,
  TrendingUp,
  HardHat,
  Layers,
  Zap,
  Compass,
  Sofa,
  Trees,
  MapPin,
  ChevronRight,
  Menu,
  X,
  User,
  Palette,
  Wrench,
  CreditCard,
} from 'lucide-react'
import { categories, avatarUrl } from '../../data/constants'
import { getPlatformStats, getFeaturedEngineers, getRecentOpenProjects } from '../../firebase/firestore'
import { engineerLabel, ROLE_CONFIGS } from '../../utils/roles'

// Icon for each service category card.
const categoryIcons = {
  'Civil Engineer': HardHat,
  Architect: Building2,
  'Structural Engineer': Layers,
  'MEP Engineer': Zap,
  Contractor: HardHat,
  Surveyor: Compass,
  'Interior Designer': Sofa,
  'Landscape Designer': Trees,
}

// Deterministic placeholder photo per project so the grid looks tidy
// even before a client has uploaded real project photos.
function projectImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/260`
}

function formatBudget(p) {
  if (!p.budgetMin && !p.budgetMax) return 'Budget on request'
  const min = p.budgetMin ? Number(p.budgetMin).toLocaleString('en-IN') : null
  const max = p.budgetMax ? Number(p.budgetMax).toLocaleString('en-IN') : null
  if (min && max) return `₹${min} - ₹${max}`
  return `₹${min || max}`
}

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'Find Engineers', href: '#engineers' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#categories' },
  { label: 'Pricing', href: '#cta' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [engineers, setEngineers] = useState([])
  const [projects, setProjects] = useState([])
  const [loadingShowcase, setLoadingShowcase] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getPlatformStats(), getFeaturedEngineers(4), getRecentOpenProjects(4)])
      .then(([s, eng, proj]) => {
        if (!active) return
        setStats(s)
        setEngineers(eng)
        setProjects(proj)
      })
      .catch(() => {})
      .finally(() => active && setLoadingShowcase(false))
    return () => {
      active = false
    }
  }, [])

  const heroStats = [
    { label: 'Projects Posted', value: stats?.projects ?? '—', icon: FolderKanban },
    { label: 'Registered Engineers', value: stats?.engineers ?? '—', icon: Users },
    { label: 'Registered Clients', value: stats?.clients ?? '—', icon: Star },
    { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '—', icon: TrendingUp },
  ]

  return (
    <div id="top" className="min-h-screen bg-white text-ink-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </span>
            <span className="text-lg font-bold text-ink-900">BuildConnect</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((n) => (
              <a key={n.label} href={n.href} className="text-sm text-ink-700 hover:text-brand-600 transition-colors">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2">
              Register
            </Link>
          </div>

          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center text-ink-700"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-ink-100 px-4 py-4 space-y-3 bg-white">
            {navLinks.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-ink-700"
              >
                {n.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 justify-center">
                Login
              </Link>
              <Link to="/register" className="btn-primary flex-1 justify-center">
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-ink-900">
            Find the Best Civil Engineering Professionals for Your Project
          </h1>
          <p className="text-ink-500 mt-5 text-base max-w-lg">
            Post your project, receive quotes, compare and hire the best experts — engineers,
            architects, contractors and more, all on one connected platform.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register" className="btn-primary px-6 py-3 text-sm">
              Post a Project
            </Link>
            <a href="#engineers" className="btn-secondary px-6 py-3 text-sm">
              Find Engineers
            </a>
          </div>

          {/* Quick search bar */}
          <div className="mt-8 card p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <Search size={16} className="text-ink-500 shrink-0" />
              <input
                type="text"
                placeholder="Search services or expertise"
                className="w-full text-sm outline-none placeholder:text-ink-500"
              />
            </div>
            <select className="text-sm text-ink-700 border border-ink-100 sm:border-0 sm:border-l sm:border-r rounded-lg sm:rounded-none px-3 py-2 outline-none">
              <option>Select Category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select className="text-sm text-ink-700 border border-ink-100 sm:border-0 rounded-lg sm:rounded-none px-3 py-2 outline-none">
              <option>Select Location</option>
              <option>New Delhi</option>
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Pune</option>
            </select>
            <Link to="/register" className="btn-primary px-6 py-2.5 text-sm">
              Search
            </Link>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden card">
          <img
            src="https://picsum.photos/seed/buildconnect-hero/800/560"
            alt="Construction professionals reviewing plans on site"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-ink-100 bg-ink-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {heroStats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <s.icon size={20} className="text-brand-600" />
              </span>
              <div>
                <p className="text-xl font-bold text-ink-900">{s.value}</p>
                <p className="text-xs text-ink-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Showcase Section */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">Explore Platform User Roles</h2>
          <p className="text-base text-ink-500 mt-3">
            BuildConnect is tailored for clients and construction experts to collaborate seamlessly. Learn how each role interacts with the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ROLE_CONFIGS).map(([key, config]) => {
            const Icon = {
              User: User,
              HardHat: HardHat,
              Palette: Palette,
              Layers: Layers,
              Zap: Zap,
              Wrench: Wrench,
            }[config.iconName] || Building2;

            return (
              <div
                key={key}
                className="card p-6 relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ borderColor: `${config.hex}25` }}
              >
                {/* Decorative hover bg color */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none duration-300"
                  style={{ backgroundColor: config.hex }}
                />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${config.hex}12`, color: config.hex }}
                    >
                      <Icon size={24} />
                    </span>
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border"
                      style={{ backgroundColor: `${config.hex}08`, borderColor: `${config.hex}30`, color: config.hex }}
                    >
                      {config.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {config.label}
                  </h3>
                  <p className="text-sm text-ink-500 mt-2 font-medium">
                    {config.desc}
                  </p>
                  
                  {/* Action Highlights */}
                  <ul className="mt-5 space-y-2 text-xs text-ink-700">
                    {key === 'client' ? (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Post projects and define timelines
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Compare bids & review portfolios
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Release secure milestone payments
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Browse and submit bid quotations
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Showcase verified certifications
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.hex }} />
                          Receive direct milestone payouts
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between">
                  <Link
                    to="/register"
                    className="text-xs font-bold flex items-center gap-1.5 transition-colors"
                    style={{ color: config.hex }}
                  >
                    Get Started as {config.label} <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Collaboration Flow Section */}
      <section id="flow" className="bg-ink-100/40 py-16 border-y border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">Platform Collaboration Flow</h2>
            <p className="text-base text-ink-500 mt-3">
              How clients and verified specialists collaborate on BuildConnect to deliver successful construction projects.
            </p>
          </div>

          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-ink-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
              {[
                { step: '1', label: 'Post Project', desc: 'Clients post scope, budget & location details.', icon: FolderKanban },
                { step: '2', label: 'Receive Quotes', desc: 'Verified specialists bid with pricing & timelines.', icon: Users },
                { step: '3', label: 'Compare & Hire', desc: 'Clients review profiles, credentials & accept quotes.', icon: Star },
                { step: '4', label: 'Work In Progress', desc: 'Assign engineers and track construction status.', icon: HardHat },
                { step: '5', label: 'Escrow Payments', desc: 'Secure payments are processed upon milestones.', icon: CreditCard },
                { step: '6', label: 'Complete & Rate', desc: 'Complete projects and leave mutual feedback.', icon: Heart }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="card p-5 flex flex-col items-center text-center hover:shadow-lg transition-shadow bg-white">
                    <div className="relative mb-4">
                      <span className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold shrink-0 shadow-sm border border-brand-100/30">
                        <Icon size={22} className="text-brand-600" />
                      </span>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-ink-900">{item.label}</h3>
                    <p className="text-[11px] text-ink-500 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-900">Popular Categories</h2>
          <Link to="/register" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
            View All Categories <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c] || Building2
            return (
              <div
                key={c}
                className="card flex flex-col items-center justify-center gap-3 py-6 px-3 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Icon size={20} className="text-brand-600" />
                </span>
                <span className="text-xs font-medium text-ink-700">{c}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Engineers */}
      <section id="engineers" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-900">Featured Engineers</h2>
          <Link to="/register" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight size={15} />
          </Link>
        </div>
        {loadingShowcase ? (
          <p className="text-sm text-ink-500">Loading engineers...</p>
        ) : engineers.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-ink-500">
              No engineers have registered yet.{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:underline">
                Be the first to join
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {engineers.map((e) => (
              <div key={e.id} className="card p-5 flex flex-col items-center text-center">
                <img
                  src={e.photoURL || avatarUrl(e.name || e.id)}
                  alt={e.name}
                  className="w-16 h-16 rounded-full bg-ink-100 object-cover"
                />
                <p className="font-semibold text-ink-900 mt-3">{e.name || 'Unnamed Engineer'}</p>
                <p className="text-xs text-ink-500">{engineerLabel(e.role)}</p>
                {e.city && (
                  <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
                    <MapPin size={11} /> {e.city}
                  </p>
                )}
                {e.experienceYears && <p className="text-xs text-ink-500 mt-1">{e.experienceYears}+ yrs experience</p>}
                <Link to="/register" className="btn-primary w-full mt-4 py-2 text-sm">
                  Hire Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Projects */}
      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-900">Latest Projects</h2>
          <Link to="/register" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
            View All Projects <ChevronRight size={15} />
          </Link>
        </div>
        {loadingShowcase ? (
          <p className="text-sm text-ink-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-ink-500">
              No projects posted yet.{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:underline">
                Post the first one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projects.map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <img src={projectImage(p.id)} alt={p.title} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <p className="font-semibold text-ink-900 text-sm">{p.title}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {p.location || p.category || 'Location not set'}
                  </p>
                  <p className="text-sm font-medium text-brand-600 mt-2">{formatBudget(p)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section id="cta" className="bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto text-sm">
            Join clients and professionals already building better projects together on
            BuildConnect.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link to="/register" className="btn-primary px-6 py-3 text-sm">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-sm bg-transparent border-white/30 text-white hover:bg-white/10">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </span>
            <span className="font-bold text-ink-900">BuildConnect</span>
          </div>
          <p className="text-xs text-ink-500 flex items-center gap-1">
            Built for civil engineering teams, with <Heart size={12} className="fill-red-400 text-red-400" />
          </p>
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} BuildConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
