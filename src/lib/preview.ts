import { defaultLocale } from '@/i18n/routing'

/**
 * Admin "Preview" button target. The route checks the Payload login cookie,
 * enables Next.js draft mode, then opens the localized page.
 */
export function previewUrl(path: string, locale?: { code: string } | string) {
  const code = typeof locale === 'string' ? locale : locale?.code
  const localized = code && code !== defaultLocale ? `/${code}${path}` : path
  return `/next/preview?${new URLSearchParams({ path: localized }).toString()}`
}
