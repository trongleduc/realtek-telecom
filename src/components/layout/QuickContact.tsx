'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { ArrowUp, Mail, MapPin, Phone, Zalo } from '@/components/Icons'

type Props = {
  hotline?: string | null
  zaloPhone?: string | null
  email?: string | null
  mapLink?: string | null
}

/** Floating quick-contact stack (SRS FR-13). Sits on the right edge so it never covers body text. */
export function QuickContact({ hotline, zaloPhone, email, mapLink }: Props) {
  const t = useTranslations('quick')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tel = hotline?.replace(/[^\d+]/g, '')
  const zalo = zaloPhone?.replace(/[^\d]/g, '')

  const itemClass =
    'group relative grid h-11 w-11 place-items-center rounded-full shadow-[0_6px_20px_-6px_rgb(7_37_82/0.45)] transition-transform duration-300 hover:-translate-y-0.5 md:h-12 md:w-12'
  const tip =
    'pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block'

  return (
    <aside
      aria-label={t('toggle')}
      className="fixed bottom-4 right-3 z-30 flex flex-col items-center gap-2.5 md:bottom-6 md:right-5"
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Top"
        className={`${itemClass} border border-line bg-white text-brand ${
          showTop ? 'visible scale-100 opacity-100' : 'invisible scale-75 opacity-0'
        } transition-[opacity,transform,visibility]`}
      >
        <ArrowUp size={18} />
      </button>
      {mapLink ? (
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClass} bg-white text-brand`}
          aria-label={t('map')}
        >
          <MapPin size={19} />
          <span className={tip}>{t('map')}</span>
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={`${itemClass} bg-white text-brand`} aria-label={t('email')}>
          <Mail size={19} />
          <span className={tip}>{t('email')}</span>
        </a>
      ) : null}
      {zalo ? (
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClass} bg-[#0068ff] text-[#0068ff] [--zalo-text:#0068ff]`}
          aria-label={t('zalo')}
        >
          <span className="grid h-full w-full place-items-center rounded-full bg-[#0068ff] text-white">
            <Zalo size={30} />
          </span>
          <span className={tip}>{t('zalo')}</span>
        </a>
      ) : null}
      {tel ? (
        <a href={`tel:${tel}`} className={`${itemClass} bg-accent text-white`} aria-label={t('call')}>
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-accent [animation:ring_1.8s_ease-out_infinite]"
          />
          <Phone size={19} className="relative" />
          <span className={tip}>
            {t('call')} · {hotline}
          </span>
        </a>
      ) : null}
    </aside>
  )
}
