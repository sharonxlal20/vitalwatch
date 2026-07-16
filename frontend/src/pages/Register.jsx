import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { client } from '../utils/api'
import { EyeIcon, EyeOffIcon, HeartRateIcon, OxygenIcon, TemperatureIcon, BloodPressureIcon } from '../components/icons'
import ThemeToggle from '../components/ThemeToggle'

const floatingIcons = [
  { Icon: HeartRateIcon, left: '8%', delay: '0s', duration: '9s', size: 'h-5 w-5' },
  { Icon: OxygenIcon, left: '20%', delay: '3.2s', duration: '11s', size: 'h-4 w-4' },
  { Icon: TemperatureIcon, left: '85%', delay: '1.4s', duration: '10s', size: 'h-5 w-5' },
  { Icon: BloodPressureIcon, left: '92%', delay: '5.5s', duration: '12s', size: 'h-4 w-4' },
  { Icon: HeartRateIcon, left: '73%', delay: '7s', duration: '8.5s', size: 'h-4 w-4' },
]

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('patient')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (password !== confirmPassword) {
      setError('Passwords don\'t match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    try {
      setStatus('Creating account...')
      const { data } = await client.post('/auth/register', { name, email, password, role, age: age ? Number(age) : undefined, gender: gender || undefined })
      localStorage.setItem('vw_token', data.token)
      localStorage.setItem('vw_user', JSON.stringify(data.user))
      setStatus('Success! Redirecting...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      setStatus('')
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 relative overflow-hidden">

      {/* Theme toggle */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Breathing decorative blobs — slow, offset, alive instead of frozen */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 bg-signal/20 rounded-full blur-3xl"
        style={{ animation: 'breathe 8s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 bg-signal/10 rounded-full blur-3xl"
        style={{ animation: 'breathe 8s ease-in-out infinite 2s' }}
      />

      {/* Vital-sign glyphs drifting slowly upward through the background */}
      {floatingIcons.map((f, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{ left: f.left, animation: `drift-up ${f.duration} ease-in-out infinite`, animationDelay: f.delay }}
        >
          <f.Icon className={`${f.size} text-signal`} />
        </div>
      ))}

      <div className="w-full max-w-sm relative z-10" style={{ animation: 'fade-up 0.6s ease-out both' }}>
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* Heartbeat mark with sonar rings — matches Login's signature detail */}
            <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
              <span
                className="absolute inset-0 rounded-full border border-signal/50"
                style={{ animation: 'pulse-ring 2.4s ease-out infinite' }}
              />
              <span
                className="absolute inset-0 rounded-full border border-signal/50"
                style={{ animation: 'pulse-ring 2.4s ease-out infinite 0.8s' }}
              />
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-signal relative"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'ambient-beat 1.8s ease-in-out infinite' }}
              >
                <path d="M2 12h4l2-6 4 12 2-6h8" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              VitalWatch
            </h1>
          </div>
          <p className="text-mist text-sm">Create an account to start monitoring</p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-signal"
              style={{ animation: 'blink 1.6s ease-in-out infinite' }}
            />
            <span className="text-mist text-[11px] font-mono tracking-wide uppercase">Monitoring · 24/7</span>
          </div>
        </div>

        <div className="bg-surface border border-border-soft rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mist mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-ink border border-border-soft rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mist mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink border border-border-soft rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mist mb-2">
                I am a
              </label>
              <div className="flex gap-1 bg-ink border border-border-soft rounded-lg p-1">
                {[
                  { key: 'patient', label: 'Patient' },
                  { key: 'caregiver', label: 'Caregiver' },
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`flex-1 text-sm py-2 rounded-md transition-colors cursor-pointer ${
                      role === r.key ? 'bg-signal text-ink font-medium' : 'text-mist hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mist mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-ink border border-border-soft rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mist mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-ink border border-border-soft rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal transition-colors cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mist mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-ink border border-border-soft rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-mist mb-2">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-ink border border-border-soft rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-pulse text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-signal text-ink font-semibold py-3 rounded-lg hover:bg-signal/90 transition-colors"
            >
              Create Account
            </button>

            {status && <p className="text-mist text-sm text-center">{status}</p>}
          </form>

          <p className="text-center text-mist text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-signal hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register