import type { BannerPlacement } from '@/collections/Banners'
import type { Locale } from '@/i18n/routing'
import { getBanners } from '@/lib/data'

import { Img } from './Img'
import { Reveal } from './reveal/Reveal'
import { SmartLink } from './SmartLink'

/** Renders every active banner assigned to a placement (SRS FR-05). Nothing when none is active. */
export async function BannerSlot({
  placement,
  locale,
  className = '',
  sizes = '(min-width: 1280px) 1200px, 100vw',
}: {
  placement: BannerPlacement
  locale: Locale
  className?: string
  sizes?: string
}) {
  const banners = await getBanners(placement, locale)
  if (!banners.length) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => {
        const body = (
          <>
            <Img
              media={banner.image}
              size="wide"
              alt={banner.alt || banner.name}
              sizes={sizes}
              className={`h-auto w-full transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] ${
                banner.mobileImage ? 'hidden md:block' : ''
              }`}
            />
            {banner.mobileImage ? (
              <Img
                media={banner.mobileImage}
                size="wide"
                alt={banner.alt || banner.name}
                sizes="100vw"
                className="h-auto w-full md:hidden"
              />
            ) : null}
          </>
        )
        return (
          <Reveal key={banner.id} variant="zoom">
            {banner.url ? (
              <SmartLink
                href={banner.url}
                newTab={banner.openInNewTab ?? false}
                className="group block overflow-hidden"
              >
                {body}
              </SmartLink>
            ) : (
              <div className="overflow-hidden">{body}</div>
            )}
          </Reveal>
        )
      })}
    </div>
  )
}
