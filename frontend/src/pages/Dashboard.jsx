import { useEffect, useState, useCallback } from 'react'
import EcgStrip from '../components/EcgStrip'
import VitalCard from '../components/VitalCard'
import VitalsChart from '../components/VitalsChart'
import VitalsForm from '../components/VitalsForm'
import AlertsPanel from '../components/AlertsPanel'
import StatusDot from '../components/StatusDot'
import { HeartRateIcon, BloodPressureIcon, OxygenIcon, TemperatureIcon, LogOutIcon } from '../components/icons'
import { fetchLatestVitals, fetchVitalsHistory, fetchAlerts, logVital, acknowledgeAlert } from '../utils/api'
import { mockLatestVitals, mockHistory, mockAlerts } from '../utils/mockData'
import { timeAgo } from '../utils/format'

// No patient/auth context wired up yet — using a placeholder id and name
// until PatientProfile selection is built.
const PATIENT_ID = 'demo-patient'

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
  const [latestVitals, setLatestVitals] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [activeType, setActiveType] = useState('heartRate')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

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
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  useEffect(() => {
    let cancelled = false
    async function loadChart() {
      try {
        if (usingMock) throw new Error('mock mode')
        const history = await fetchVitalsHistory(PATIENT_ID, activeType)
        if (!cancelled) setChartData(history)
      } catch {
        if (!cancelled) setChartData(mockHistory(activeType))
      }
    }
    loadChart()
    return () => {
      cancelled = true
    }
  }, [activeType, usingMock])

  const handleLogVital = async (payload) => {
    if (usingMock) {
      setLatestVitals((prev) => ({ ...prev, ...payload, updatedAt: new Date().toISOString() }))
      return
    }
    await logVital({ ...payload, patientId: PATIENT_ID })
    const vitals = await fetchLatestVitals(PATIENT_ID)
    setLatestVitals(vitals)
  }

  const handleAcknowledge = async (alertId) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)))
    if (!usingMock) {
      try {
        await acknowledgeAlert(alertId)
      } catch {
        // Optimistic update already applied; a failed sync here isn't worth
        // rolling back over for a demo dashboard.
      }
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-ink/95 backdrop-blur-0 border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-signal" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2-6 4 12 2-6h8" />
            </svg>
            <span className="font-display text-white text-lg">VitalWatch</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs text-mist">
              <StatusDot color="signal" pulse />
              Live
            </div>
            <span className="text-mist text-xs hidden sm:inline">Demo Patient</span>
            <button className="text-mist hover:text-white transition-colors cursor-pointer">
              <LogOutIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Signature ECG strip */}
      <div className="border-b border-border-soft grid-paper">
        <div className="max-w-6xl mx-auto">
          <EcgStrip />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        {usingMock && (
          <div className="bg-amber/10 border border-amber/30 text-amber text-xs rounded-lg px-4 py-2.5">
            Showing demo data — backend not reachable yet. Readings here won't persist.
          </div>
        )}

        {loading ? (
          <p className="text-mist text-sm">Loading vitals…</p>
        ) : (
          <>
            {/* Latest vitals summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <VitalCard
                icon={HeartRateIcon}
                label="Heart Rate"
                variant="heartRate"
                value={latestVitals?.heartRate ?? '—'}
                unit="bpm"
                status={vitalStatus('heartRate', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
              />
              <VitalCard
                icon={BloodPressureIcon}
                label="Blood Pressure"
                variant="bloodPressure"
                value={latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '—'}
                unit="mmHg"
                status={vitalStatus('bloodPressure', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
              />
              <VitalCard
                icon={OxygenIcon}
                label="SpO2"
                variant="spo2"
                value={latestVitals?.spo2 ?? '—'}
                unit="%"
                status={vitalStatus('spo2', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
              />
              <VitalCard
                icon={TemperatureIcon}
                label="Temperature"
                variant="temperature"
                value={latestVitals?.temperature ?? '—'}
                unit="°C"
                status={vitalStatus('temperature', latestVitals)}
                updatedLabel={latestVitals?.updatedAt ? `Updated ${timeAgo(latestVitals.updatedAt)}` : undefined}
              />
            </div>

            {/* Chart + form / alerts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <VitalsChart activeType={activeType} onChangeType={setActiveType} data={chartData} />
                <VitalsForm onSubmit={handleLogVital} />
              </div>
              <div className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
                <AlertsPanel alerts={alerts} onAcknowledge={handleAcknowledge} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}