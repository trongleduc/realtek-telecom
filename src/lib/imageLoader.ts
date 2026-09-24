'use client'

/**
 * next/image loader while the CMS is switched off. Unsplash resizes images itself, so photos are requested at the
 * exact width the browser needs (keeping the crop ratio) instead of going through Vercel's metered optimizer.
 * Anything else (the local partner SVGs) is returned unchanged. Remove `loader`/`loaderFile` from next.config.ts
 * when re-enabling the CMS so uploads on R2 are optimized again (src/cms/README.md).
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('https://images.unsplash.com/')) return src
  const url = new URL(src)
  const baseWidth = Number(url.searchParams.get('w'))
  const baseHeight = Number(url.searchParams.get('h'))
  url.searchParams.set('w', String(width))
  if (baseWidth && baseHeight) url.searchParams.set('h', String(Math.round((baseHeight * width) / baseWidth)))
  url.searchParams.set('q', String(quality ?? 75))
  return url.toString()
}
