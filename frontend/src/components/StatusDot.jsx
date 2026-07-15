const dotColors = {
  signal: 'bg-signal',
  amber: 'bg-amber',
  pulse: 'bg-pulse',
  mist: 'bg-mist',
}

export default function StatusDot({ color = 'signal', pulse = false, className = '' }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${dotColors[color] || dotColors.mist} ${className}`}
      style={pulse ? { animation: 'blink 1.4s ease-in-out infinite' } : undefined}
    />
  )
}
