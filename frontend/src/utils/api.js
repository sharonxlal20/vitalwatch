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

// GET /vitals/latest?patientId=  -> { heartRate, systolic, diastolic, spo2, temperature, updatedAt }
export async function fetchLatestVitals(patientId) {
  const { data } = await client.get('/vitals/latest', { params: { patientId } })
  return data
}

// GET /vitals/history?patientId=&type=&range=  -> [{ recordedAt, value }]
export async function fetchVitalsHistory(patientId, type, range = '24h') {
  const { data } = await client.get('/vitals/history', { params: { patientId, type, range } })
  return data
}

// POST /vitals  -> { heartRate?, systolic?, diastolic?, spo2?, temperature?, patientId }
export async function logVital(payload) {
  const { data } = await client.post('/vitals', payload)
  return data
}

// GET /alerts?patientId=&status=active  -> [{ id, vitalType, severity, message, value, createdAt, acknowledged }]
export async function fetchAlerts(patientId) {
  const { data } = await client.get('/alerts', { params: { patientId } })
  return data
}

// PATCH /alerts/:id/acknowledge
export async function acknowledgeAlert(alertId) {
  const { data } = await client.patch(`/alerts/${alertId}/acknowledge`)
  return data
}
