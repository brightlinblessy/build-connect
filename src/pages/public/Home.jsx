import { useState } from 'react'
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
} from 'lucide-react'
import {
  heroStats,
  categories,
  featuredEngineers,
  latestProjects,
  avatarUrl,
} from '../../data/mockData'

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

const statIcons = [FolderKanban, Users, Star, TrendingUp]

// Deterministic placeholder photo per project so the grid looks populated
// without shipping binary assets.
function projectImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/260`
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
          {heroStats.map((s, i) => {
            const Icon = statIcons[i]
            return (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-600" />
                </span>
                <div>
                  <p className="text-xl font-bold text-ink-900">{s.value}</p>
                  <p className="text-xs text-ink-500">{s.label}</p>
                </div>
              </div>
            )
          })}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredEngineers.map((e) => (
            <div key={e.id} className="card p-5 flex flex-col items-center text-center">
              <img
                src={avatarUrl(e.avatarSeed)}
                alt={e.name}
                className="w-16 h-16 rounded-full bg-ink-100"
              />
              <p className="font-semibold text-ink-900 mt-3">{e.name}</p>
              <p className="text-xs text-ink-500">{e.title}</p>
              <p className="text-xs text-amber-500 flex items-center gap-1 mt-2">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {e.rating} ({e.reviews})
              </p>
              <p className="text-xs text-ink-500 mt-1">{e.projects}</p>
              <p className="text-sm font-semibold text-ink-900 mt-1">{e.rate}</p>
              <Link to="/register" className="btn-primary w-full mt-4 py-2 text-sm">
                Hire Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Projects */}
      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-900">Latest Projects</h2>
          <Link to="/register" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
            View All Projects <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestProjects.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <img src={projectImage(p.image)} alt={p.title} className="w-full h-36 object-cover" />
              <div className="p-4">
                <p className="font-semibold text-ink-900 text-sm">{p.title}</p>
                <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {p.location}
                </p>
                <p className="text-sm font-medium text-brand-600 mt-2">{p.budget}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto text-sm">
            Join thousands of clients and professionals already building better projects together
            on BuildConnect.
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
