import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      className={`relative h-9 w-9 rounded-full border border-border-soft flex items-center justify-center
                  text-mist hover:text-white hover:border-signal/50
                  transition-all duration-300 cursor-pointer ${className}`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {/* Sun icon — visible in dark mode */}
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 absolute transition-all duration-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: isLight ? 0 : 1,
          transform: isLight ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>

      {/* Moon icon — visible in light mode */}
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 absolute transition-all duration-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: isLight ? 1 : 0,
          transform: isLight ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
