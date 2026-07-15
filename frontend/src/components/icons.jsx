// Small stroke-based icon set, matched to the heartbeat mark used on Login.
// Consistent: 1.8 stroke width, round caps/joins, currentColor, 24x24 viewBox.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HeartRateIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M2 12h4l2-6 4 12 2-6h8" />
    </svg>
  )
}

export function BloodPressureIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M12 3c3.6 3.8 6 7 6 9.8a6 6 0 0 1-12 0C6 10 8.4 6.8 12 3Z" />
      <path d="M9.5 13.2h5" />
    </svg>
  )
}

export function OxygenIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M12 2.5c3 4 5.5 7.7 5.5 11a5.5 5.5 0 1 1-11 0c0-3.3 2.5-7 5.5-11Z" />
    </svg>
  )
}

export function TemperatureIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M12 14.5V4.5a2 2 0 1 0-4 0v10a4 4 0 1 0 4 0Z" />
      <path d="M10 7.5h1.2" />
    </svg>
  )
}

export function AlertIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 16.8v.1" />
    </svg>
  )
}

export function CheckCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.5 2.5 5-5.2" />
    </svg>
  )
}

export function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function LogOutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}
