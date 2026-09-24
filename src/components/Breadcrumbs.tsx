import { Link } from '@/i18n/navigation'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'dark' | 'light' }) {
  const muted = tone === 'light' ? 'text-white/65' : 'text-ink-soft'
  const strong = tone === 'light' ? 'text-white' : 'text-brand'
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium uppercase tracking-[0.14em] ${muted}`}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? `${strong} line-clamp-1` : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden className="h-px w-3 bg-current opacity-50" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
