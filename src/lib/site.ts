import { defaultLocale, type Locale } from '@/i18n/routing'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

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
