'use client'

import type { CSSProperties } from 'react'

import { useRevealRef } from '@/components/reveal/Reveal'
import { Link } from '@/i18n/navigation'

import { ServiceCardBody, type FanCard } from './ServiceCard'
import { ServicePrism } from './ServicePrism'

export type { FanCard }

/**
 * Desktop: cards start stacked behind the centre card and slide out to both sides, nearest first,
 * each time the row scrolls into view (and fold back when it leaves).
 * Mobile/tablet: a rotating prism with one face per card.
 */
export function FanCards({ cards }: { cards: FanCard[] }) {
  const ref = useRevealRef<HTMLUListElement>()
  const center = (cards.length - 1) / 2

  return (
    <>
      <ul
        ref={ref}
        className="fan hidden gap-3 lg:grid"
        style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
      >
        {cards.map((card, i) => {
          const offset = center - i
          const dist = Math.round(Math.abs(offset))
          return (
            <li
              key={card.id}
              className="fan-card relative"
              style={{ '--offset': offset, '--dist': dist, zIndex: 20 - dist } as CSSProperties}
            >
              <Link
                href={card.href}
                className="group relative block aspect-[4/5] overflow-hidden bg-brand-deep text-white xl:aspect-[3/4]"
              >
                <ServiceCardBody card={card} sizes="22vw" />
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="lg:hidden">
        <ServicePrism cards={cards} />
      </div>
    </>
  )
}
