import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/*
  Fades and rises its children once they scroll into view, then stops observing.
  A reduced-motion preference — or a browser without IntersectionObserver —
  skips straight to the visible state, so the content is never gated on an
  effect that may not run.
*/
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setRevealed(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(true)
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-revealed={revealed}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
