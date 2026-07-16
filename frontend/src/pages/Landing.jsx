import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import EcgStripEnhanced from '../components/EcgStripEnhanced'
import StatusDot from '../components/StatusDot'
import ThemeToggle from '../components/ThemeToggle'
import { mockLatestVitals } from '../utils/mockData'
import {
  HeartRateIcon,
  AlertIcon,
  ClockIcon,
  CheckCircleIcon,
} from '../components/icons'
import useCountUp from '../hooks/useCountUp'

const features = [
  {
    Icon: HeartRateIcon,
    title: 'Track what matters',
    body: 'Heart rate, blood pressure, oxygen levels, temperature — log them as you go and see your trends take shape over time.',
  },
  {
    Icon: AlertIcon,
    title: 'Learns what\'s normal for you',
    body: 'Instead of comparing you to some generic range, VitalWatch learns your personal baseline and lets you know when something seems off.',
  },
  {
    Icon: ClockIcon,
    title: 'Heads up when it counts',
    body: 'If a reading doesn\'t look right, you\'ll know about it right away — no waiting around, no checking manually.',
  },
  {
    Icon: CheckCircleIcon,
    title: 'Your data, your rules',
    body: 'Only the people you choose — family, a caregiver, your doctor — can see your health info. Nobody else.',
  },
]



const steps = [
  {
    n: '01',
    title: 'Take a reading',
    body: 'Check your vitals like you normally would and punch them in — takes about 10 seconds.',
  },
  {
    n: '02',
    title: 'It picks up your patterns',
    body: 'Over time, the app figures out what\'s typical for you. Not textbook ranges — your ranges.',
  },
  {
    n: '03',
    title: 'You\'ll hear about it',
    body: 'If something looks unusual compared to your normal, you and your care circle get a heads up right away.',
  },
]

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function MiniStat({ label, value, unit }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-mist text-[10px] uppercase tracking-wide mb-1">{label}</p>
      <p key={value} className="font-mono text-white text-sm" style={{ animation: 'fade-up 0.4s ease-out both' }}>
        {value}
        {unit && <span className="text-mist text-[10px] ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}

function AnimatedStat6in10() {
  const [ref, count] = useCountUp(6, { duration: 1800 })
  return (
    <div ref={ref}>
      <p className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-signal">
        {count} in 10
      </p>
      <p className="text-mist text-xs uppercase tracking-wide">US Adults Live With a Chronic Condition</p>
    </div>
  )
}

function AnimatedStat90() {
  const [ref, count] = useCountUp(90, { duration: 2000 })
  return (
    <div ref={ref}>
      <p className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-amber">
        {count}%
      </p>
      <p className="text-mist text-xs uppercase tracking-wide">of Healthcare Spending Goes to Chronic Care</p>
    </div>
  )
}

function AnimatedStat9in10() {
  const [ref, count] = useCountUp(9, { duration: 1600 })
  return (
    <div ref={ref}>
      <p className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-pulse">
        {count} in 10
      </p>
      <p className="text-mist text-xs uppercase tracking-wide">With Kidney Disease Don't Know It</p>
    </div>
  )
}

function AnimatedStat1530() {
  const [ref15, count15] = useCountUp(15, { duration: 1800 })
  const [ref30, count30] = useCountUp(30, { duration: 2200 })
  return (
    <div
      ref={(node) => {
        ref15.current = node
        ref30.current = node
      }}
    >
      <p className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-white">
        {count15}–{count30}%
      </p>
      <p className="text-mist text-xs uppercase tracking-wide">Fewer Readmissions With Remote Monitoring</p>
    </div>
  )
}

/* ── Floating Particles Background ─────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    size: 2 + (i % 4),
    delay: `${(i * 1.7) % 12}s`,
    duration: `${14 + (i % 8) * 2}s`,
    opacity: 0.08 + (i % 5) * 0.04,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(var(--vw-particle-rgb), ${p.opacity + 0.1})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(var(--vw-particle-rgb), ${p.opacity})`,
            animation: `drift-up ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Ambient Gradient Orbs ───────────────────────────── */
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-right large orb */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(var(--vw-particle-rgb),0.12) 0%, transparent 70%)',
          animation: 'breathe 10s ease-in-out infinite',
        }}
      />
      {/* Left mid orb */}
      <div
        className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(var(--vw-particle-rgb),0.07) 0%, transparent 70%)',
          animation: 'breathe 12s ease-in-out 3s infinite',
        }}
      />
      {/* Center bottom orb */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(var(--vw-particle-rgb),0.06) 0%, transparent 70%)',
          animation: 'breathe 14s ease-in-out 5s infinite',
        }}
      />
      {/* Subtle accent orb — warm */}
      <div
        className="absolute top-2/3 right-0 w-[250px] h-[250px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(var(--vw-particle-rgb),0.05) 0%, transparent 70%)',
          animation: 'breathe 11s ease-in-out 7s infinite',
        }}
      />
    </div>
  )
}

function Landing() {
  const [previewVitals, setPreviewVitals] = useState(() => mockLatestVitals())
  const [activeFeature, setActiveFeature] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const autoPlayRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setPreviewVitals(mockLatestVitals()), 2500)
    return () => clearInterval(id)
  }, [])

  // Auto-rotate feature carousel every 4.5s, pause on hover
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    autoPlayRef.current = setInterval(() => {
      setActiveFeature((i) => (i + 1) % features.length)
    }, 4500)
  }, [])

  useEffect(() => {
    if (!isHovering) startAutoPlay()
    else if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) }
  }, [isHovering, startAutoPlay])

  const nextFeature = () => {
    setActiveFeature((i) => (i + 1) % features.length)
    startAutoPlay()
  }
  const prevFeature = () => {
    setActiveFeature((i) => (i - 1 + features.length) % features.length)
    startAutoPlay()
  }
  const feature = features[activeFeature]

  return (
    <div className="bg-ink min-h-screen relative">
      {/* Global ambient layers */}
      <AmbientOrbs />
      <FloatingParticles />
      <div className="grid-paper fixed inset-0 pointer-events-none z-0 opacity-40" />
      <header className="sticky top-0 z-20 bg-ink/80 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-signal" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2-6 4 12 2-6h8" />
            </svg>
            <span className="font-display text-white text-lg">VitalWatch</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-mist">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-mist hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-signal text-ink font-medium text-sm px-4 py-2 rounded-lg hover:bg-signal/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden z-10">

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 bg-surface border border-border-soft rounded-full px-3 py-1.5 mb-6"
            style={{ animation: 'fade-up 0.5s ease-out both' }}
          >
            <StatusDot color="signal" pulse />
            <span className="text-mist text-xs font-mono uppercase tracking-wide">Stay ahead of the curve</span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5"
            style={{ animation: 'fade-up 0.5s ease-out 0.05s both' }}
          >
            Know something's off<br />before it becomes a problem.
          </h1>

          <p
            className="text-mist text-base sm:text-lg max-w-xl mx-auto mb-8"
            style={{ animation: 'fade-up 0.5s ease-out 0.1s both' }}
          >
            VitalWatch keeps an eye on your vitals and learns what's normal
            for you specifically. When something doesn't look right, the people
            who care about you find out — no delay.
          </p>

          <div
            className="flex items-center justify-center gap-3 mb-16"
            style={{ animation: 'fade-up 0.5s ease-out 0.15s both' }}
          >
            <Link
              to="/register"
              className="bg-signal text-ink font-semibold px-6 py-3 rounded-lg hover:bg-signal/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-border-soft text-white font-medium px-6 py-3 rounded-lg hover:border-signal/50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div
            className="bg-surface border border-border-soft rounded-2xl overflow-hidden max-w-2xl mx-auto text-left"
            style={{ animation: 'fade-up 0.6s ease-out 0.2s both' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-mist/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-mist/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-mist/30" />
              </div>
              <span className="text-mist text-xs font-mono uppercase tracking-wide">Live preview</span>
              <div className="flex items-center gap-1.5">
                <StatusDot color="signal" pulse />
                <span className="text-mist text-xs">Live</span>
              </div>
            </div>
            <EcgStripEnhanced height={100} speed={2} glowIntensity={1.2} />
            <div className="grid grid-cols-4 divide-x divide-border-soft border-t border-border-soft">
              <MiniStat label="HR" value={previewVitals.heartRate} unit="bpm" />
              <MiniStat label="BP" value={`${previewVitals.systolic}/${previewVitals.diastolic}`} unit="" />
              <MiniStat label="SpO2" value={previewVitals.spo2} unit="%" />
              <MiniStat label="Temp" value={previewVitals.temperature} unit="°C" />
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="relative z-10 border-t border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <AnimatedStat6in10 />
            <AnimatedStat90 />
            <AnimatedStat9in10 />
            <AnimatedStat1530 />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            One place for the whole picture
          </h2>
          <p className="text-mist text-sm max-w-lg mx-auto">
            Not just numbers on a screen — tools that actually help you act on them.
          </p>
        </div>

        <div
          className="flex items-center justify-center gap-4 max-w-2xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <button
            onClick={prevFeature}
            className="h-10 w-10 shrink-0 rounded-full border border-border-soft flex items-center justify-center text-mist hover:text-white hover:border-signal/50 transition-colors cursor-pointer"
            aria-label="Previous feature"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            key={activeFeature}
            className="bg-surface/80 backdrop-blur-sm border border-border-soft rounded-2xl p-8 w-full max-w-lg min-h-[210px] flex flex-col items-center justify-center text-center"
            style={{ animation: 'fade-up 0.35s ease-out both' }}
          >
            <div className="h-11 w-11 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-4">
              <feature.Icon className="h-5 w-5" />
            </div>
            <h3 className="text-white font-medium mb-2">{feature.title}</h3>
            <p className="text-mist text-sm leading-relaxed max-w-md">{feature.body}</p>
          </div>

          <button
            onClick={nextFeature}
            className="h-10 w-10 shrink-0 rounded-full border border-border-soft flex items-center justify-center text-mist hover:text-white hover:border-signal/50 transition-colors cursor-pointer"
            aria-label="Next feature"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {features.map((f, i) => (
            <button
              key={f.title}
              onClick={() => { setActiveFeature(i); startAutoPlay() }}
              aria-label={`Go to ${f.title}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === activeFeature ? 'w-6 bg-signal' : 'w-1.5 bg-border-soft hover:bg-mist'
                }`}
            />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-border-soft">
        <div className="text-center mb-14">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Simple as it sounds
          </h2>
          <p className="text-mist text-sm max-w-lg mx-auto">
            Three steps. That's really it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="border-t-2 border-signal pt-5">
              <span className="font-mono text-signal text-sm">{s.n}</span>
              <h3 className="text-white font-medium mt-2 mb-2">{s.title}</h3>
              <p className="text-mist text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
          Ready when you are.
        </h2>
        <p className="text-mist text-sm mb-8">
          No fancy equipment needed. Just start logging your vitals and
          the app takes it from there.
        </p>
        <Link
          to="/register"
          className="inline-block bg-signal text-ink font-semibold px-6 py-3 rounded-lg hover:bg-signal/90 transition-colors"
        >
          Get Started
        </Link>
      </section>

      <footer className="relative z-10 border-t border-border-soft">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-signal" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h4l2-6 4 12 2-6h8" />
              </svg>
              <span className="text-white text-sm font-medium">VitalWatch</span>
            </div>
            <p className="text-mist text-xs mb-4">Keep tabs on the vitals that matter.</p>

            <a
              href="https://github.com/sharonxlal20/vitalwatch"
              target="_blank"
              rel="noreferrer"
              className="text-mist hover:text-white text-sm transition-colors"
            >
              View on GitHub ↗
            </a>
          </div>

          <div>
            <p className="text-white text-sm font-medium mb-3">Explore</p>
            <div className="flex flex-col gap-2">
              <a href="#features" className="text-mist text-sm hover:text-white transition-colors">Features</a>
              <a href="#stats" className="text-mist text-sm hover:text-white transition-colors">Stats</a>
              <a href="#how-it-works" className="text-mist text-sm hover:text-white transition-colors">How it works</a>
            </div>
          </div>

          <div>
            <p className="text-white text-sm font-medium mb-3">Ready when you are</p>
            <p className="text-mist text-xs mb-4">Takes less than a minute to get going.</p>
            <Link
              to="/register"
              className="inline-block bg-signal text-ink font-medium text-sm px-4 py-2 rounded-lg hover:bg-signal/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="border-t border-border-soft">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <p className="text-mist text-xs">© 2026 VitalWatch</p>
            <p className="text-mist text-xs">built by Sharon</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing