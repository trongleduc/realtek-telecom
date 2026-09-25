import { defaultLocale, type Locale } from '@/i18n/routing'

const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL

/** Primary origin. Falls back to the Vercel production domain, then localhost for development. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelProduction ? `https://${vercelProduction}` : 'http://localhost:3000')
).replace(/\/$/, '')

/**
 * Extra origins allowed to call the Payload API with cookies: Vercel preview/branch deployments, and localhost in
 * development so /admin works locally while NEXT_PUBLIC_SITE_URL points at the production domain.
 */
export const extraOrigins = [
  ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map((host) => `https://${host}`),
  ...(process.env.NODE_ENV === 'development' ? [3000, 3001, 3002, 3003].map((port) => `http://localhost:${port}`) : []),
]

/** Path with locale prefix; Vietnamese (default) stays unprefixed. */
export function localizedPath(path: string, locale: Locale | string): string {
  const clean = path === '/' ? '' : path
  if (locale === defaultLocale) return clean || '/'
  return `/${locale}${clean}`
}

export function absoluteUrl(path: string, locale: Locale | string): string {
  return `${siteUrl}${localizedPath(path, locale)}`
}

export function isExternalUrl(url: string): boolean {
  return /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
}
