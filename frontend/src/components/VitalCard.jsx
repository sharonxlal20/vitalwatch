import StatusDot from './StatusDot'

const statusStyles = {
  normal: { icon: 'bg-signal/10 text-signal', dot: 'signal' },
  warning: { icon: 'bg-amber/10 text-amber', dot: 'amber' },
  critical: { icon: 'bg-pulse/10 text-pulse', dot: 'pulse' },
}

// Each vital gets its own physically-relevant hover animation, applied to the
// icon glyph itself (not just its background chip) so it's actually visible.
const hoverAnim = {
  heartRate: 'group-hover:animate-[heartbeat_0.9s_ease-in-out_infinite]',
  bloodPressure: 'group-hover:animate-[cuff-pulse_1s_ease-in-out_infinite]',
  spo2: 'group-hover:animate-[bubble-float_1.6s_ease-in-out_infinite]',
  temperature: 'group-hover:animate-[mercury-rise_1.1s_ease-in-out_infinite]',
}

export default function VitalCard({ icon: Icon, label, value, unit, status = 'normal', updatedLabel, variant }) {
  const styles = statusStyles[status] || statusStyles.normal

  return (
    <div
      className="group bg-surface border border-border-soft rounded-2xl p-5 flex flex-col gap-4
                 transition-all duration-200 ease-out cursor-default
                 hover:-translate-y-1 hover:scale-[1.02] hover:border-signal/40"
      style={{ animation: 'fade-up 0.5s ease-out both' }}
    >
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <Icon
            className={`h-5 w-5 ${hoverAnim[variant] || ''}`}
            style={{ transformOrigin: variant === 'temperature' ? 'bottom center' : 'center' }}
          />
        </div>
        <StatusDot color={styles.dot} pulse={status === 'critical'} />
      </div>
      <div>
        <p className="text-mist text-xs uppercase tracking-wide mb-1">{label}</p>
        <p className="font-mono text-white text-2xl font-semibold leading-none">
          {value}
          <span className="text-mist text-sm font-normal ml-1">{unit}</span>
        </p>
      </div>
      {updatedLabel && <p className="text-mist text-[11px]">{updatedLabel}</p>}
    </div>
  )
}