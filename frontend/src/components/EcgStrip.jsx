import { useMemo } from 'react'
import { generateECGPath } from '../utils/ecgPath'

const HEIGHT = 100
const BASELINE = 62

export default function EcgStrip({ className = '' }) {
  const { path, totalWidth } = useMemo(() => generateECGPath(16, BASELINE), [])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        height: HEIGHT,
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)',
      }}
    >
      <div
        className="flex h-full"
        style={{ width: totalWidth * 2, animation: 'drift 18s linear infinite' }}
      >
        {[0, 1].map((copy) => (
          <svg
            key={copy}
            width={totalWidth}
            height={HEIGHT}
            viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
            preserveAspectRatio="none"
          >
            <path d={path} className="fill-none stroke-signal" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>

      {/* Scan line — the bit that actually sells the "live monitor" feel */}
      <div
        className="absolute top-0 h-full w-0.5 bg-signal/60"
        style={{ animation: 'sweep 4s linear infinite' }}
      />
    </div>
  )
}