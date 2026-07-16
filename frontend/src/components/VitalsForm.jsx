import { useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon } from './icons'

const FIELDS = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 40, max: 180, step: '1', def: 75 },
  { key: 'systolic', label: 'Systolic BP', unit: 'mmHg', min: 80, max: 180, step: '1', def: 120 },
  { key: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', min: 50, max: 110, step: '1', def: 80 },
  { key: 'spo2', label: 'SpO2', unit: '%', min: 80, max: 100, step: '1', def: 98 },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 35.0, max: 41.0, step: '0.1', def: 36.8 },
]

function getFieldStatus(key, val) {
  if (val === '' || val === undefined || val === null) return 'none'
  const v = Number(val)
  if (isNaN(v)) return 'none'

  if (key === 'heartRate') {
    if (v > 120 || v < 50) return 'critical'
    if (v > 100 || v < 55) return 'warning'
    return 'normal'
  }
  if (key === 'spo2') {
    if (v < 92) return 'critical'
    if (v < 95) return 'warning'
    return 'normal'
  }
  if (key === 'temperature') {
    if (v > 38.5) return 'critical'
    if (v > 37.5) return 'warning'
    return 'normal'
  }
  if (key === 'systolic') {
    if (v > 160 || v < 85) return 'critical'
    if (v > 140 || v < 90) return 'warning'
    return 'normal'
  }
  if (key === 'diastolic') {
    if (v > 100 || v < 50) return 'critical'
    if (v > 90 || v < 60) return 'warning'
    return 'normal'
  }
  return 'normal'
}

const statusBorderClasses = {
  none: 'border-border-soft focus:border-signal focus:ring-signal/20',
  normal: 'border-signal/50 focus:border-signal focus:ring-signal/30 text-signal',
  warning: 'border-amber/50 focus:border-amber focus:ring-amber/30 text-amber',
  critical: 'border-pulse/50 focus:border-pulse focus:ring-pulse/30 text-pulse',
}

export default function VitalsForm({ onSubmit }) {
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const handleSliderChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const loadPreset = (presetType) => {
    setError('')
    if (presetType === 'normal') {
      setValues({
        heartRate: 72,
        systolic: 118,
        diastolic: 76,
        spo2: 99,
        temperature: 36.6,
      })
    } else if (presetType === 'warning') {
      setValues({
        heartRate: 104,
        systolic: 135,
        diastolic: 88,
        spo2: 94,
        temperature: 37.4,
      })
    } else if (presetType === 'critical') {
      setValues({
        heartRate: 132,
        systolic: 165,
        diastolic: 102,
        spo2: 90,
        temperature: 39.1,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const filled = Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)
    if (filled.length === 0) {
      setError('Enter at least one reading.')
      return
    }

    const payload = Object.fromEntries(filled.map(([k, v]) => [k, Number(v)]))

    setSubmitting(true)
    try {
      await onSubmit(payload)
      setValues({})
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2200)
    } catch {
      setError('Could not save — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl overflow-hidden transition-all duration-300"
      style={{ animation: 'fade-up 0.5s ease-out both' }}
    >
      {/* Accordion Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-white text-base">Log Patient Vitals</h3>
          {justSaved && (
            <span className="flex items-center gap-1 text-signal text-xs font-mono font-medium animate-pulse">
              <CheckCircleIcon className="h-4 w-4" />
              Saved successfully
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Quick actions shown when collapsed */}
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => { loadPreset('normal'); setIsOpen(true); }}
                className="text-[10px] text-signal bg-signal/10 hover:bg-signal/20 px-2 py-0.5 rounded transition-all"
              >
                Preset: Stable
              </button>
              <button
                type="button"
                onClick={() => { loadPreset('critical'); setIsOpen(true); }}
                className="text-[10px] text-pulse bg-pulse/10 hover:bg-pulse/20 px-2 py-0.5 rounded transition-all"
              >
                Preset: Critical
              </button>
            </div>
          )}
          <ChevronDownIcon
            className={`h-5 w-5 text-mist transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`}
          />
        </div>
      </div>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[800px] border-t border-border-soft/50 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Quick presets bar */}
          <div className="flex items-center gap-2 border-b border-border-soft/50 pb-3 flex-wrap">
            <span className="text-mist text-xs font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset('normal')}
              className="text-xs bg-signal/10 hover:bg-signal/20 border border-signal/20 text-signal px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Normal / Stable
            </button>
            <button
              type="button"
              onClick={() => loadPreset('warning')}
              className="text-xs bg-amber/10 hover:bg-amber/20 border border-amber/20 text-amber px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Mild Warning
            </button>
            <button
              type="button"
              onClick={() => loadPreset('critical')}
              className="text-xs bg-pulse/10 hover:bg-pulse/20 border border-pulse/20 text-pulse px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Critical Event
            </button>
            <button
              type="button"
              onClick={() => setValues({})}
              className="text-xs text-mist hover:text-white px-2.5 py-1 rounded-lg ml-auto border border-border-soft hover:border-mist/30 transition-all cursor-pointer"
            >
              Reset Form
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {FIELDS.map((f) => {
              const val = values[f.key] ?? ''
              const status = getFieldStatus(f.key, val)
              const borderClass = statusBorderClasses[status] || statusBorderClasses.none

              return (
                <div key={f.key} className="flex flex-col gap-1.5 p-3 rounded-xl bg-ink/10 border border-border-soft/30 hover:border-border-soft/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-mist text-xs font-semibold uppercase tracking-wider">
                      {f.label} <span className="normal-case text-mist/60">({f.unit})</span>
                    </span>
                    {/* Live status badge */}
                    {status !== 'none' && (
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${
                        status === 'normal' ? 'text-signal' : status === 'warning' ? 'text-amber' : 'text-pulse'
                      }`}>
                        {status}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="number"
                      step={f.step}
                      min={f.min}
                      max={f.max}
                      inputMode="decimal"
                      value={val}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder="—"
                      className={`w-24 bg-ink border rounded-lg px-3 py-1.5 font-mono text-white text-sm focus:outline-none focus:ring-2 transition-all ${borderClass}`}
                    />
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={val === '' ? f.def : val}
                      onChange={(e) => handleSliderChange(f.key, e.target.value)}
                      className="flex-1 accent-signal cursor-pointer bg-border-soft h-1 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {error && <p className="text-pulse text-xs font-mono font-medium animate-pulse">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-signal text-ink font-semibold text-sm px-6 py-2.5 rounded-xl
                         hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-signal/15"
            >
              {submitting ? 'Saving Vitals...' : 'Log Readings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
