import type { Media } from '@/payload-types'

import { siteUrl } from './site'

export type ImageSize = 'thumbnail' | 'card' | 'wide' | 'hero'

export type ResolvedImage = {
  url: string
  width: number
  height: number
  alt: string
  focal?: string
  mimeType?: string
}

/**
 * Payload prefixes local files with serverURL; next/image needs them as same-origin relative paths. Files under
 * /api/media/file/ are always served by this app, so any host is stripped: a URL cached or saved under another
 * serverURL (e.g. localhost vs the production domain) must not break the page.
 */
function toImageSrc(url: string): string {
  if (url.startsWith(`${siteUrl}/`)) return url.slice(siteUrl.length)
  const local = /^https?:\/\/[^/]+(\/api\/media\/file\/.*)$/.exec(url)
  return local ? local[1] : url
}

export function asMedia(value: unknown): Media | null {
  return value && typeof value === 'object' && 'url' in value ? (value as Media) : null
}

/** Picks a generated size when available, falling back to the original upload. */
export function resolveImage(value: unknown, size?: ImageSize, fallbackAlt = ''): ResolvedImage | null {
  const media = asMedia(value)
  if (!media?.url) return null
  const variant = size ? media.sizes?.[size] : undefined
  const useVariant = Boolean(variant?.url && variant.width)
  const focal =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : undefined
  return {
    url: toImageSrc((useVariant ? variant!.url : media.url) as string),
    width: (useVariant ? variant!.width : media.width) ?? 1600,
    height: (useVariant ? variant!.height : media.height) ?? 1000,
    alt: media.alt || fallbackAlt,
    focal,
    mimeType: media.mimeType ?? undefined,
  }
}
