import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { NewsListing } from '@/components/NewsListing'
import { isLocale, type Locale } from '@/i18n/routing'
import { listPostCategories } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

const parsePage = (value: unknown) => Math.max(1, Number.parseInt(String(value ?? '1'), 10) || 1)

async function findCategory(slug: string, locale: Locale) {
  const categories = await listPostCategories(locale)
  return categories.find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps<'/[locale]/news/category/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const category = await findCategory(slug, locale)
  if (!category) return {}
  return buildMetadata({
    locale,
    path: `/news/category/${slug}`,
    title: category.title,
    description: category.description,
  })
}

export default async function NewsCategoryPage({ params, searchParams }: PageProps<'/[locale]/news/category/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const category = await findCategory(slug, locale)
  if (!category) notFound()
  return (
    <NewsListing
      locale={locale}
      page={parsePage((await searchParams).page)}
      category={{ id: String(category.id), slug: category.slug, title: category.title }}
    />
  )
}
