import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EcgStripEnhanced from '../components/EcgStripEnhanced'
import VitalCard from '../components/VitalCard'
import VitalsChart from '../components/VitalsChart'
import VitalsForm from '../components/VitalsForm'
import AlertsPanel from '../components/AlertsPanel'
import StatusDot from '../components/StatusDot'
import ThemeToggle from '../components/ThemeToggle'
import { SkeletonCard, SkeletonChart, SkeletonAlerts } from '../components/SkeletonCard'
import { HeartRateIcon, BloodPressureIcon, OxygenIcon, TemperatureIcon, LogOutIcon } from '../components/icons'
import { fetchLatestVitals, fetchVitalsHistory, fetchAlerts, logVital, acknowledgeAlert } from '../utils/api'
import { mockLatestVitals, mockHistory, mockAlerts } from '../utils/mockData'
import { timeAgo } from '../utils/format'

function vitalStatus(type, vitals) {
  if (!vitals) return 'normal'
  if (type === 'heartRate') {
    if (vitals.heartRate > 120 || vitals.heartRate < 50) return 'critical'
    if (vitals.heartRate > 100 || vitals.heartRate < 55) return 'warning'
  }
  if (type === 'spo2') {
    if (vitals.spo2 < 92) return 'critical'
    if (vitals.spo2 < 95) return 'warning'
  }
  if (type === 'temperature') {
    if (vitals.temperature > 38.5) return 'critical'
    if (vitals.temperature > 37.5) return 'warning'
  }
  if (type === 'bloodPressure') {
    if (vitals.systolic > 160 || vitals.diastolic > 100) return 'critical'
    if (vitals.systolic > 140 || vitals.diastolic > 90) return 'warning'
  }
  return 'normal'
}

export default function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('vw_token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const localUser = JSON.parse(localStorage.getItem('vw_user') || '{}')
  const PATIENT_ID = localUser.id || 'demo-patient'
  const [latestVitals, setLatestVitals] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [activeType, setActiveType] = useState('heartRate')
  const [allHistory, setAllHistory] = useState({
    heartRate: [],
    bloodPressure: [],
    spo2: [],
    temperature: [],
  })
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time clock hook
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadCore = useCallback(async () => {
    try {
      const [vitals, alertList] = await Promise.all([
        fetchLatestVitals(PATIENT_ID),
        fetchAlerts(PATIENT_ID),
      ])
      setLatestVitals(vitals)
      setAlerts(alertList)
      setUsingMock(false)
    } catch {
      setLatestVitals(mockLatestVitals())
      setAlerts(mockAlerts())
      setUsingMock(true)
    } finally {
      // Small fake delay to appreciate the skeleton animations
      setTimeout(() => setLoading(false), 800)
    }
  }, [PATIENT_ID])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  // Load all history on mount or when mock mode changes
  useEffect(() => {
    let cancelled = false
    async function loadAllHistory() {
      const types = ['heartRate', 'bloodPressure', 'spo2', 'temperature']
      const results = {}
      await Promise.all(
        types.map(async (t) => {
          try {
            if (usingMock) throw new Error('mock mode')
            const history = await fetchVitalsHistory(PATIENT_ID, t)
            results[t] = history
          } catch {
            results[t] = mockHistory(t)
          }
        })
      )
      if (!cancelled) {
        setAllHistory(results)
      }
    }
    loadAllHistory()
    return () => {
      cancelled = true
    }
  }, [usingMock, PATIENT_ID])

  const handleLogVital = async (payload) => {
    // Optimistic / mock updates
    const nowStr = new Date().toISOString()
    const updated = { ...latestVitals, ...payload, updatedAt: nowStr }
    setLatestVitals(updated)

    // Update history cache so sparklines and main chart update instantly
    setAllHistory((prev) => {
      const next = { ...prev }
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'systolic' || k === 'diastolic') {
          // BP updates
          if (payload.systolic != null && payload.diastolic != null) {
            next.bloodPressure = [
              ...next.bloodPressure,
              { recordedAt: nowStr, systolic: payload.systolic, diastolic: payload.diastolic },
            ].slice(-24) // limit to latest 24 readings
          }
        } else if (next[k]) {
          next[k] = [...next[k], { recordedAt: nowStr, value: v }].slice(-24)
        }
      })
      return next
    })

    if (!usingMock) {
      try {
        await logVital({ ...payload, patientId: PATIENT_ID })
      } catch (err) {
        console.error('Failed to log vital to server:', err)
      }
    }
  }

  const handleAcknowledge = async (alertId) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)))
    if (!usingMock) {
      try {
        await acknowledgeAlert(alertId)
      } catch {
        // Safe demo ignore
      }
    }
  }

  // Get sparkline arrays for each card
  const getSparklinePoints = (type) => {
    const hist = allHistory[type] || []
    if (type === 'bloodPressure') {
      return hist.map((d) => d.systolic)
    }
    return hist.map((d) => d.value)
  }

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="min-h-screen bg-ink text-white transition-colors duration-300">
      {/* Navigation */}
      <header className="sticky top-0 z-10 bg-ink/80 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-signal animate-[breathe_3s_infinite]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2-6 4 12 2-6h8" />
            </svg>
            <span className="font-display text-white text-lg font-semibold tracking-wide">VitalWatch</span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Real-time Clock */}
            <div className="hidden md:flex flex-col items-end text-xs font-mono text-mist">
              <span className="text-white font-medium">{formattedTime}</span>
              <span className="text-[10px] text-mist/60">Live Monitor</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-mist bg-border-soft/30 px-2.5 py-1 rounded-full border border-border-soft/50">
              <StatusDot color="signal" pulse />
              <span className="font-medium font-mono text-white">Live Link</span>
            </div>
            
            <ThemeToggle />
            
            <div className="flex items-center gap-2 border-l border-border-soft pl-5">
              <span className="text-mist text-xs font-medium">{localUser.name || 'Demo Patient'}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('vw_token')
                  localStorage.removeItem('vw_user')
                  navigate('/login')
                }}
                className="text-mist hover:text-white transition-colors cursor-pointer p-1 hover:bg-border-soft/40 rounded-lg"
                title="Log Out"
              >
                <LogOutIcon className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Signature ECG strip (Enhanced real-time canvas model) */}
      <div className="border-b border-border-soft bg-ink/50 relative overflow-hidden">
        <EcgStripEnhanced height={110} color="var(--color-signal)" speed={1.8} />
      </div>

      {/* Patient Information Panel */}
      <div className="border-b border-border-soft/40 bg-white/[0.01] py-2 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-mist gap-3">
          <div className="flex items-center gap-4">
            <span>Subject: <strong className="text-white">Demographics #0981</strong></span>
            <span className="h-3 w-px bg-border-soft" />
            <span>Age/Sex: <strong className="text-white">42 / Male</strong></span>
            <span className="h-3 w-px bg-border-soft" />
            <span>Status: <span className="text-signal font-semibold">STABLE</span></span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Telemetry: Lead II</span>
            <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        {usingMock && (
          <div className="bg-amber/5 border border-amber/20 text-amber text-xs rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber animate-ping" />
              Showing demo data mode — local API server not reachable. Readings will simulated-save.
            </span>
            <button
              onClick={() => {
                setLoading(true)
                loadCore()
              }}
              className="text-[10px] uppercase font-bold tracking-wider hover:underline"
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <>
            {/* Skeletons Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonChart />
              </div>
              <div className="lg:col-span-1">
                <SkeletonAlerts />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Latest vitals summary grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <VitalCard
                icon={HeartRateIcon}
                label="Heart Rate"
                variant="heartRate"
                value={latestVitals?.heartRate ?? '—'}
                unit="bpm"
                status={vitalStatus('heartRate', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
                isActive={activeType === 'heartRate'}
                onClick={() => setActiveType('heartRate')}
                sparklineData={getSparklinePoints('heartRate')}
                index={0}
              />
              <VitalCard
                icon={BloodPressureIcon}
                label="Blood Pressure"
                variant="bloodPressure"
                value={latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '—'}
                unit="mmHg"
                status={vitalStatus('bloodPressure', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
                isActive={activeType === 'bloodPressure'}
                onClick={() => setActiveType('bloodPressure')}
                sparklineData={getSparklinePoints('bloodPressure')}
                index={1}
              />
              <VitalCard
                icon={OxygenIcon}
                label="SpO2"
                variant="spo2"
                value={latestVitals?.spo2 ?? '—'}
                unit="%"
                status={vitalStatus('spo2', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
                isActive={activeType === 'spo2'}
                onClick={() => setActiveType('spo2')}
                sparklineData={getSparklinePoints('spo2')}
                index={2}
              />
              <VitalCard
                icon={TemperatureIcon}
                label="Temperature"
                variant="temperature"
                value={latestVitals?.temperature ?? '—'}
                unit="°C"
                status={vitalStatus('temperature', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
                isActive={activeType === 'temperature'}
                onClick={() => setActiveType('temperature')}
                sparklineData={getSparklinePoints('temperature')}
                index={3}
              />
            </div>

            {/* Interactive chart, forms, and alerts panels */}
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <VitalsChart
                  activeType={activeType}
                  onChangeType={setActiveType}
                  data={allHistory[activeType] || []}
                />
                <VitalsForm onSubmit={handleLogVital} />
              </div>
              <div className="lg:col-span-1 lg:sticky lg:top-24">
                <AlertsPanel
                  alerts={alerts}
                  onAcknowledge={handleAcknowledge}
                  onSelectVital={setActiveType}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}