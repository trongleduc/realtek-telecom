import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsListing } from '@/components/NewsListing'
import { isLocale } from '@/i18n/routing'
import { buildMetadata } from '@/lib/metadata'

// Reads searchParams (page / filters). Pages under [locale] are not prerendered, so Next cannot infer this;
// without it the first request is treated as static and fails with DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic'

const parsePage = (value: unknown) => Math.max(1, Number.parseInt(String(value ?? '1'), 10) || 1)

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/news'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = parsePage((await searchParams).page)
  const t = await getTranslations({ locale, namespace: 'home' })
  return buildMetadata({ locale, path: '/news', title: page > 1 ? `${t('newsTitle')} – ${page}` : t('newsTitle') })
}

export default async function NewsPage({ params, searchParams }: PageProps<'/[locale]/news'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  return <NewsListing locale={locale} page={parsePage((await searchParams).page)} />
}
