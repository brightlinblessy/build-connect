import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail } from 'lucide-react'
import { resetPassword } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import AuthBrandPanel from './AuthBrandPanel'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
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

          <h1 className="text-2xl font-bold text-ink-900">Reset your password</h1>
          <p className="text-sm text-ink-500 mt-1">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <p className="mt-6 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5 text-center">
              Reset link sent! Check your inbox.
            </p>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
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
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-sm text-center text-ink-500 mt-6">
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
