import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Phone,
} from 'lucide-react'
import { registerCivilEngineer, initRecaptcha, sendOtp, confirmOtp, logout } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import AuthBrandPanel from './AuthBrandPanel'

const QUALIFICATIONS = ['Diploma', 'BE', 'B.Tech', 'ME', 'M.Tech']
const SPECIALIZATIONS = [
  'Structural Engineering',
  'Site/Construction Management',
  'Geotechnical Engineering',
  'Transportation Engineering',
  'Water Resources Engineering',
  'Environmental Engineering',
  'Quantity Surveying / Estimation',
]
const SKILL_OPTIONS = ['AutoCAD', 'Revit', 'STAAD Pro', 'ETABS', 'Primavera', 'MS Project', 'Surveying']
const AVAILABILITY_OPTIONS = ['Immediate', 'Notice Period']

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dob: '',
  gender: '',
  address: '',
  state: '',
  city: '',
  pinCode: '',
  qualification: QUALIFICATIONS[1],
  specialization: SPECIALIZATIONS[0],
  experienceYears: '',
  preferredLocation: '',
  languages: '',
  availability: AVAILABILITY_OPTIONS[0],
}

export default function CivilEngineerRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [skills, setSkills] = useState([])
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Files
  const [photoFile, setPhotoFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [degreeFile, setDegreeFile] = useState(null)
  const [govIdFile, setGovIdFile] = useState(null)
  const [portfolioFiles, setPortfolioFiles] = useState([])

  // Phone OTP verification
  const [phone, setPhone] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleSkill(skill) {
    setSkills((s) => (s.includes(skill) ? s.filter((x) => x !== skill) : [...s, skill]))
  }

  // --- Phone OTP handlers ---

  async function handleSendOtp() {
    setOtpError('')
    if (!phone.trim()) {
      setOtpError('Enter your mobile number first.')
      return
    }
    setOtpLoading(true)
    try {
      const verifier = initRecaptcha('recaptcha-container-civil-register')
      const result = await sendOtp(phone.trim(), verifier)
      setConfirmationResult(result)
      setOtpSent(true)
    } catch (err) {
      setOtpError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    if (!otpCode.trim()) {
      setOtpError('Enter the OTP you received.')
      return
    }
    setOtpLoading(true)
    try {
      await confirmOtp(confirmationResult, otpCode.trim())
      // confirmOtp signs the user in with a temporary phone-auth
      // session purely to prove ownership of the number. Sign out
      // immediately so it doesn't conflict with the email/password
      // account created on final submit.
      await logout()
      setPhoneVerified(true)
    } catch (err) {
      setOtpError(getAuthErrorMessage(err))
    } finally {
      setOtpLoading(false)
    }
  }

  // --- Submit ---

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.')
      return
    }
    if (!phoneVerified) {
      setError('Please verify your mobile number with OTP before registering.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms & Privacy Policy to continue.')
      return
    }

    setLoading(true)
    try {
      await registerCivilEngineer({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: phone.trim(),
        phoneVerified: true,
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        state: form.state,
        city: form.city,
        pinCode: form.pinCode,
        qualification: form.qualification,
        specialization: form.specialization,
        experienceYears: form.experienceYears,
        preferredLocation: form.preferredLocation,
        skills,
        languages: form.languages,
        availability: form.availability,
        photoFile,
        resumeFile,
        degreeFile,
        govIdFile,
        portfolioFiles,
      })
      // RootGate ("/") will read the new profile and land the engineer
      // on the correct dashboard.
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
        <div className="w-full max-w-2xl">
          <Link to="/register" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </span>
            <span className="text-lg font-bold text-ink-900">BuildConnect</span>
          </Link>

          <h1 className="text-2xl font-bold text-ink-900">Civil Engineer Registration</h1>
          <p className="text-sm text-ink-500 mt-1">
            Build a complete profile so clients can find and hire you with confidence.
          </p>

          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            {/* Personal Details */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Personal Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="input-field sm:col-span-2"
                />

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Profile Photo</label>
                  <FileInput accept="image/*" file={photoFile} onChange={setPhotoFile} />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Date of Birth</label>
                  <input
                    required
                    type="date"
                    value={form.dob}
                    onChange={(e) => update('dob', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Gender</label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="input-field"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Languages Known</label>
                  <input
                    placeholder="English, Hindi, Tamil..."
                    value={form.languages}
                    onChange={(e) => update('languages', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Contact & Security */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Contact &amp; Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">
                    Mobile Number (OTP Verification)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        disabled={phoneVerified}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field pl-9 disabled:bg-ink-100/60"
                      />
                    </div>
                    {!phoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="btn-secondary px-4 whitespace-nowrap"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                    {phoneVerified && (
                      <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 whitespace-nowrap">
                        <CheckCircle2 size={16} /> Verified
                      </span>
                    )}
                  </div>

                  {otpSent && !phoneVerified && (
                    <div className="flex gap-2 mt-2">
                      <input
                        placeholder="Enter OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading}
                        className="btn-primary px-4 whitespace-nowrap"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  )}

                  {otpError && <p className="text-xs text-red-600 mt-1.5">{otpError}</p>}
                  {/* Invisible reCAPTCHA anchor required by Firebase Phone Auth */}
                  <div id="recaptcha-container-civil-register" />
                </div>

                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="input-field"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Password (min. 6 characters)"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
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
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Address</h2>
              <div className="space-y-4">
                <input
                  required
                  placeholder="Current Address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input-field"
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <input
                    required
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="input-field"
                  />
                  <input
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="input-field"
                  />
                  <input
                    required
                    placeholder="PIN Code"
                    value={form.pinCode}
                    onChange={(e) => update('pinCode', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Professional Details */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Professional Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Qualification</label>
                  <select
                    value={form.qualification}
                    onChange={(e) => update('qualification', e.target.value)}
                    className="input-field"
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">
                    Civil Engineering Specialization
                  </label>
                  <select
                    value={form.specialization}
                    onChange={(e) => update('specialization', e.target.value)}
                    className="input-field"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Years of Experience</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="60"
                    placeholder="e.g. 5"
                    value={form.experienceYears}
                    onChange={(e) => update('experienceYears', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Preferred Job Location</label>
                  <input
                    placeholder="e.g. Chennai, Bengaluru"
                    value={form.preferredLocation}
                    onChange={(e) => update('preferredLocation', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-ink-500 mb-2 block">Availability</label>
                  <div className="flex gap-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update('availability', opt)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
                          form.availability === opt
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-ink-100 text-ink-700 hover:border-ink-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                      skills.includes(skill)
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-100 text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Documents</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Resume / CV Upload</label>
                  <FileInput accept=".pdf,.doc,.docx" file={resumeFile} onChange={setResumeFile} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Degree Certificate Upload</label>
                  <FileInput accept=".pdf,image/*" file={degreeFile} onChange={setDegreeFile} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">
                    Government ID (Aadhaar/PAN)
                  </label>
                  <FileInput accept=".pdf,image/*" file={govIdFile} onChange={setGovIdFile} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">
                    Portfolio / Project Images
                  </label>
                  <FileInput
                    accept="image/*"
                    multiple
                    files={portfolioFiles}
                    onChangeMultiple={setPortfolioFiles}
                  />
                </div>
              </div>
            </section>

            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              I agree to the{' '}
              <span className="text-brand-600 font-medium">Terms of Service</span> and{' '}
              <span className="text-brand-600 font-medium">Privacy Policy</span>.
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Registering...' : 'Register'}
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

// Small reusable file input that shows the chosen file name(s).
function FileInput({ accept, multiple, file, files, onChange, onChangeMultiple }) {
  const label = multiple
    ? files?.length
      ? `${files.length} file(s) selected`
      : 'Choose files'
    : file?.name || 'Choose file'

  return (
    <label className="flex items-center gap-2 border border-dashed border-ink-300 rounded-lg px-3.5 py-2.5 text-sm text-ink-500 cursor-pointer hover:border-brand-500 transition">
      <Upload size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (multiple) {
            onChangeMultiple(Array.from(e.target.files || []))
          } else {
            onChange(e.target.files?.[0] || null)
          }
        }}
      />
    </label>
  )
}
