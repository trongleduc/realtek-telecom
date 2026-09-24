import type { Metadata } from 'next'

import { locales, type Locale } from '@/i18n/routing'

import { getSiteSettings } from './data'
import { resolveImage } from './media'
import { absoluteUrl, siteUrl } from './site'

type SeoGroup = { metaTitle?: string | null; metaDescription?: string | null; ogImage?: unknown } | null | undefined

type Args = {
  locale: Locale
  path: string
  title?: string | null
  description?: string | null
  image?: unknown
  seo?: SeoGroup
  type?: 'website' | 'article'
  publishedTime?: string | null
  noIndex?: boolean
}

const ogLocale: Record<Locale, string> = { vi: 'vi_VN', en: 'en_US', zh: 'zh_CN' }

export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(path, l)])),
    'x-default': absoluteUrl(path, 'vi'),
  }
}

export async function buildMetadata({
  locale,
  path,
  title,
  description,
  image,
  seo,
  type = 'website',
  publishedTime,
  noIndex,
}: Args): Promise<Metadata> {
  const settings = await getSiteSettings(locale)
  const siteName = settings.shortName || 'Realtek Telecom'
  const pageTitle = seo?.metaTitle || title || settings.defaultMetaTitle || siteName
  const pageDescription = seo?.metaDescription || description || settings.defaultMetaDescription || undefined
  const ogImage =
    resolveImage(seo?.ogImage, 'wide') ?? resolveImage(image, 'wide') ?? resolveImage(settings.defaultOgImage, 'wide')
  const imageUrl = ogImage ? new URL(ogImage.url, siteUrl).toString() : undefined
  const url = absoluteUrl(path, locale)

  return {
    title: path === '/' && !seo?.metaTitle ? { absolute: pageTitle } : pageTitle,
    description: pageDescription,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      siteName,
      title: pageTitle,
      description: pageDescription,
      locale: ogLocale[locale],
      images: imageUrl
        ? [{ url: imageUrl, width: ogImage!.width, height: ogImage!.height, alt: ogImage!.alt }]
        : undefined,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: imageUrl ? 'summary_large_image' : 'summary', title: pageTitle, description: pageDescription },
    robots: noIndex ? { index: false, follow: true } : undefined,
  }
}
