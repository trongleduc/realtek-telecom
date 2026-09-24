'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Chevron, Close, Menu, Phone } from '@/components/Icons'
import { Link, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { isExternalUrl } from '@/lib/site'

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] }

const localeLabels: Record<string, string> = { vi: 'VI', en: 'EN', zh: '中文' }

type Props = {
  items: NavItem[]
  logo: ReactNode
  logoLight: ReactNode
  hotline?: string | null
}

function isActive(pathname: string, href: string) {
  if (isExternalUrl(href)) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  if (isExternalUrl(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export function SiteHeader({ items, logo, logoLight, hotline }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const locale = useLocale()
  // Every page opens with a dark full-bleed hero, so the header starts transparent everywhere.
  const overHero = true

  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        setScrolled(y > 40)
        // Hide while scrolling down past the hero, show again on any upward scroll.
        if (y <= 480) setHidden(false)
        else if (delta > 6) setHidden(true)
        else if (delta < -6) setHidden(false)
        lastY.current = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Close the drawer whenever the route changes (including back/forward navigation).
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const transparent = overHero && !scrolled && !open
  const tone = transparent ? 'text-white' : 'text-brand'

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]',
          transparent ? 'bg-transparent' : 'bg-paper/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        {transparent && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -bottom-10 bg-gradient-to-b from-black/45 to-transparent"
          />
        )}
        <div className="container-x relative flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label={t('home')}>
            {transparent ? logoLight : logo}
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className={`flex items-center gap-8 ${tone}`}>
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href + item.label} className="group relative">
                    <NavLink
                      href={item.href}
                      className="relative flex items-center gap-1 py-3 font-display text-[12.5px] font-semibold uppercase tracking-[0.14em]"
                    >
                      {item.label}
                      {item.children?.length ? <Chevron size={13} /> : null}
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 bottom-1.5 h-px origin-left bg-accent transition-transform duration-500 ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </NavLink>
                    {item.children?.length ? (
                      <ul className="invisible absolute left-1/2 top-full min-w-56 -translate-x-1/2 translate-y-2 bg-white py-3 text-ink opacity-0 shadow-xl transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <NavLink
                              href={child.href}
                              className="block px-5 py-2 text-sm hover:bg-paper hover:text-brand"
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex" aria-label={t('language')}>
              {locales.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  hrefLang={l}
                  aria-current={l === locale ? 'true' : undefined}
                  className={[
                    'grid h-8 min-w-9 place-items-center border px-2 font-display text-[11px] font-semibold tracking-wider transition-colors',
                    l === locale
                      ? transparent
                        ? 'border-white bg-white text-brand'
                        : 'border-brand bg-brand text-white'
                      : transparent
                        ? 'border-white/40 text-white hover:border-white'
                        : 'border-line text-brand hover:border-brand',
                  ].join(' ')}
                >
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`grid h-10 w-10 place-items-center lg:hidden ${tone}`}
            >
              {open ? <Close size={24} /> : <Menu size={24} />}
              <span className="sr-only">{open ? t('close') : t('menu')}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-brand-deep text-white transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <nav className="container-x flex h-full flex-col pb-10 pt-[calc(var(--header-h)+24px)]">
          <ul className="flex-1 space-y-1 overflow-y-auto">
            {items.map((item, i) => (
              <li
                key={item.href + item.label}
                className="transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]"
                style={{
                  transitionDelay: open ? `${120 + i * 60}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateY(24px)',
                }}
              >
                <NavLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-4 font-display text-2xl font-semibold uppercase tracking-wide"
                >
                  {item.label}
                </NavLink>
                {item.children?.length ? (
                  <ul className="py-2 pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavLink href={child.href} onClick={() => setOpen(false)} className="block py-2 text-white/75">
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  className={`grid h-9 min-w-10 place-items-center border px-2 text-xs font-semibold ${
                    l === locale ? 'border-white bg-white text-brand' : 'border-white/30'
                  }`}
                >
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
            {hotline ? (
              <a href={`tel:${hotline.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-sm">
                <Phone size={16} /> {hotline}
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </>
  )
}
