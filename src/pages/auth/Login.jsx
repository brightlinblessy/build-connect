import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'
import {
  loginWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  initRecaptcha,
  sendOtp,
  confirmOtp,
  logout,
  getUserProfile,
  consumePendingSocialAuthError,
} from '../../firebase/auth'
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

  // Surfaces a Google/Facebook sign-in error from *before* the page did
  // a full reload for the redirect-based fallback (see loginWithGoogle
  // in src/firebase/auth.js) — local state doesn't survive that reload.
  useEffect(() => {
    const code = consumePendingSocialAuthError()
    if (code) setError(getAuthErrorMessage({ code }))
  }, [])

  // Phone OTP login
  const [phone, setPhone] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      // RootGate ("/") reads the freshly-loaded profile and routes the
      // user to the correct dashboard (client / engineer).
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
      const user = await fn()
      // `user` is null when the provider fell back to a full-page
      // redirect (see loginWithGoogle/loginWithFacebook) — the browser
      // is already navigating away, so there's nothing left to do here.
      if (user) navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp() {
    setError('')
    if (!phone.trim()) {
      setError('Enter your phone number first.')
      return
    }
    setOtpLoading(true)
    try {
      const verifier = initRecaptcha('recaptcha-container')
      const result = await sendOtp(phone.trim(), verifier)
      setConfirmationResult(result)
      setOtpSent(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    if (!otpCode.trim()) {
      setError('Enter the OTP you received.')
      return
    }
    setOtpLoading(true)
    try {
      const result = await confirmOtp(confirmationResult, otpCode.trim())
      // Phone sign-in only lands on an existing account if that phone
      // number was previously linked to it (see Settings → Link Phone
      // Number). Otherwise Firebase just created a brand-new, blank
      // user with no Firestore profile — sign that one back out rather
      // than leaving the person stuck on a broken session.
      const existingProfile = await getUserProfile(result.user.uid)
      if (!existingProfile) {
        await logout()
        setError(
          'This phone number isn\u2019t linked to an account yet. Log in with email below, then link your number from Settings \u2192 Link Phone Number.',
        )
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
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
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  disabled={otpSent}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-9 disabled:bg-ink-100/60"
                />
              </div>
              <div id="recaptcha-container" />

              {!otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="btn-primary w-full py-2.5">
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <input
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="input-field"
                  />
                  <button type="button" onClick={handleVerifyOtp} disabled={otpLoading} className="btn-primary w-full py-2.5">
                    {otpLoading ? 'Verifying...' : 'Verify OTP & Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setOtpCode('')
                    }}
                    className="text-xs text-ink-500 hover:underline w-full text-center"
                  >
                    Use a different number
                  </button>
                </>
              )}

              <p className="text-xs text-ink-500 text-center">
                Only phone numbers already linked to an account (Settings → Link Phone Number) can log in this way.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-ink-100 flex-1" />
            <span className="text-xs text-ink-500">or continue with</span>
            <div className="h-px bg-ink-100 flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button type="button" disabled={loading} onClick={() => handleSocial(() => loginWithGoogle('client'))} className="btn-secondary py-2.5 text-xs px-2">
              Google
            </button>
            <button type="button" disabled={loading} onClick={() => handleSocial(() => loginWithFacebook('client'))} className="btn-secondary py-2.5 text-xs px-2">
              Facebook
            </button>
            <button type="button" disabled={loading} onClick={() => setError('LinkedIn integration requires custom OpenID setup. Please sign in via Google or Email.')} className="btn-secondary py-2.5 text-xs px-2">
              LinkedIn
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
