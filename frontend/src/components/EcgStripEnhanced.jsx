import { useRef, useEffect, useCallback } from 'react'

// ─── Realistic Lead-II ECG Generator ──────────────────────────────
// Models each segment of the PQRST complex with clinically-plausible
// proportions and wide beat-to-beat variability in amplitude, duration,
// and rhythm (heart rate variability).

function rand(lo, hi) {
  return lo + Math.random() * (hi - lo)
}

// Attempt a smoother curve using cubic-hermite interpolation
function hermite(t) {
  return t * t * (3 - 2 * t)
}

// Attempt a gaussian-like bell for wave shapes
function bell(t, center, width) {
  const d = (t - center) / width
  return Math.exp(-d * d * 2)
}

/**
 * Generate one PQRST complex as y-offsets from baseline.
 * Returns { points: number[], width: number }
 * `points` is an array of y-deviations (positive = above baseline)
 * sampled every `step` px.
 */
function generateBeat(step = 0.8) {
  const pts = []

  // ─── Timing (in px at given step) ───
  // Real ECG at 25mm/s, 1 small box = 1mm = 0.04s
  // We scale for visual appeal. Wide beats = ~220-320px each.

  const pStart = Math.round(rand(8, 16) / step)
  const pDur = Math.round(rand(28, 40) / step)
  const prSeg = Math.round(rand(12, 22) / step)
  const qDur = Math.round(rand(6, 10) / step)
  const rDur = Math.round(rand(8, 14) / step)
  const sDur = Math.round(rand(6, 12) / step)
  const stSeg = Math.round(rand(18, 30) / step)
  const tDur = Math.round(rand(40, 60) / step)
  const tpSeg = Math.round(rand(50, 120) / step) // long isoelectric — stretches it out

  // ─── Amplitudes (in px, positive = up from baseline) ───
  const pAmp = rand(3, 7)
  const qAmp = -rand(4, 10)       // Q is a small downward deflection
  const rAmp = rand(35, 65)       // R is the tall spike
  const sAmp = -rand(8, 18)       // S dips below baseline
  const stElev = rand(-2, 2)      // slight ST deviation is realistic
  const tAmp = rand(6, 16)        // T wave — broader, lower than R

  // Occasionally add a U wave (subtle)
  const hasU = Math.random() < 0.25
  const uDur = hasU ? Math.round(rand(20, 30) / step) : 0
  const uAmp = hasU ? rand(1.5, 4) : 0

  const totalSamples = pStart + pDur + prSeg + qDur + rDur + sDur + stSeg + tDur + uDur + tpSeg

  for (let i = 0; i < totalSamples; i++) {
    let y = 0
    let pos = 0

    // Isoelectric before P
    if (i < pStart) {
      y = rand(-0.3, 0.3) // tiny baseline wander
      pts.push(y)
      continue
    }

    pos = pStart

    // P wave — smooth bell shape
    if (i < pos + pDur) {
      const t = (i - pos) / pDur
      y = pAmp * Math.sin(Math.PI * t) * (1 - 0.15 * Math.sin(2 * Math.PI * t)) // slight notch for realism
      pts.push(y + rand(-0.2, 0.2))
      continue
    }
    pos += pDur

    // PR segment — flat (isoelectric)
    if (i < pos + prSeg) {
      y = rand(-0.3, 0.3)
      pts.push(y)
      continue
    }
    pos += prSeg

    // Q wave — small sharp dip
    if (i < pos + qDur) {
      const t = (i - pos) / qDur
      y = qAmp * Math.sin(Math.PI * t)
      pts.push(y + rand(-0.2, 0.2))
      continue
    }
    pos += qDur

    // R wave — tall sharp spike
    if (i < pos + rDur) {
      const t = (i - pos) / rDur
      // Use a sharper curve for R: steeper rise, sharp peak
      y = rAmp * Math.sin(Math.PI * t)
      // Make the peak a bit sharper
      if (t > 0.35 && t < 0.65) {
        y = rAmp * (1 - 2 * Math.pow(Math.abs(t - 0.5), 1.2))
      }
      pts.push(y + rand(-0.3, 0.3))
      continue
    }
    pos += rDur

    // S wave — dip below baseline
    if (i < pos + sDur) {
      const t = (i - pos) / sDur
      y = sAmp * Math.sin(Math.PI * t)
      pts.push(y + rand(-0.2, 0.2))
      continue
    }
    pos += sDur

    // ST segment — slight elevation/depression, slow return
    if (i < pos + stSeg) {
      const t = (i - pos) / stSeg
      y = stElev * (1 - hermite(t)) + rand(-0.3, 0.3)
      pts.push(y)
      continue
    }
    pos += stSeg

    // T wave — broader, asymmetric bell
    if (i < pos + tDur) {
      const t = (i - pos) / tDur
      // Asymmetric: rise is slower than fall
      const skew = t < 0.45 ? t / 0.45 : (1 - t) / 0.55
      y = tAmp * Math.sin(Math.PI * skew * 0.98)
      pts.push(y + rand(-0.25, 0.25))
      continue
    }
    pos += tDur

    // U wave (optional)
    if (hasU && i < pos + uDur) {
      const t = (i - pos) / uDur
      y = uAmp * Math.sin(Math.PI * t)
      pts.push(y + rand(-0.15, 0.15))
      continue
    }
    pos += uDur

    // TP segment — long flat isoelectric (rest between beats)
    y = rand(-0.3, 0.3)
    pts.push(y)
  }

  return { points: pts, width: totalSamples * step }
}

/**
 * Build a continuous signal buffer. Each beat is different.
 * Returns an array of y-deviations from baseline.
 */
function generateSignal(numBeats = 30, step = 0.8) {
  const all = []
  for (let b = 0; b < numBeats; b++) {
    const { points } = generateBeat(step)
    all.push(...points)
  }
  return all
}

// ─── Component ────────────────────────────────────────────────────

export default function EcgStripEnhanced({
  height = 120,
  className = '',
  color = '#17B890',
  speed = 1.6,
  glowIntensity = 1,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    signal: [],
    signalIndex: 0,
    animId: null,
    dpr: 1,
  })

  const baselineY = height * 0.58

  const initSignal = useCallback(() => {
    stateRef.current.signal = generateSignal(30, 0.8)
    stateRef.current.signalIndex = 0
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    stateRef.current.dpr = dpr

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)
    initSignal()

    const W = () => canvas.width / stateRef.current.dpr
    const H = () => canvas.height / stateRef.current.dpr

    // Trail ring buffer — stores recent y-values
    const maxTrail = 4096
    const trail = new Float32Array(maxTrail).fill(0) // y-deviations
    let trailHead = 0
    let subPixelAccum = 0

    const draw = () => {
      const state = stateRef.current
      const w = W()
      const h = H()

      // Resolve CSS variable to actual color
      let baseColor = color
      if (color.startsWith('var(')) {
        const varName = color.slice(4, -1).trim()
        baseColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#17B890'
      }

      // Convert hex to rgba helper
      const getRGBA = (hex, alpha) => {
        if (hex.startsWith('#')) {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
        return hex
      }

      // Advance sub-pixel accumulator
      ui_advance: {
        subPixelAccum += speed
        const pxToAdvance = Math.floor(subPixelAccum)
        subPixelAccum -= pxToAdvance

        for (let p = 0; p < pxToAdvance; p++) {
          const sig = state.signal
          if (sig.length === 0) break

          const yDev = sig[state.signalIndex % sig.length]
          state.signalIndex++

          // Regenerate when we exhaust the buffer
          if (state.signalIndex >= sig.length) {
            state.signal = generateSignal(30, 0.8)
            state.signalIndex = 0
          }

          trail[trailHead % maxTrail] = yDev
          trailHead++
        }
      }

      // ── Clear ──
      ctx.clearRect(0, 0, w, h)

      // ── Subtle grid ──
      const gridSpacing = 28
      const particleRGB = getComputedStyle(document.documentElement).getPropertyValue('--vw-particle-rgb').trim() || '23, 184, 144'
      ctx.strokeStyle = `rgba(${particleRGB}, 0.035)`
      ctx.lineWidth = 0.5
      for (let gx = 0; gx < w; gx += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
        ctx.stroke()
      }
      for (let gy = 0; gy < h; gy += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
        ctx.stroke()
      }

      // ── Draw ECG trace ──
      const cursorX = w - 24
      const trailLen = Math.min(Math.ceil(w) + 40, maxTrail)

      // Glow layer
      if (glowIntensity > 0) {
        ctx.save()
        ctx.shadowColor = baseColor
        ctx.shadowBlur = 14 * glowIntensity
        ctx.strokeStyle = getRGBA(baseColor, 0.18)
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        let moved = false
        for (let i = 0; i < trailLen; i++) {
          const x = cursorX - (trailLen - 1 - i)
          if (x < -4 || x > cursorX + 2) continue
          const idx = ((trailHead - trailLen + i) % maxTrail + maxTrail) % maxTrail
          const y = baselineY - trail[idx]
          if (!moved) { ctx.moveTo(x, y); moved = true }
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // Main trace with gradient fade
      ctx.save()
      ctx.shadowColor = baseColor
      ctx.shadowBlur = 3 * glowIntensity
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const grad = ctx.createLinearGradient(cursorX - trailLen, 0, cursorX, 0)
      grad.addColorStop(0, getRGBA(baseColor, 0.03))
      grad.addColorStop(0.08, getRGBA(baseColor, 0.18))
      grad.addColorStop(0.25, getRGBA(baseColor, 0.5))
      grad.addColorStop(0.6, getRGBA(baseColor, 0.8))
      grad.addColorStop(1, baseColor)
      ctx.strokeStyle = grad

      ctx.beginPath()
      let moved = false
      for (let i = 0; i < trailLen; i++) {
        const x = cursorX - (trailLen - 1 - i)
        if (x < -4 || x > cursorX + 2) continue
        const idx = ((trailHead - trailLen + i) % maxTrail + maxTrail) % maxTrail
        const y = baselineY - trail[idx]
        if (!moved) { ctx.moveTo(x, y); moved = true }
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      // ── Cursor dot ──
      const latestIdx = ((trailHead - 1) % maxTrail + maxTrail) % maxTrail
      const cursorY = baselineY - trail[latestIdx]
      const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 180)

      // Outer glow
      const rg = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 16)
      rg.addColorStop(0, getRGBA(baseColor, pulse * 0.55))
      rg.addColorStop(1, getRGBA(baseColor, 0))
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, 16, 0, Math.PI * 2)
      ctx.fill()

      // Inner dot
      ctx.fillStyle = baseColor
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, 3.2, 0, Math.PI * 2)
      ctx.fill()

      // Bright center
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, 1.3, 0, Math.PI * 2)
      ctx.fill()

      // ── Erase zone (after cursor) ──
      const fadeZone = 50
      // Read the theme background color from CSS variable
      const ecgBgRGB = getComputedStyle(document.documentElement).getPropertyValue('--vw-ecg-bg').trim() || '10, 10, 10'
      const eg = ctx.createLinearGradient(cursorX, 0, cursorX + fadeZone, 0)
      eg.addColorStop(0, `rgba(${ecgBgRGB}, 0)`)
      eg.addColorStop(0.35, `rgba(${ecgBgRGB}, 0.75)`)
      eg.addColorStop(1, `rgba(${ecgBgRGB}, 1)`)
      ctx.fillStyle = eg
      ctx.fillRect(cursorX, 0, fadeZone, h)

      state.animId = requestAnimationFrame(draw)
    }

    stateRef.current.animId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (stateRef.current.animId) cancelAnimationFrame(stateRef.current.animId)
    }
  }, [baselineY, color, glowIntensity, speed, initSignal])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height,
        display: 'block',
      }}
    />
  )
}
