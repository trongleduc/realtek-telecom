'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { ArrowRight } from '@/components/Icons'
import { Link } from '@/i18n/navigation'
import type { ResolvedImage } from '@/lib/media'

export type AccordionItem = {
  id: string
  href: string
  title: string
  meta?: string | null
  image: ResolvedImage | null
}

/**
 * Horizontal image strip: the hovered (or focused) panel widens and its name turns from vertical to horizontal.
 * On touch screens the first tap opens a panel and the second tap follows the link.
 */
export function ProjectAccordion({ items }: { items: AccordionItem[] }) {
  const t = useTranslations('common')
  const [active, setActive] = useState(Math.min(1, items.length - 1))
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const update = () => setTouch(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <ul className="flex h-[560px] flex-col gap-1 md:h-[min(78vh,640px)] md:flex-row md:gap-0">
      {items.map((item, i) => {
        const open = i === active
        return (
          <li
            key={item.id}
            className="relative min-h-0 min-w-0 overflow-hidden transition-[flex-grow] duration-[900ms] ease-[var(--ease-out-expo)]"
            style={{ flexGrow: open ? 5 : 1, flexBasis: 0 }}
            onMouseEnter={() => !touch && setActive(i)}
          >
            <Link
              href={item.href}
              onFocus={() => setActive(i)}
              onClick={(e) => {
                if (touch && !open) {
                  e.preventDefault()
                  setActive(i)
                }
              }}
              aria-label={item.title}
              className="group absolute inset-0 block text-white"
            >
              {item.image ? (
                <Image
                  src={item.image.url}
                  alt={item.image.alt || item.title}
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className={`object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] ${
                    open ? 'scale-100' : 'scale-110'
                  }`}
                  style={item.image.focal ? { objectPosition: item.image.focal } : undefined}
                />
              ) : (
                <span className="absolute inset-0 bg-brand-deep" />
              )}
              <span
                aria-hidden
                className={`absolute inset-0 transition-colors duration-700 ${open ? 'bg-black/25' : 'bg-black/55'}`}
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent"
              />
              {i > 0 ? (
                <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-white/20 md:block" />
              ) : null}

              {/* Collapsed: vertical name, reading bottom-to-top. */}
              <span
                aria-hidden
                className={`absolute bottom-6 left-5 hidden whitespace-nowrap font-display text-lg font-bold uppercase tracking-[0.12em] transition-all duration-500 [writing-mode:vertical-rl] md:block md:rotate-180 ${
                  open ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100 delay-300'
                }`}
              >
                {item.title}
              </span>
              <span
                aria-hidden
                className={`absolute bottom-4 left-5 font-display text-sm font-bold uppercase tracking-[0.1em] transition-opacity duration-500 md:hidden ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {item.title}
              </span>

              {/* Expanded: horizontal name + link. */}
              <span
                className={`absolute bottom-6 left-5 right-5 transition-all duration-700 ease-[var(--ease-out-expo)] md:bottom-10 md:left-10 md:right-10 ${
                  open ? 'translate-y-0 opacity-100 delay-300' : 'pointer-events-none translate-y-6 opacity-0'
                }`}
              >
                <span className="mb-2 block min-h-[1lh] text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  {item.meta}
                </span>
                <span className="line-clamp-2 block min-h-[2lh] font-display text-2xl font-bold uppercase leading-tight tracking-[0.04em] md:text-4xl">
                  {item.title}
                </span>
                <span className="link-arrow mt-4 border-b border-white/60 pb-1 text-[12px]">
                  {t('viewProject')} <ArrowRight size={15} />
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
