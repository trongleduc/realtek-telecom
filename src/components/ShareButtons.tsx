'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Facebook, LinkIcon, Zalo } from './Icons'

/** Share to Facebook / Zalo and copy link (SRS FR-06). */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t('copyLink'), url)
    }
  }

  const btn =
    'grid h-10 w-10 place-items-center border border-line text-brand transition-colors duration-300 hover:border-brand hover:bg-brand hover:text-white'

  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{t('share')}</span>
      <a
        className={btn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('share')} Facebook`}
      >
        <Facebook />
      </a>
      <a
        className={`${btn} [--zalo-text:#fff] hover:[--zalo-text:var(--color-brand)]`}
        href={`https://sp.zalo.me/share_inline?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('share')} Zalo`}
      >
        <Zalo size={22} />
      </a>
      <button type="button" className={`${btn} relative`} onClick={copy} aria-label={t('copyLink')}>
        <LinkIcon size={16} />
        <span
          role="status"
          className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-1 text-[11px] text-white transition-opacity ${
            copied ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {t('copied')}
        </span>
      </button>
    </div>
  )
}
