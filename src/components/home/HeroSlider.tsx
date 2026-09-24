'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { ArrowLeft, ArrowRight, Pause, Play } from '@/components/Icons'
import { Link } from '@/i18n/navigation'
import type { ResolvedImage } from '@/lib/media'
import { isExternalUrl } from '@/lib/site'

export type HeroSlide = {
  id: string
  image: ResolvedImage
  mobileImage?: ResolvedImage | null
  videoUrl?: string | null
  eyebrow?: string | null
  heading?: string | null
  text?: string | null
  button?: { label: string; href: string } | null
}

type Props = {
  slides: HeroSlide[]
  autoplay?: boolean
  intervalSeconds?: number
  variant?: 'full' | 'compact'
  /** Overlay content for inner pages (page title, breadcrumbs); replaces per-slide captions. */
  children?: ReactNode
}

const pad = (n: number) => String(n).padStart(2, '0')

export function HeroSlider({ slides, autoplay = true, intervalSeconds = 6, variant = 'full', children }: Props) {
  const t = useTranslations('common')
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const pointerStart = useRef<number | null>(null)
  const count = slides.length
  const paused = userPaused || hoverPaused || offscreen || !autoplay || count < 2
  const duration = Math.max(3, intervalSeconds) * 1000

  const go = useCallback(
    (next: number) => {
      setIndex((current) => {
        const target = (next + count) % count
        if (target !== current) setPrev(current)
        return target
      })
    },
    [count],
  )

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(() => go(index + 1), duration)
    return () => window.clearTimeout(timer)
  }, [index, paused, duration, go])

  // Stop cycling while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    const onVisibility = () => setOffscreen(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  if (!count) return null

  const full = variant === 'full'
  const current = slides[index]

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={current.heading ?? 'Slider'}
      className={`relative isolate overflow-hidden bg-brand-deep text-white ${
        full ? 'h-[100svh] min-h-[560px]' : 'h-[62svh] min-h-[420px] md:h-[68vh]'
      }`}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      onPointerDown={(e) => {
        pointerStart.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (pointerStart.current === null) return
        const dx = e.clientX - pointerStart.current
        pointerStart.current = null
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
      }}
    >
      {slides.map((slide, i) => {
        const active = i === index
        const leaving = i === prev
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-soft)] ${
              active ? 'z-10 opacity-100' : leaving ? 'z-[5] opacity-0' : 'z-0 opacity-0'
            }`}
          >
            <div
              className={`absolute inset-0 ${active || leaving ? 'kenburns' : ''}`}
              style={{ ['--kb-duration' as string]: `${duration + 2500}ms` }}
            >
              <Image
                src={slide.image.url}
                alt={slide.image.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${slide.mobileImage ? 'hidden md:block' : ''}`}
                style={slide.image.focal ? { objectPosition: slide.image.focal } : undefined}
              />
              {slide.mobileImage ? (
                <Image
                  src={slide.mobileImage.url}
                  alt={slide.mobileImage.alt || slide.image.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover md:hidden"
                />
              ) : null}
              {slide.videoUrl && (active || leaving) ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={slide.videoUrl}
                  poster={slide.image.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : null}
            </div>
          </div>
        )
      })}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-black/65 via-black/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
      />

      <div className="container-x relative z-30 flex h-full flex-col justify-end pb-28 md:pb-32">
        {children ?? (
          <div key={index} className="max-w-3xl">
            {current.eyebrow ? (
              <div className="overflow-hidden">
                <p className="rise eyebrow eyebrow--light" style={{ animationDelay: '250ms' }}>
                  {current.eyebrow}
                </p>
              </div>
            ) : null}
            {current.heading ? (
              <div className="mt-5 overflow-hidden pb-1">
                <h1
                  className="rise font-display text-[clamp(34px,6vw,80px)] font-bold uppercase leading-[1.02] tracking-[-0.01em]"
                  style={{ animationDelay: '380ms' }}
                >
                  {current.heading}
                </h1>
              </div>
            ) : null}
            {current.text ? (
              <div className="mt-5 overflow-hidden">
                <p className="rise max-w-xl text-base text-white/85 md:text-lg" style={{ animationDelay: '560ms' }}>
                  {current.text}
                </p>
              </div>
            ) : null}
            {current.button?.href ? (
              <div className="mt-9 overflow-hidden">
                <div className="rise" style={{ animationDelay: '720ms' }}>
                  {isExternalUrl(current.button.href) ? (
                    <a href={current.button.href} className="btn btn-light" target="_blank" rel="noopener noreferrer">
                      {current.button.label} <ArrowRight size={16} />
                    </a>
                  ) : (
                    <Link href={current.button.href} className="btn btn-light">
                      {current.button.label} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-30">
          {/* Right padding keeps the controls clear of the floating quick-contact buttons on narrower screens. */}
          <div className="container-x flex items-center justify-between gap-6 pb-8 md:pb-10">
            <div className="flex w-full items-center justify-between gap-6 pr-[max(0px,calc(80px-max(0px,(100vw-1320px)/2)-var(--gutter)))]">
              <div className="flex flex-1 items-center gap-5">
                <span className="font-display text-sm font-semibold tabular-nums">
                  {pad(index + 1)}
                  <span className="mx-1.5 text-white/40">/</span>
                  <span className="text-white/60">{pad(count)}</span>
                </span>
                <ol className="flex max-w-md flex-1 gap-2">
                  {slides.map((slide, i) => (
                    <li key={slide.id} className="flex-1">
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-label={t('goToSlide', { index: i + 1 })}
                        aria-current={i === index ? 'true' : undefined}
                        className="group block w-full py-3"
                      >
                        <span className="relative block h-[2px] overflow-hidden bg-white/25">
                          <span
                            key={i === index ? `active-${index}` : `idle-${i}`}
                            className={`absolute inset-0 origin-left bg-accent ${
                              i < index ? 'scale-x-100' : i === index ? '' : 'scale-x-0'
                            }`}
                            style={
                              i === index
                                ? {
                                    animation: `progress ${duration}ms linear forwards`,
                                    animationPlayState: paused ? 'paused' : 'running',
                                  }
                                : undefined
                            }
                          />
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex items-center gap-2">
                {autoplay ? (
                  <button
                    type="button"
                    onClick={() => setUserPaused((v) => !v)}
                    aria-label={userPaused ? t('play') : t('pause')}
                    className="grid h-11 w-11 place-items-center border border-white/30 transition-colors hover:border-white hover:bg-white hover:text-brand"
                  >
                    {userPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label={t('prevSlide')}
                  className="hidden h-11 w-11 place-items-center border border-white/30 transition-colors hover:border-white hover:bg-white hover:text-brand sm:grid"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label={t('nextSlide')}
                  className="hidden h-11 w-11 place-items-center border border-white/30 transition-colors hover:border-white hover:bg-white hover:text-brand sm:grid"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {full ? (
        <div
          aria-hidden
          className="absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/70 xl:flex"
        >
          <span className="block h-12 w-px bg-white/60 [animation:scroll-cue_2.2s_var(--ease-soft)_infinite]" />
        </div>
      ) : null}
    </section>
  )
}
