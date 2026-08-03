import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Phone } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile, deleteAccount, initRecaptcha, sendOtp, linkPhoneToAccount } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'

const toggles = [
  { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.' },
  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates about quotations and payments via email.' },
  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get text alerts for important account activity.' },
  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Occasional tips, offers, and product updates.' },
]

export default function Settings() {
  const { profile, user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [state, setState] = useState({
    twoFactorEnabled: !!profile?.twoFactorEnabled,
    emailNotifications: profile?.emailNotifications ?? true,
    smsNotifications: !!profile?.smsNotifications,
    marketingEmails: !!profile?.marketingEmails,
  })
  const [savingKey, setSavingKey] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Link Phone Number (so Phone OTP login on the /login page works)
  const [phone, setPhone] = useState(profile?.phone || '')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [phoneLinked, setPhoneLinked] = useState(false)

  async function toggle(key) {
    if (!user) return
    const nextValue = !state[key]
    setState((s) => ({ ...s, [key]: nextValue }))
    setSavingKey(key)
    setError('')
    try {
      await updateUserProfile(user.uid, { [key]: nextValue })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      // Roll back on failure so the UI reflects what's actually saved.
      setState((s) => ({ ...s, [key]: !nextValue }))
      setError(getAuthErrorMessage(err))
    } finally {
      setSavingKey(null)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  async function handleSendPhoneOtp() {
    setPhoneError('')
    if (!phone.trim()) {
      setPhoneError('Enter a phone number first.')
      return
    }
    setOtpLoading(true)
    try {
      const verifier = initRecaptcha('recaptcha-container-settings')
      const result = await sendOtp(phone.trim(), verifier)
      setConfirmationResult(result)
      setOtpSent(true)
    } catch (err) {
      setPhoneError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyAndLinkPhone() {
    setPhoneError('')
    if (!otpCode.trim()) {
      setPhoneError('Enter the OTP you received.')
      return
    }
    setOtpLoading(true)
    try {
      await linkPhoneToAccount(confirmationResult, otpCode.trim())
      await updateUserProfile(user.uid, { phone: phone.trim(), phoneVerified: true })
      await refreshProfile()
      setPhoneLinked(true)
      setOtpSent(false)
      setOtpCode('')
    } catch (err) {
      setPhoneError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage security and notification preferences." />

      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4 max-w-2xl">
          <CheckCircle2 size={15} /> Preference saved.
        </p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 max-w-2xl">{error}</p>}

      <div className="max-w-2xl card p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Phone size={16} className="text-brand-600" />
          <p className="text-sm font-medium text-ink-900">Link Phone Number</p>
        </div>
        <p className="text-xs text-ink-500 mb-4">
          Link a verified phone number to your account so you can log in with Phone OTP from now on.
        </p>

        {profile?.phoneVerified && !otpSent && !phoneLinked ? (
          <p className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 size={15} /> {profile.phone} is linked and verified.
          </p>
        ) : phoneLinked ? (
          <p className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 size={15} /> Phone number linked! You can now log in with Phone OTP.
          </p>
        ) : (
          <div className="space-y-3">
            {phoneError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{phoneError}</p>}
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field flex-1 disabled:bg-ink-100/60"
              />
              {!otpSent && (
                <button type="button" onClick={handleSendPhoneOtp} disabled={otpLoading} className="btn-secondary px-4 whitespace-nowrap">
                  Send OTP
                </button>
              )}
            </div>
            {otpSent && (
              <div className="flex gap-2">
                <input placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="input-field flex-1" />
                <button type="button" onClick={handleVerifyAndLinkPhone} disabled={otpLoading} className="btn-primary px-4 whitespace-nowrap">
                  {otpLoading ? 'Linking...' : 'Verify & Link'}
                </button>
              </div>
            )}
            <div id="recaptcha-container-settings" />
          </div>
        )}
      </div>

      <div className="max-w-2xl card divide-y divide-ink-100">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-ink-900">{t.label}</p>
              <p className="text-xs text-ink-500 mt-0.5">{t.desc}</p>
            </div>
            <button
              type="button"
              disabled={savingKey === t.key}
              onClick={() => toggle(t.key)}
              className={`w-11 h-6 rounded-full transition relative shrink-0 disabled:opacity-60 ${
                state[t.key] ? 'bg-brand-600' : 'bg-ink-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  state[t.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <div className="p-5">
          {!confirmingDelete ? (
            <button type="button" onClick={() => setConfirmingDelete(true)} className="text-sm font-medium text-red-600 hover:underline">
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-700">
                This permanently deletes your account and profile. This can't be undone. Are you sure?
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmingDelete(false)} className="btn-secondary text-sm px-4 py-2">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
