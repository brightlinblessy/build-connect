import { useState } from 'react'
import { Star, MapPin, Camera, Upload, CheckCircle2, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile, uploadUserFile } from '../../firebase/auth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import { engineerLabel } from '../../utils/roles'

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

function formFromProfile(profile) {
  return {
    name: profile?.name || '',
    dob: profile?.dob || '',
    gender: profile?.gender || '',
    address: profile?.address || '',
    state: profile?.state || '',
    city: profile?.city || '',
    pinCode: profile?.pinCode || '',
    qualification: profile?.qualification || QUALIFICATIONS[1],
    specialization: profile?.specialization || SPECIALIZATIONS[0],
    experienceYears: profile?.experienceYears || '',
    preferredLocation: profile?.preferredLocation || '',
    languages: profile?.languages || '',
    availability: profile?.availability || AVAILABILITY_OPTIONS[0],
    about: profile?.about || '',
  }
}

export default function EngineerProfileEditor() {
  const { profile, user, refreshProfile } = useAuth()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => formFromProfile(profile))
  const [skills, setSkills] = useState(profile?.skills || [])
  const [photoFile, setPhotoFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [degreeFile, setDegreeFile] = useState(null)
  const [govIdFile, setGovIdFile] = useState(null)
  const [portfolioFiles, setPortfolioFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleSkill(skill) {
    setSkills((s) => (s.includes(skill) ? s.filter((x) => x !== skill) : [...s, skill]))
  }

  function startEditing() {
    setForm(formFromProfile(profile))
    setSkills(profile?.skills || [])
    setPhotoFile(null)
    setResumeFile(null)
    setDegreeFile(null)
    setGovIdFile(null)
    setPortfolioFiles([])
    setError('')
    setSaved(false)
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)
    try {
      const uid = user.uid
      const [photoURL, resumeURL, degreeCertificateURL, govIdURL] = await Promise.all([
        photoFile ? uploadUserFile(photoFile, `avatars/${uid}/${Date.now()}-${photoFile.name}`) : Promise.resolve(undefined),
        resumeFile
          ? uploadUserFile(resumeFile, `engineers/${uid}/resume-${Date.now()}-${resumeFile.name}`)
          : Promise.resolve(undefined),
        degreeFile
          ? uploadUserFile(degreeFile, `engineers/${uid}/degree-${Date.now()}-${degreeFile.name}`)
          : Promise.resolve(undefined),
        govIdFile
          ? uploadUserFile(govIdFile, `engineers/${uid}/govid-${Date.now()}-${govIdFile.name}`)
          : Promise.resolve(undefined),
      ])

      let newPortfolioURLs
      if (portfolioFiles.length) {
        const uploaded = await Promise.all(
          portfolioFiles.map((f, i) => uploadUserFile(f, `engineers/${uid}/portfolio-${Date.now()}-${i}-${f.name}`)),
        )
        newPortfolioURLs = [...(profile?.portfolioURLs || []), ...uploaded.filter(Boolean)]
      }

      const updates = {
        ...form,
        skills,
      }
      if (photoURL) updates.photoURL = photoURL
      if (resumeURL) updates.resumeURL = resumeURL
      if (degreeCertificateURL) updates.degreeCertificateURL = degreeCertificateURL
      if (govIdURL) updates.govIdURL = govIdURL
      if (newPortfolioURLs) updates.portfolioURLs = newPortfolioURLs

      await updateUserProfile(uid, updates)
      await refreshProfile()
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function removePortfolioImage(url) {
    if (!user) return
    const next = (profile?.portfolioURLs || []).filter((u) => u !== url)
    updateUserProfile(user.uid, { portfolioURLs: next }).then(refreshProfile)
  }

  const displayPhoto =
    profile?.photoURL || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'Engineer')}`

  return (
    <div>
      <PageHeader title="My Profile" subtitle="This is how clients see your public profile." />

      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
          <CheckCircle2 size={15} /> Profile updated.
        </p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="relative">
              <img src={displayPhoto} alt="" className="w-24 h-24 rounded-full border-4 border-white bg-brand-50 object-cover" />
              {editing && (
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center border-2 border-white cursor-pointer">
                  <Camera size={13} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field font-semibold" placeholder="Full name" />
              ) : (
                <h2 className="text-lg font-bold text-ink-900">{profile?.name || 'Your name'}</h2>
              )}
              <p className="text-sm text-ink-500 mt-1">{engineerLabel(profile?.role)}</p>
              <p className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                {profile?.phoneVerified && (
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <Star size={13} fill="currentColor" /> Phone Verified
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {profile?.city ? `${profile.city}, ${profile.state}` : 'Location not set'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">
                    Cancel
                  </button>
                  <button type="submit" form="engineer-profile-form" disabled={saving} className="btn-primary text-sm px-4 py-2">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={startEditing} className="btn-secondary text-sm px-4 py-2">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Experience', value: profile?.experienceYears ? `${profile.experienceYears} yrs` : '—' },
              { label: 'Availability', value: profile?.availability || '—' },
              { label: 'Preferred Location', value: profile?.preferredLocation || '—' },
            ].map((s) => (
              <div key={s.label} className="bg-ink-100/60 rounded-lg p-4 text-center">
                <p className="font-bold text-ink-900 truncate">{s.value}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {!editing ? (
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-1.5">About</h4>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {profile?.about ||
                    `${engineerLabel(profile?.role)}${profile?.specialization ? ` specializing in ${profile.specialization}` : ''}${
                      profile?.experienceYears ? ` with ${profile.experienceYears}+ years of experience.` : '.'
                    }`}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills?.length ? profile.skills : ['Add your skills in Edit Profile']).map((skill) => (
                    <span key={skill} className="text-xs bg-ink-100 text-ink-700 px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Languages</h4>
                <p className="text-sm text-ink-500">{profile?.languages || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Qualification</h4>
                <p className="text-sm text-ink-500">
                  {profile?.qualification || 'Not specified'}
                  {profile?.specialization ? ` · ${profile.specialization}` : ''}
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <DocLink label="Resume / CV" url={profile?.resumeURL} />
                <DocLink label="Degree Certificate" url={profile?.degreeCertificateURL} />
                <DocLink label="Government ID" url={profile?.govIdURL} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Portfolio</h4>
                {profile?.portfolioURLs?.length ? (
                  <div className="grid grid-cols-3 gap-3">
                    {profile.portfolioURLs.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-500">No portfolio images uploaded yet.</p>
                )}
              </div>
            </div>
          ) : (
            <form id="engineer-profile-form" onSubmit={handleSave} className="mt-6 space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">About</h4>
                <textarea
                  rows={3}
                  value={form.about}
                  onChange={(e) => update('about', e.target.value)}
                  placeholder="A short summary clients will see on your profile"
                  className="input-field"
                />
              </section>

              <section className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Date of Birth</label>
                  <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Gender</label>
                  <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input-field">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Current Address</label>
                  <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">State</label>
                  <input value={form.state} onChange={(e) => update('state', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">City</label>
                  <input value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">PIN Code</label>
                  <input value={form.pinCode} onChange={(e) => update('pinCode', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Languages Known</label>
                  <input value={form.languages} onChange={(e) => update('languages', e.target.value)} className="input-field" />
                </div>
              </section>

              <section className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Qualification</label>
                  <select value={form.qualification} onChange={(e) => update('qualification', e.target.value)} className="input-field">
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Specialization</label>
                  <select value={form.specialization} onChange={(e) => update('specialization', e.target.value)} className="input-field">
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
                    type="number"
                    min="0"
                    max="60"
                    value={form.experienceYears}
                    onChange={(e) => update('experienceYears', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Preferred Job Location</label>
                  <input value={form.preferredLocation} onChange={(e) => update('preferredLocation', e.target.value)} className="input-field" />
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
                          form.availability === opt ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-100 text-ink-700 hover:border-ink-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-ink-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                        skills.includes(skill) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-100 text-ink-700 hover:border-ink-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Replace Resume / CV</label>
                  <FileInput accept=".pdf,.doc,.docx" file={resumeFile} onChange={setResumeFile} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">Replace Degree Certificate</label>
                  <FileInput accept=".pdf,image/*" file={degreeFile} onChange={setDegreeFile} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 mb-1 block">
                    {profile?.govIdURL ? 'Replace Government ID' : 'Upload Government ID (Aadhaar/PAN)'}
                  </label>
                  <FileInput accept=".pdf,image/*" file={govIdFile} onChange={setGovIdFile} />
                </div>
              </section>

              <section>
                <label className="text-xs font-medium text-ink-500 mb-1 block">Add Portfolio Images</label>
                <FileInput accept="image/*" multiple files={portfolioFiles} onChangeMultiple={setPortfolioFiles} />
                {profile?.portfolioURLs?.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {profile.portfolioURLs.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(src)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function DocLink({ label, url }) {
  return (
    <div className="bg-ink-100/60 rounded-lg px-3 py-2.5">
      <p className="text-xs text-ink-500">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 font-medium hover:underline">
          View file
        </a>
      ) : (
        <p className="text-ink-500">Not uploaded</p>
      )}
    </div>
  )
}

function FileInput({ accept, multiple, file, files, onChange, onChangeMultiple }) {
  const label = multiple ? (files?.length ? `${files.length} file(s) selected` : 'Choose files') : file?.name || 'Choose file'
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
          if (multiple) onChangeMultiple(Array.from(e.target.files || []))
          else onChange(e.target.files?.[0] || null)
        }}
      />
    </label>
  )
}
