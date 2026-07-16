import { useState, useEffect, useRef } from 'react'
import StatusDot from './StatusDot'
import SparkLine from './SparkLine'

const statusStyles = {
  normal: { icon: 'bg-signal/10 text-signal', dot: 'signal', glow: 'glow-pulse-signal' },
  warning: { icon: 'bg-amber/10 text-amber', dot: 'amber', glow: 'glow-pulse-amber' },
  critical: { icon: 'bg-pulse/10 text-pulse', dot: 'pulse', glow: 'glow-pulse-pulse' },
}

// Each vital gets its own physically-relevant hover animation, applied to the
// icon glyph itself (not just its background chip) so it's actually visible.
const hoverAnim = {
  heartRate: 'group-hover:animate-[heartbeat_0.9s_ease-in-out_infinite]',
  bloodPressure: 'group-hover:animate-[cuff-pulse_1s_ease-in-out_infinite]',
  spo2: 'group-hover:animate-[bubble-float_1.6s_ease-in-out_infinite]',
  temperature: 'group-hover:animate-[mercury-rise_1.1s_ease-in-out_infinite]',
}

const sparkColors = {
  heartRate: 'var(--color-signal)',
  bloodPressure: 'var(--color-amber)',
  spo2: 'var(--color-signal)',
  temperature: 'var(--color-pulse)',
}

/**
 * useCountUpLocal — count from 0 to `end` once the element is in view.
 * Adapted to handle string values like "122/79" for blood pressure.
 */
function useCountUpLocal(rawValue, decimals = 0) {
  const [display, setDisplay] = useState('—')
  const hasPlayed = useRef(false)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || rawValue === '—' || rawValue === undefined || rawValue === null) return

    // Handle BP format "sys/dia"
    if (typeof rawValue === 'string' && rawValue.includes('/')) {
      const [sys, dia] = rawValue.split('/').map(Number)
      if (isNaN(sys) || isNaN(dia)) { setDisplay(rawValue); return }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasPlayed.current) {
            hasPlayed.current = true
            const start = performance.now()
            const duration = 1200

            const tick = (now) => {
              const elapsed = now - start
              const t = Math.min(elapsed / duration, 1)
              const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
              const curSys = Math.round(eased * sys)
              const curDia = Math.round(eased * dia)
              setDisplay(`${curSys}/${curDia}`)
              if (t < 1) requestAnimationFrame(tick)
              else setDisplay(`${sys}/${dia}`)
            }
            requestAnimationFrame(tick)
          }
        },
        { threshold: 0.3 },
      )
      observer.observe(node)
      return () => observer.disconnect()
    }

    // Handle normal numeric values
    const end = Number(rawValue)
    if (isNaN(end)) { setDisplay(String(rawValue)); return }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true
          const start = performance.now()
          const duration = 1200

          const tick = (now) => {
            const elapsed = now - start
            const t = Math.min(elapsed / duration, 1)
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            setDisplay(+(eased * end).toFixed(decimals))
            if (t < 1) requestAnimationFrame(tick)
            else setDisplay(end)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rawValue, decimals])

  return [ref, display]
}

export default function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  status = 'normal',
  updatedLabel,
  variant,
  index = 0,
  isActive = false,
  onClick,
  sparklineData,
}) {
  const styles = statusStyles[status] || statusStyles.normal
  const decimals = variant === 'temperature' ? 1 : 0
  const [countRef, displayValue] = useCountUpLocal(value, decimals)

  const shouldGlow = status === 'critical' || status === 'warning'

  return (
    <div
      ref={countRef}
      onClick={onClick}
      className={`group bg-surface border rounded-2xl p-5 flex flex-col gap-3
                 transition-all duration-300 ease-out
                 hover:-translate-y-1 hover:scale-[1.02]
                 ${isActive
                   ? 'border-signal/60 bg-signal/[0.04]'
                   : 'border-border-soft hover:border-signal/40'}
                 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        animation: `stagger-fade-up 0.5s ease-out ${index * 0.08}s both${shouldGlow ? `, ${styles.glow} 2.5s ease-in-out infinite` : ''}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${styles.icon}
                        transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
          <Icon
            className={`h-5 w-5 ${hoverAnim[variant] || ''}`}
            style={{ transformOrigin: variant === 'temperature' ? 'bottom center' : 'center' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-[10px] text-signal font-medium uppercase tracking-wider opacity-80">
              Active
            </span>
          )}
          <StatusDot color={styles.dot} pulse={status === 'critical'} />
        </div>
      </div>

      {/* Label + Value */}
      <div>
        <p className="text-mist text-xs uppercase tracking-wide mb-1">{label}</p>
        <p className="font-mono text-white text-2xl font-semibold leading-none">
          {displayValue}
          <span className="text-mist text-sm font-normal ml-1">{unit}</span>
        </p>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-auto pt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          <SparkLine
            data={sparklineData}
            width={120}
            height={22}
            color={sparkColors[variant] || 'var(--color-signal)'}
          />
        </div>
      )}

      {/* Updated label */}
      {updatedLabel && <p className="text-mist text-[11px]">{updatedLabel}</p>}
    </div>
  )
}