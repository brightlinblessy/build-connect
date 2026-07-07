import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'
import { loginWithEmail, loginWithGoogle, loginWithFacebook } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import AuthBrandPanel from './AuthBrandPanel'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('email') // email | phone
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      // RootGate ("/") reads the freshly-loaded profile and routes the
      // user to the correct dashboard (client / engineer / admin).
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSocial(fn) {
    setError('')
    setLoading(true)
    try {
      await fn()
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
          <Link to="/login" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </span>
            <span className="text-lg font-bold text-ink-900">BuildConnect</span>
          </Link>

          <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="text-sm text-ink-500 mt-1">Login to manage your projects and quotations.</p>

          <div className="flex mt-6 bg-ink-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'email' ? 'bg-white shadow-card text-ink-900' : 'text-ink-500'}`}
              onClick={() => setMode('email')}
            >
              Email
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'phone' ? 'bg-white shadow-card text-ink-900' : 'text-ink-500'}`}
              onClick={() => setMode('phone')}
            >
              Phone OTP
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {mode === 'email' ? (
            <form className="mt-5 space-y-4" onSubmit={handleEmailLogin}>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-9 pr-9"
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
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input type="tel" placeholder="+91 98765 43210" className="input-field pl-9" />
              </div>
              <div id="recaptcha-container" />
              <button type="button" className="btn-primary w-full py-2.5">
                Send OTP
              </button>
              <p className="text-xs text-ink-500 text-center">
                Wire this button to <code className="text-ink-700">sendOtp()</code> from{' '}
                <code className="text-ink-700">src/firebase/auth.js</code>.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-ink-100 flex-1" />
            <span className="text-xs text-ink-500">or continue with</span>
            <div className="h-px bg-ink-100 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button disabled={loading} onClick={() => handleSocial(() => loginWithGoogle('client'))} className="btn-secondary py-2.5">
              Google
            </button>
            <button disabled={loading} onClick={() => handleSocial(() => loginWithFacebook('client'))} className="btn-secondary py-2.5">
              Facebook
            </button>
          </div>

          <p className="text-sm text-center text-ink-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
