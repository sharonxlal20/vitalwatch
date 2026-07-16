import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook that animates a number from 0 to `end` when the target element
 * scrolls into view.  Returns [ref, displayValue].
 *
 * @param {number}  end        – target value
 * @param {number}  duration   – animation length in ms (default 2000)
 * @param {number}  decimals   – decimal places to show (default 0)
 * @param {string}  easing     – 'easeOut' | 'linear' (default 'easeOut')
 */
export default function useCountUp(end, { duration = 2000, decimals = 0, easing = 'easeOut' } = {}) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const hasPlayed = useRef(false)

  const easeFn = useCallback(
    (t) => {
      if (easing === 'linear') return t
      // easeOutExpo for a snappy count
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    },
    [easing],
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true
          const start = performance.now()

          const tick = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = easeFn(progress)
            setValue(+(eased * end).toFixed(decimals))

            if (progress < 1) {
              requestAnimationFrame(tick)
            } else {
              setValue(end)
            }
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [end, duration, decimals, easeFn])

  return [ref, value]
}
