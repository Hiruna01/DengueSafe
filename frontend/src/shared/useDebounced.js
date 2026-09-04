import { useEffect, useState } from 'react'

/** Delays a fast-changing value so typing doesn't fire a request per keystroke. */
export default function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
