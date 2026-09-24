'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'

import { ServiceCardBody, type FanCard } from './ServiceCard'

const AUTO_SPEED = 0.018 // degrees per ms (one turn ≈ 20 s)
const DRAG_RATIO = 0.35 // degrees per dragged pixel
const RESUME_AFTER = 1600 // ms of inactivity before auto-rotation resumes
const FACE_GAP = 10

/**
 * Mobile version of the services row: an n-sided prism (one face per card) that turns on its own
 * and can be spun by swiping. Rotation is written straight to the DOM from a rAF loop, so it never
 * re-renders React. A swipe never counts as a tap; a tap on the front face follows the link.
 */
export function ServicePrism({ cards }: { cards: FanCard[] }) {
  const t = useTranslations('common')
  const n = cards.length
  const step = 360 / n
  const stageRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<HTMLUListElement>(null)
  const faceRefs = useRef<(HTMLLIElement | null)[]>([])
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [faceWidth, setFaceWidth] = useState(240)

  const angle = useRef(0)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(0)
  const lastInteraction = useRef(0)
  const visible = useRef(true)

  // Whole pixels so the server-rendered transform matches the client exactly (no hydration mismatch).
  const radius = Math.round((faceWidth + FACE_GAP) / (2 * Math.tan(Math.PI / n)))
  const faceHeight = Math.round(faceWidth * 1.25)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const ro = new ResizeObserver(([entry]) => {
      setFaceWidth(Math.round(Math.min(300, Math.max(180, entry.contentRect.width * 0.58))))
    })
    ro.observe(stage)
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
    })
    io.observe(stage)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    const rotor = rotorRef.current
    if (!rotor || n < 3) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let last = performance.now()
    let front = -1

    const apply = () => {
      rotor.style.transform = `translateZ(${-radius}px) rotateY(${angle.current}deg)`
      faceRefs.current.forEach((face, i) => {
        if (!face) return
        const facing = Math.cos(((angle.current + i * step) * Math.PI) / 180)
        face.style.setProperty('--shade', (0.35 + 0.65 * Math.max(0, facing)).toFixed(3))
        face.style.pointerEvents = facing > 0.6 ? 'auto' : 'none'
      })
      const current = Math.round((((-angle.current % 360) + 360) % 360) / step) % n
      if (current !== front) {
        dotRefs.current.forEach((dot, i) => dot?.toggleAttribute('data-active', i === current))
        front = current
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.002) {
          angle.current += velocity.current * dt
          velocity.current *= Math.pow(0.94, dt / 16)
        } else if (
          !reduceMotion &&
          visible.current &&
          !document.hidden &&
          now - lastInteraction.current > RESUME_AFTER
        ) {
          angle.current -= AUTO_SPEED * dt
        }
      }
      apply()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [n, radius, step])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    moved.current = 0
    velocity.current = 0
    let lastX = e.clientX
    let lastT = performance.now()

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - lastX
      const now = performance.now()
      angle.current += dx * DRAG_RATIO
      velocity.current = (dx * DRAG_RATIO) / Math.max(1, now - lastT)
      moved.current += Math.abs(dx)
      lastX = ev.clientX
      lastT = now
    }
    const end = () => {
      dragging.current = false
      lastInteraction.current = performance.now()
      if (performance.now() - lastT > 80) velocity.current = 0
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const bringToFront = (i: number, timeStamp: number) => {
    // Nearest rotation that puts face i in front, so keyboard focus never spins the long way round.
    const target = -i * step
    angle.current = target + Math.round((angle.current - target) / 360) * 360
    velocity.current = 0
    lastInteraction.current = timeStamp
  }

  if (n < 3) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.id}>
            <Link
              href={card.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-brand-deep text-white"
            >
              <ServiceCardBody card={card} sizes="90vw" hoverDetails={false} />
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <div
        ref={stageRef}
        className="prism-stage relative mx-auto w-full"
        style={{ height: faceHeight + 48 }}
        onPointerDown={onPointerDown}
        onClickCapture={(e) => {
          if (moved.current > 6) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <ul
          ref={rotorRef}
          className="prism-rotor absolute left-1/2 top-6"
          style={{ width: faceWidth, height: faceHeight, marginLeft: -faceWidth / 2 }}
        >
          {cards.map((card, i) => (
            <li
              key={card.id}
              ref={(el) => {
                faceRefs.current[i] = el
              }}
              className="prism-face absolute inset-0"
              style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
            >
              <Link
                href={card.href}
                draggable={false}
                onFocus={(e) => bringToFront(i, e.timeStamp)}
                className="group relative block h-full overflow-hidden bg-brand-deep text-white shadow-[0_24px_40px_-24px_rgb(7_37_82/0.7)]"
              >
                <ServiceCardBody card={card} sizes="60vw" hoverDetails={false} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {cards.map((card, i) => (
            <span
              key={card.id}
              ref={(el) => {
                dotRefs.current[i] = el
              }}
              className="h-[3px] w-4 bg-brand/20 transition-all duration-300 data-[active]:w-8 data-[active]:bg-accent"
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{t('swipeHint')}</span>
      </div>
    </div>
  )
}
