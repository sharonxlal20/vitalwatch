import { useState } from 'react'
import { AlertIcon, CheckCircleIcon, ChevronDownIcon } from './icons'
import StatusDot from './StatusDot'
import { timeAgo } from '../utils/format'

const severityStyles = {
  critical: {
    dot: 'pulse',
    text: 'text-pulse',
    bg: 'bg-pulse/10',
    border: 'border-l-4 border-l-pulse',
    pulseBg: 'animate-[glow-pulse-pulse_2s_infinite]',
  },
  warning: {
    dot: 'amber',
    text: 'text-amber',
    bg: 'bg-amber/10',
    border: 'border-l-4 border-l-amber',
    pulseBg: '',
  },
  info: {
    dot: 'signal',
    text: 'text-signal',
    bg: 'bg-signal/10',
    border: 'border-l-4 border-l-signal',
    pulseBg: '',
  },
}

const vitalLabels = {
  heartRate: 'Heart Rate',
  bloodPressure: 'Blood Pressure',
  spo2: 'SpO2',
  temperature: 'Temperature',
}

export default function AlertsPanel({ alerts, onAcknowledge, onSelectVital }) {
  const [showAll, setShowAll] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [dismissingIds, setDismissingIds] = useState([])

  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const displayedAlerts = showAll ? alerts : activeAlerts

  const handleDismiss = (id) => {
    setDismissingIds((prev) => [...prev, id])
    setTimeout(() => {
      onAcknowledge(id)
      setDismissingIds((prev) => prev.filter((dId) => dId !== id))
    }, 500) // matches slide-out-right duration
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5 flex flex-col gap-4"
      style={{ animation: 'fade-up 0.5s ease-out both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-white text-base">Alerts</h3>
          {activeAlerts.length > 0 && (
            <span className="bg-pulse/10 text-pulse text-xs font-mono px-2 py-0.5 rounded-full font-semibold animate-pulse">
              {activeAlerts.length} active
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-mist hover:text-white transition-colors cursor-pointer border border-border-soft px-2.5 py-1 rounded-lg"
          >
            {showAll ? 'Show Active Only' : `Show History (${alerts.length})`}
          </button>
        )}
      </div>

      {displayedAlerts.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-8 bg-ink/30 rounded-xl border border-dashed border-border-soft">
          <div className="h-10 w-10 rounded-full bg-signal/10 flex items-center justify-center text-signal animate-[breathe_3s_infinite]">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <p className="text-mist text-sm font-medium">All vitals stable</p>
          <p className="text-mist/50 text-xs">No active alerts recorded</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {displayedAlerts.map((alert) => {
            const style = severityStyles[alert.severity] || severityStyles.info
            const isDismissing = dismissingIds.includes(alert.id)
            const isExpanded = expandedId === alert.id

            return (
              <li
                key={alert.id}
                className={`rounded-xl border border-border-soft bg-ink/20 overflow-hidden transition-all duration-300
                  ${style.border}
                  ${alert.acknowledged ? 'opacity-55' : style.pulseBg}
                  ${isDismissing ? 'animate-[slide-out-right_0.5s_ease-in-out_forwards]' : ''}`}
              >
                <div
                  className="p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleExpand(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
                      <AlertIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs font-semibold">
                            {vitalLabels[alert.vitalType] || alert.vitalType}
                          </span>
                          <StatusDot color={style.dot} pulse={alert.severity === 'critical' && !alert.acknowledged} />
                        </div>
                        <ChevronDownIcon
                          className={`h-4.5 w-4.5 text-mist transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                        />
                      </div>
                      <p className="text-mist text-xs leading-relaxed truncate">{alert.message}</p>
                      
                      <div className="flex items-center justify-between mt-2 text-[11px] text-mist font-mono">
                        <span>
                          {alert.value} · {timeAgo(alert.createdAt)}
                        </span>
                        {!alert.acknowledged && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDismiss(alert.id)
                            }}
                            className="text-signal hover:text-white font-medium transition-colors cursor-pointer px-2 py-0.5 rounded bg-signal/10 hover:bg-signal/20"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <div
                  className={`border-t border-border-soft/50 bg-white/[0.01] px-4 overflow-hidden transition-all duration-300
                    ${isExpanded ? 'max-h-40 py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                >
                  <p className="text-xs text-white mb-2 font-medium">Alert Details</p>
                  <p className="text-mist text-xs leading-relaxed mb-3">{alert.message}</p>
                  <div className="flex justify-between items-center text-[10px] text-mist/75">
                    <span>Severity: <strong className={`uppercase ${style.text}`}>{alert.severity}</strong></span>
                    {onSelectVital && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectVital(alert.vitalType)
                        }}
                        className="text-signal hover:underline cursor-pointer"
                      >
                        Inspect Vitals →
                      </button>
                    )}
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
