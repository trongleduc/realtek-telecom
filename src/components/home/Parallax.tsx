'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Moves its content vertically at a fraction of the scroll speed while the section is on screen. */
export function Parallax({
  children,
  strength = 0.18,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const parent = el.parentElement
    if (!parent) return
    let frame = 0
    let visible = false

    const update = () => {
      const rect = parent.getBoundingClientRect()
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
      el.style.transform = `translate3d(0, ${(-progress * strength * 100).toFixed(2)}%, 0) scale(1.2)`
    }
    const onScroll = () => {
      if (!visible) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) update()
    })
    io.observe(parent)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [strength])

  return (
    <div ref={ref} className={`absolute inset-0 will-change-transform [transform:scale(1.2)] ${className}`}>
      {children}
    </div>
  )
}
