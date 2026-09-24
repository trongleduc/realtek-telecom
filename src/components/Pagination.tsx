import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'

import { ArrowLeft, ArrowRight } from './Icons'

type Props = {
  locale: Locale
  page: number
  totalPages: number
  pathname: string
  query?: Record<string, string | undefined>
}

function pagesToShow(page: number, total: number): (number | '…')[] {
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export async function Pagination({ locale, page, totalPages, pathname, query = {} }: Props) {
  if (totalPages <= 1) return null
  const t = await getTranslations({ locale, namespace: 'common' })
  const href = (p: number) => {
    const q = Object.fromEntries(
      Object.entries({ ...query, page: p > 1 ? String(p) : undefined }).filter(([, v]) => v),
    ) as Record<string, string>
    return { pathname, query: q }
  }
  const box = 'grid h-11 min-w-11 place-items-center border px-3 text-sm font-semibold transition-colors'

  return (
    <nav aria-label={t('pageOf', { page, total: totalPages })} className="mt-14 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${box} border-line hover:border-brand`} aria-label={t('prev')}>
          <ArrowLeft size={16} />
        </Link>
      ) : null}
      {pagesToShow(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-soft">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${box} ${p === page ? 'border-brand bg-brand text-white' : 'border-line hover:border-brand'}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${box} border-line hover:border-brand`} aria-label={t('next')}>
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </nav>
  )
}
