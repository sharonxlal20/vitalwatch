// Fallback data so the dashboard is fully viewable before the real API
// is wired in. Dashboard.jsx tries the real endpoints first and only
// falls back to this on request failure (see the `usingMock` flag it sets).

const jitter = (base, spread) => +(base + (Math.random() - 0.5) * spread).toFixed(1)

export function mockLatestVitals() {
  return {
    heartRate: Math.round(jitter(78, 10)),
    systolic: Math.round(jitter(122, 8)),
    diastolic: Math.round(jitter(80, 6)),
    spo2: Math.round(jitter(97, 2)),
    temperature: jitter(36.8, 0.6),
    updatedAt: new Date().toISOString(),
  }
}

const ranges = {
  heartRate: [65, 95],
  spo2: [95, 99],
  temperature: [36.3, 37.4],
}

export function mockHistory(type, points = 24) {
  const now = Date.now()

  if (type === 'bloodPressure') {
    return Array.from({ length: points }).map((_, i) => ({
      recordedAt: new Date(now - (points - 1 - i) * 60 * 60 * 1000).toISOString(),
      systolic: Math.round(jitter(122, 12)),
      diastolic: Math.round(jitter(80, 8)),
    }))
  }

  const [lo, hi] = ranges[type] || [0, 100]
  return Array.from({ length: points }).map((_, i) => {
    const t = now - (points - 1 - i) * 60 * 60 * 1000
    const mid = lo + (hi - lo) / 2
    const spread = (hi - lo) * 0.6
    return {
      recordedAt: new Date(t).toISOString(),
      value: +jitter(mid, spread).toFixed(1),
    }
  })
}

export function mockAlerts() {
  return [
    {
      id: 'a1',
      vitalType: 'heartRate',
      severity: 'critical',
      message: 'Heart rate sustained above threshold for 4 minutes',
      value: '128 bpm',
      createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'a2',
      vitalType: 'spo2',
      severity: 'warning',
      message: 'SpO2 dipped below normal range briefly',
      value: '93%',
      createdAt: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'a3',
      vitalType: 'temperature',
      severity: 'info',
      message: 'Temperature reading flagged, resolved on recheck',
      value: '37.9°C',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      acknowledged: true,
    },
  ]
}
