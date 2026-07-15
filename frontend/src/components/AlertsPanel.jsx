import { AlertIcon, CheckCircleIcon } from './icons'
import StatusDot from './StatusDot'
import { timeAgo } from '../utils/format'

const severityStyles = {
  critical: { dot: 'pulse', text: 'text-pulse', bg: 'bg-pulse/10' },
  warning: { dot: 'amber', text: 'text-amber', bg: 'bg-amber/10' },
  info: { dot: 'signal', text: 'text-signal', bg: 'bg-signal/10' },
}

const vitalLabels = {
  heartRate: 'Heart Rate',
  bloodPressure: 'Blood Pressure',
  spo2: 'SpO2',
  temperature: 'Temperature',
}

export default function AlertsPanel({ alerts, onAcknowledge }) {
  const activeCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5 flex flex-col gap-4"
      style={{ animation: 'fade-up 0.5s ease-out both' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-white text-base">Alerts</h3>
        {activeCount > 0 && (
          <span className="bg-pulse/10 text-pulse text-xs font-mono px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-8">
          <CheckCircleIcon className="h-6 w-6 text-signal" />
          <p className="text-mist text-sm">All vitals within normal range.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const style = severityStyles[alert.severity] || severityStyles.info
            return (
              <li
                key={alert.id}
                className={`rounded-xl border border-border-soft p-3.5 ${alert.acknowledged ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
                    <AlertIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-xs font-medium">
                        {vitalLabels[alert.vitalType] || alert.vitalType}
                      </span>
                      <StatusDot color={style.dot} pulse={alert.severity === 'critical' && !alert.acknowledged} />
                    </div>
                    <p className="text-mist text-xs leading-relaxed">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[11px] text-mist">
                        {alert.value} · {timeAgo(alert.createdAt)}
                      </span>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-[11px] text-signal hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
