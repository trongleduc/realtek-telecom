import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/routing'
import { getSlider } from '@/lib/data'
import { resolveImage } from '@/lib/media'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { HeroSlider, type HeroSlide } from './home/HeroSlider'
import { Img } from './Img'
import { Reveal } from './reveal/Reveal'

type Props = {
  locale: Locale
  title: string
  eyebrow?: string | null
  lead?: ReactNode
  crumbs: Crumb[]
  /** Slider placement shown behind the title (SRS FR-04). */
  placement?: string
  /** Fallback background when no slider is configured for the placement. */
  image?: unknown
}

export async function toHeroSlides(placement: string, locale: Locale) {
  const slider = await getSlider(placement, locale)
  const slides: HeroSlide[] = (slider?.slides ?? [])
    .filter((s) => s.enabled !== false)
    .map((s, i) => {
      const image = resolveImage(s.image, 'hero', s.heading ?? '')
      const video = s.type === 'video' && s.video && typeof s.video === 'object' ? s.video.url : null
      return image
        ? {
            id: s.id ?? String(i),
            image,
            mobileImage: resolveImage(s.mobileImage, 'wide'),
            videoUrl: video,
            eyebrow: s.eyebrow,
            heading: s.heading,
            text: s.text,
            button: s.button?.url ? { label: s.button.label ?? '', href: s.button.url } : null,
          }
        : null
    })
    .filter(Boolean) as HeroSlide[]
  return { slides, autoplay: slider?.autoplay ?? true, interval: slider?.interval ?? 6 }
}

function HeroText({ title, eyebrow, lead, crumbs }: Pick<Props, 'title' | 'eyebrow' | 'lead' | 'crumbs'>) {
  return (
    <div className="max-w-4xl">
      <Reveal variant="down" once>
        <Breadcrumbs items={crumbs} tone="light" />
      </Reveal>
      {eyebrow ? (
        <Reveal variant="mask-x" delay={100} once>
          <p className="eyebrow eyebrow--light mt-6">{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal variant="up" delay={180} once>
        <h1 className="mt-4 font-display text-[clamp(32px,5.2vw,68px)] font-bold uppercase leading-[1.04] tracking-[-0.01em]">
          {title}
        </h1>
      </Reveal>
      {lead ? (
        <Reveal variant="up" delay={300} once>
          <div className="mt-5 max-w-2xl text-base text-white/85 md:text-lg">{lead}</div>
        </Reveal>
      ) : null}
    </div>
  )
}

export async function PageHero({ locale, title, eyebrow, lead, crumbs, placement, image }: Props) {
  const hero = placement ? await toHeroSlides(placement, locale) : null

  if (hero?.slides.length) {
    return (
      <HeroSlider slides={hero.slides} autoplay={hero.autoplay} intervalSeconds={hero.interval} variant="compact">
        <HeroText title={title} eyebrow={eyebrow} lead={lead} crumbs={crumbs} />
      </HeroSlider>
    )
  }

  const hasImage = Boolean(resolveImage(image))
  return (
    <section
      className={`relative isolate overflow-hidden text-white ${
        hasImage ? 'min-h-[52svh] md:min-h-[60vh]' : 'min-h-[40svh]'
      } flex items-end bg-brand-deep`}
    >
      {hasImage ? (
        <>
          <div className="kenburns absolute inset-0 -z-10" style={{ ['--kb-duration' as string]: '12s' }}>
            <Img media={image} size="hero" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgb(200_150_62/0.18),transparent_45%)]"
        />
      )}
      <div className="container-x pb-14 pt-[calc(var(--header-h)+56px)] md:pb-20">
        <HeroText title={title} eyebrow={eyebrow} lead={lead} crumbs={crumbs} />
      </div>
    </section>
  )
}
