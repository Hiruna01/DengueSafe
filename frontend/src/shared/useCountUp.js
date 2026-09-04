import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/*
  Counts from zero up to `target` once, on a requestAnimationFrame loop.

  `null` in means `null` out, so a caller that is still loading renders its own
  placeholder rather than watching a zero climb to a number that was never real.
  A reduced-motion preference lands on the final value immediately.
*/
export default function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(null)
  const frame = useRef(0)

  useEffect(() => {
    if (target === null || target === undefined) {
      setValue(null)
      return undefined
    }

    if (prefersReducedMotion() || duration <= 0) {
      setValue(target)
      return undefined
    }

    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease out cubic: quick off the mark, settles rather than stops.
      const eased = 1 - (1 - progress) ** 3

      setValue(Math.round(target * eased))

      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}
