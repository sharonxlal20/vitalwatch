// Modest, natural-scale ECG trace — a real heartbeat's peak is small relative
// to its baseline. Long beat count + wide jitter ranges = no visible repeat.
export function generateECGPath(beats = 40, baselineY = 90) {
  let path = `M 0,${baselineY} `
  let x = 0

  const jitter = (base, amount) => base + (Math.random() - 0.5) * amount

  for (let i = 0; i < beats; i++) {
    const pHeight = jitter(9, 4)
    const rHeight = jitter(45, 18)   // modest peak, not a full-screen spike
    const qDepth = jitter(14, 6)
    const sDepth = jitter(18, 8)
    const tHeight = jitter(12, 5)
    const beatGap = jitter(65, 22)   // wide spacing variance = irregular rhythm feel

    path += `L ${x + 18},${baselineY} `
    path += `Q ${x + 25},${baselineY - pHeight} ${x + 32},${baselineY} `
    path += `L ${x + 44},${baselineY} `
    path += `L ${x + 48},${baselineY + qDepth} `
    path += `L ${x + 52},${baselineY - rHeight} `
    path += `L ${x + 56},${baselineY + sDepth} `
    path += `L ${x + 60},${baselineY} `
    path += `L ${x + 75},${baselineY} `
    path += `Q ${x + 88},${baselineY - tHeight} ${x + 100},${baselineY} `
    path += `L ${x + 100 + beatGap},${baselineY} `

    x += 100 + beatGap
  }

  return { path, totalWidth: x }
}