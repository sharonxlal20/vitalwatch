import { useState } from 'react'
import { CheckCircleIcon } from './icons'

const FIELDS = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', step: '1' },
  { key: 'systolic', label: 'Systolic', unit: 'mmHg', step: '1' },
  { key: 'diastolic', label: 'Diastolic', unit: 'mmHg', step: '1' },
  { key: 'spo2', label: 'SpO2', unit: '%', step: '1' },
  { key: 'temperature', label: 'Temperature', unit: '°C', step: '0.1' },
]

export default function VitalsForm({ onSubmit }) {
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }))
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
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border-soft rounded-2xl p-5"
      style={{ animation: 'fade-up 0.5s ease-out both' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-white text-base">Log a Reading</h3>
        {justSaved && (
          <span className="flex items-center gap-1.5 text-signal text-xs">
            <CheckCircleIcon className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span className="text-mist text-[11px] uppercase tracking-wide">
              {f.label} <span className="normal-case text-mist/70">({f.unit})</span>
            </span>
            <input
              type="number"
              step={f.step}
              inputMode="decimal"
              value={values[f.key] ?? ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder="—"
              className="bg-ink border border-border-soft rounded-lg px-3 py-2 font-mono text-white text-sm
                         focus:outline-none focus:border-signal transition-colors
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </label>
        ))}
      </div>

      {error && <p className="text-pulse text-xs mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-signal text-ink font-medium text-sm px-4 py-2.5 rounded-lg
                   hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
      >
        {submitting ? 'Logging…' : 'Log Reading'}
      </button>
    </form>
  )
}
