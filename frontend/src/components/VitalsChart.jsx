import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'

// Read live theme colors from CSS custom properties so the chart
// automatically adapts when the user toggles light/dark mode.
function useChartColors() {
  const { theme } = useTheme()
  return useMemo(() => {
    const s = getComputedStyle(document.documentElement)
    const get = (name) => s.getPropertyValue(name).trim()
    return {
      signal: get('--color-signal') || '#17B890',
      amber: get('--color-amber') || '#E3A008',
      pulse: get('--color-pulse') || '#E8553D',
      mist: get('--color-mist') || '#A1A1AA',
      borderSoft: get('--color-border-soft') || '#262626',
      surface: get('--color-surface') || '#151515',
      white: get('--color-white') || '#FFFFFF',
      ink: get('--color-ink') || '#0A0A0A',
    }
  }, [theme]) // recompute when theme flips
}

const TABS = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm' },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
  { key: 'spo2', label: 'SpO2', unit: '%' },
  { key: 'temperature', label: 'Temperature', unit: '°C' },
]

// Normal ranges for reference bands
const NORMAL_RANGES = {
  heartRate: { low: 60, high: 100 },
  spo2: { low: 95, high: 100 },
  temperature: { low: 36.1, high: 37.2 },
  // BP has two sets
  bloodPressure: { sysLow: 90, sysHigh: 140, diaLow: 60, diaHigh: 90 },
}

function formatTick(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function computeStats(data, key) {
  if (!data || data.length === 0) return null
  const values = data.map((d) => d[key]).filter((v) => v != null)
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
  return { min, max, avg }
}

function CustomTooltip({ active, payload, label, activeType }) {
  if (!active || !payload?.length) return null
  const currentTab = TABS.find((t) => t.key === activeType)

  return (
    <div className="bg-surface/95 backdrop-blur-sm border border-border-soft rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-mist mb-2 font-medium">{formatTick(label)}</p>
      {payload.map((p, i) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-mist">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>
            {p.value} {currentTab?.unit || ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatBadge({ label, value, unit, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-mist uppercase tracking-wider">{label}</span>
      <span className="font-mono text-sm font-semibold" style={{ color }}>
        {value}
        <span className="text-mist text-[10px] font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  )
}

export default function VitalsChart({ activeType, onChangeType, data }) {
  const isBP = activeType === 'bloodPressure'
  const COLORS = useChartColors()
  const [transitioning, setTransitioning] = useState(false)

  const currentTab = TABS.find((t) => t.key === activeType)
  const range = NORMAL_RANGES[activeType]

  // Compute summary stats
  const stats = useMemo(() => {
    if (isBP) {
      return {
        sys: computeStats(data, 'systolic'),
        dia: computeStats(data, 'diastolic'),
      }
    }
    return { main: computeStats(data, 'value') }
  }, [data, isBP])

  const handleTabChange = (key) => {
    if (key === activeType) return
    setTransitioning(true)
    setTimeout(() => {
      onChangeType(key)
      setTransitioning(false)
    }, 150)
  }

  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5"
      style={{ animation: 'stagger-fade-up 0.5s ease-out 0.3s both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-white text-base">Vitals Trend</h3>
          {currentTab && (
            <p className="text-mist text-[11px] mt-0.5">{currentTab.label} over the last 24 hours</p>
          )}
        </div>
        <div className="flex gap-1 bg-ink border border-border-soft rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                activeType === tab.key
                  ? 'bg-signal text-ink font-medium shadow-sm'
                  : 'text-mist hover:text-white hover:bg-border-soft/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {!isBP && stats.main && (
        <div className="flex items-center gap-6 mb-4 px-2 py-2 bg-ink/50 rounded-lg border border-border-soft/50">
          <StatBadge label="Min" value={stats.main.min} unit={currentTab?.unit} color={COLORS.amber} />
          <StatBadge label="Avg" value={stats.main.avg} unit={currentTab?.unit} color={COLORS.signal} />
          <StatBadge label="Max" value={stats.main.max} unit={currentTab?.unit} color={COLORS.pulse} />
          {range && (
            <div className="flex items-center gap-1.5 ml-auto text-[10px] text-mist">
              <span className="h-1.5 w-4 rounded-full bg-signal/20" />
              Normal: {range.low}–{range.high}
            </div>
          )}
        </div>
      )}
      {isBP && stats.sys && stats.dia && (
        <div className="flex items-center gap-6 mb-4 px-2 py-2 bg-ink/50 rounded-lg border border-border-soft/50">
          <StatBadge label="Sys Avg" value={stats.sys.avg} unit="mmHg" color={COLORS.signal} />
          <StatBadge label="Dia Avg" value={stats.dia.avg} unit="mmHg" color={COLORS.amber} />
          <StatBadge label="Sys Max" value={stats.sys.max} unit="mmHg" color={COLORS.pulse} />
        </div>
      )}

      {/* Chart */}
      <div
        className="h-64 transition-opacity duration-200"
        style={{ opacity: transitioning ? 0.3 : 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSignal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.signal} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.signal} stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={COLORS.borderSoft} strokeDasharray="3 3" vertical={false} />

            {/* Normal range shaded band */}
            {!isBP && range && (
              <ReferenceArea
                y1={range.low}
                y2={range.high}
                fill={COLORS.signal}
                fillOpacity={0.04}
                stroke="none"
              />
            )}

            <XAxis
              dataKey="recordedAt"
              tickFormatter={formatTick}
              stroke={COLORS.mist}
              tick={{ fontSize: 11, fill: COLORS.mist }}
              axisLine={{ stroke: COLORS.borderSoft }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              stroke={COLORS.mist}
              tick={{ fontSize: 11, fill: COLORS.mist }}
              axisLine={false}
              tickLine={false}
              width={40}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip activeType={activeType} />} />

            {/* Normal range reference lines */}
            {!isBP && range && (
              <>
                <ReferenceLine
                  y={range.low}
                  stroke={COLORS.signal}
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  y={range.high}
                  stroke={COLORS.signal}
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
              </>
            )}

            {isBP ? (
              <>
                <Area
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke={COLORS.signal}
                  strokeWidth={2.5}
                  fill="url(#gradSignal)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: COLORS.signal, fill: COLORS.surface }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke={COLORS.amber}
                  strokeWidth={2}
                  fill="url(#gradAmber)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: COLORS.amber, fill: COLORS.surface }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="value"
                name={currentTab?.label || 'Value'}
                stroke={COLORS.signal}
                strokeWidth={2.5}
                fill="url(#gradSignal)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: COLORS.signal, fill: COLORS.surface }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
