import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, User, HardHat, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { registerWithEmail } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import { ENGINEER_ROLES } from '../../utils/roles'
import AuthBrandPanel from './AuthBrandPanel'

// Only two account types can be created from the public Register screen.
// "Engineer" is a group — the actual specialty (civilEngineer, architect,
// structuralEngineer, mepEngineer, contractor) is stored as the real
// Firestore `role` so every existing dashboard/route keeps working.
const accountTypes = [
  { id: 'client', label: 'Client', icon: User },
  { id: 'engineer', label: 'Engineer', icon: HardHat },
]

export default function Register() {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('client')
  const [specialty, setSpecialty] = useState(ENGINEER_ROLES[0].id)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resolvedRole = accountType === 'engineer' ? specialty : accountType

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerWithEmail({ ...form, role: resolvedRole })
      // RootGate ("/") will read the new profile and land the user on
      // the correct dashboard for their role.
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/register" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </span>
            <span className="text-lg font-bold text-ink-900">BuildConnect</span>
          </Link>

          <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-500 mt-1">Choose how you want to use BuildConnect.</p>

          <div className="grid grid-cols-2 gap-2 mt-6">
            {accountTypes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAccountType(r.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition ${
                  accountType === r.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-100 text-ink-700 hover:border-ink-300'
                }`}
              >
                <r.icon size={18} />
                {r.label}
              </button>
            ))}
          </div>

          {accountType === 'engineer' && (
            <div className="mt-3">
              <label className="text-xs font-medium text-ink-500 mb-1 block">Your specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="input-field"
              >
                {ENGINEER_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              {specialty === 'civilEngineer' && (
                <p className="text-xs text-ink-500 mt-2">
                  Civil Engineer?{' '}
                  <Link to="/register/civil-engineer" className="text-brand-600 font-medium hover:underline">
                    Use the detailed registration form
                  </Link>{' '}
                  to showcase your full profile to clients.
                </p>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
            <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder="Password (min. 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="flex items-center gap-1.5 justify-center text-xs text-ink-500 mt-4">
            <ShieldCheck size={14} /> A verification email will be sent after signup.
          </p>

          <p className="text-sm text-center text-ink-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
