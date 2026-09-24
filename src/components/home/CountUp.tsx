'use client'

import { useEffect, useRef, useState } from 'react'

/** Counts up from zero each time the number scrolls into view. */
export function CountUp({
  value,
  suffix,
  durationMs = 1800,
}: {
  value: number
  suffix?: string | null
  durationMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frame)
        if (!entry.isIntersecting) {
          setDisplay(0)
          return
        }
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / durationMs)
          const eased = 1 - Math.pow(1 - p, 4)
          setDisplay(Math.round(value * eased))
          if (p < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
    }
  }, [value, durationMs])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString('vi-VN')}
      {suffix}
    </span>
  )
}
