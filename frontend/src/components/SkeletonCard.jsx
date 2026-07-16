/**
 * Animated skeleton placeholders that match VitalCard dimensions.
 * Shows a shimmering loading state while data loads.
 */
export function SkeletonCard() {
  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5 flex flex-col gap-4"
      style={{ animation: 'stagger-fade-up 0.4s ease-out both' }}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton h-9 w-9 rounded-lg" />
        <div className="skeleton h-2 w-2 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-7 w-28 rounded" />
      </div>
      <div className="skeleton h-2.5 w-24 rounded" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5"
      style={{ animation: 'stagger-fade-up 0.5s ease-out both' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="skeleton h-5 w-28 rounded" />
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-7 w-20 rounded-md" />
          ))}
        </div>
      </div>
      <div className="skeleton h-64 w-full rounded-lg" />
    </div>
  )
}

export function SkeletonAlerts() {
  return (
    <div
      className="bg-surface border border-border-soft rounded-2xl p-5 flex flex-col gap-4"
      style={{ animation: 'stagger-fade-up 0.5s ease-out both' }}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}
