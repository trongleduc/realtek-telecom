'use client'

import Image from 'next/image'

import { ArrowUpRight } from '@/components/Icons'
import type { ResolvedImage } from '@/lib/media'

export type FanCard = {
  id: string
  href: string
  title: string
  excerpt?: string | null
  image: ResolvedImage | null
}

/**
 * Card artwork shared by the desktop fan and the mobile prism. The title always occupies
 * exactly two lines, so one-line and two-line names start at the same height on every card.
 */
export function ServiceCardBody({
  card,
  sizes,
  hoverDetails = true,
}: {
  card: FanCard
  sizes: string
  hoverDetails?: boolean
}) {
  return (
    <>
      {card.image ? (
        <Image
          src={card.image.url}
          alt={card.image.alt || card.title}
          fill
          sizes={sizes}
          draggable={false}
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
          style={card.image.focal ? { objectPosition: card.image.focal } : undefined}
        />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-90"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-brand/0 transition-colors duration-700 group-hover:bg-brand/35"
      />
      <span className="absolute inset-x-0 bottom-0 p-5">
        <span aria-hidden className="mb-3 block h-px w-8 bg-accent" />
        <span className="line-clamp-2 block min-h-[2lh] font-display text-[15px] font-bold uppercase leading-snug tracking-[0.06em]">
          {card.title}
        </span>
        {hoverDetails && card.excerpt ? (
          <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
            <span className="overflow-hidden">
              <span className="mt-2 line-clamp-3 block text-[13px] leading-relaxed text-white/80">{card.excerpt}</span>
            </span>
          </span>
        ) : null}
      </span>
      <span className="absolute right-4 top-4 grid h-9 w-9 -translate-y-2 place-items-center border border-white/50 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight size={16} />
      </span>
    </>
  )
}
