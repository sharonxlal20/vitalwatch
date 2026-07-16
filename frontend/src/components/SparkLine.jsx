import { useMemo } from 'react'

/**
 * Tiny inline sparkline — a miniature area chart showing recent trend.
 * Takes an array of numbers and renders an SVG with a gradient fill.
 */
export default function SparkLine({
  data = [],
  width = 80,
  height = 24,
  color = 'var(--color-signal)',
  className = '',
}) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height * 0.85) - height * 0.075,
    }))

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L ${width},${height} L 0,${height} Z`

    return { line, area }
  }, [data, width, height])

  if (!data || data.length < 2) return null

  const gradId = `spark-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={pathData.area} fill={`url(#${gradId})`} />
      <path
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on latest value */}
      {data.length > 1 && (() => {
        const min = Math.min(...data)
        const max = Math.max(...data)
        const range = max - min || 1
        const lastY = height - ((data[data.length - 1] - min) / range) * (height * 0.85) - height * 0.075
        return <circle cx={width} cy={lastY} r="2" fill={color} />
      })()}
    </svg>
  )
}
