import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Matches src/index.css design tokens. Recharts takes real color values, not
// Tailwind classes, so these are the hex equivalents of --color-signal etc.
const COLORS = {
  signal: '#17B890',
  amber: '#E3A008',
  mist: '#A1A1AA',
  borderSoft: '#262626',
  surface: '#151515',
}

const TABS = [
  { key: 'heartRate', label: 'Heart Rate' },
  { key: 'bloodPressure', label: 'Blood Pressure' },
  { key: 'spo2', label: 'SpO2' },
  { key: 'temperature', label: 'Temperature' },
]

function formatTick(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border-soft rounded-lg px-3 py-2 text-xs">
      <p className="text-mist mb-1">{formatTick(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function VitalsChart({ activeType, onChangeType, data }) {
  const isBP = activeType === 'bloodPressure'

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="font-display text-white text-base">Vitals Trend</h3>
        <div className="flex gap-1 bg-ink border border-border-soft rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onChangeType(tab.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeType === tab.key
                  ? 'bg-signal text-ink font-medium'
                  : 'text-mist hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.borderSoft} vertical={false} />
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
            <Tooltip content={<CustomTooltip />} />
            {isBP ? (
              <>
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke={COLORS.signal} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke={COLORS.amber} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </>
            ) : (
              <Line type="monotone" dataKey="value" name="Value" stroke={COLORS.signal} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
