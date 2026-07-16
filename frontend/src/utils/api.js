import axios from 'axios'

// ---------------------------------------------------------------------------
// Every route below is a REASONABLE GUESS based on the features you've described
// (JWT auth, vitals CRUD, alerts, patient profiles). Nothing here has been
// confirmed against your actual Express routes yet — this file is the ONLY
// place that needs to change once you share them. Swap the path strings and
// response-shape mapping below; the components never talk to axios directly.
// ---------------------------------------------------------------------------

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
if (apiURL && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  apiURL = apiURL.replace(/\/$/, '') + '/api'
}

export const client = axios.create({ baseURL: apiURL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('vw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// GET /vitals/:patientId -> extracts latest of each vital type
export async function fetchLatestVitals(patientId) {
  const { data } = await client.get(`/vitals/${patientId}`)
  const latest = {
    heartRate: null,
    systolic: null,
    diastolic: null,
    spo2: null,
    temperature: null,
    updatedAt: null
  }
  for (const r of data) {
    if (r.type === 'heart_rate' && latest.heartRate === null) {
      latest.heartRate = r.value
      if (!latest.updatedAt) latest.updatedAt = r.recordedAt
    }
    if (r.type === 'bp' && latest.systolic === null) {
      latest.systolic = r.value?.systolic
      latest.diastolic = r.value?.diastolic
      if (!latest.updatedAt) latest.updatedAt = r.recordedAt
    }
    if (r.type === 'spo2' && latest.spo2 === null) {
      latest.spo2 = r.value
      if (!latest.updatedAt) latest.updatedAt = r.recordedAt
    }
    if (r.type === 'temperature' && latest.temperature === null) {
      latest.temperature = r.value
      if (!latest.updatedAt) latest.updatedAt = r.recordedAt
    }
  }
  return latest
}

// GET /vitals/:patientId?type=...
export async function fetchVitalsHistory(patientId, type, range = '24h') {
  let backendType = type
  if (type === 'heartRate') backendType = 'heart_rate'
  if (type === 'bloodPressure') backendType = 'bp'

  const { data } = await client.get(`/vitals/${patientId}`, { params: { type: backendType } })
  
  return data.map((r) => {
    if (r.type === 'bp') {
      return {
        recordedAt: r.recordedAt,
        systolic: r.value?.systolic,
        diastolic: r.value?.diastolic
      }
    }
    return {
      recordedAt: r.recordedAt,
      value: r.value
    }
  }).reverse()
}

// POST /vitals - split frontend multi-fields into individual requests
export async function logVital(payload) {
  const promises = []
  if (payload.heartRate !== undefined) {
    promises.push(client.post('/vitals', { type: 'heart_rate', value: Number(payload.heartRate) }))
  }
  if (payload.systolic !== undefined && payload.diastolic !== undefined) {
    promises.push(client.post('/vitals', { type: 'bp', value: { systolic: Number(payload.systolic), diastolic: Number(payload.diastolic) } }))
  }
  if (payload.spo2 !== undefined) {
    promises.push(client.post('/vitals', { type: 'spo2', value: Number(payload.spo2) }))
  }
  if (payload.temperature !== undefined) {
    promises.push(client.post('/vitals', { type: 'temperature', value: Number(payload.temperature) }))
  }
  const results = await Promise.all(promises)
  return results[0]?.data
}

// GET /alerts/:patientId
export async function fetchAlerts(patientId) {
  const { data } = await client.get(`/alerts/${patientId}`)
  return data.map((a) => ({
    id: a._id,
    severity: a.severity,
    message: a.message,
    acknowledged: a.acknowledged,
    createdAt: a.createdAt,
    vitalType: a.message?.toLowerCase().includes('heart') ? 'Heart Rate' : 'Vitals',
    value: ''
  }))
}

// PATCH /alerts/:id/acknowledge
export async function acknowledgeAlert(alertId) {
  const { data } = await client.patch(`/alerts/${alertId}/acknowledge`)
  return data
}
