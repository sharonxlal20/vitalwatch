import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Connecting...')
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 relative overflow-hidden">

      {/* Soft decorative blob — the only background element */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-signal/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-signal/10 rounded-full blur-3xl"></div>

      {/* Small accent sparkle, echoing a heartbeat mark instead of a generic star */}
      <svg className="absolute bottom-16 right-16 w-6 h-6 text-signal/40" viewBox="0 0 24 24" fill="none">
        <path d="M2 12h4l2-6 4 12 2-6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight mb-2">
            VitalWatch
          </h1>
          <p className="text-mist text-sm">Sign in to monitor your vitals</p>
        </div>

        <div className="bg-surface border border-border-soft rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink border border-border-soft rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-signal text-ink font-semibold py-3 rounded-lg hover:bg-signal/90 transition-colors"
            >
              Sign In
            </button>

            {status && <p className="text-mist text-sm text-center">{status}</p>}
          </form>

          <p className="text-center text-mist text-sm mt-6">
            Don't have an account? <span className="text-signal cursor-pointer hover:underline font-medium">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login