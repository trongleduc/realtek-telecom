import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { DocumentRow } from '@/components/cards'
import { Search } from '@/components/Icons'
import { PageHero } from '@/components/PageHero'
import { Pagination } from '@/components/Pagination'
import { Reveal } from '@/components/reveal/Reveal'
import { isLocale } from '@/i18n/routing'
import { listDocumentCategories, searchDocuments, type DocumentSort } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'
import { localizedPath } from '@/lib/site'

// Reads searchParams (page / filters). Pages under [locale] are not prerendered, so Next cannot infer this;
// without it the first request is treated as static and fails with DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic'

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/documents'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'documents' })
  // Filtered/search result pages are not indexed; the canonical library page is.
  const filtered = Boolean(first(sp.q) || first(sp.category) || first(sp.sort) || first(sp.page))
  return buildMetadata({ locale, path: '/documents', title: t('title'), description: t('intro'), noIndex: filtered })
}

export default async function DocumentsPage({ params, searchParams }: PageProps<'/[locale]/documents'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const sp = await searchParams
  const q = first(sp.q)?.slice(0, 120).trim() || undefined
  const categorySlug = first(sp.category) || undefined
  const sort: DocumentSort = first(sp.sort) === 'popular' ? 'popular' : 'newest'
  const page = Math.max(1, Number.parseInt(first(sp.page) ?? '1', 10) || 1)

  const [categories, t, tn] = await Promise.all([
    listDocumentCategories(locale),
    getTranslations({ locale, namespace: 'documents' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])
  const category = categories.find((c) => c.slug === categorySlug)
  const result = await searchDocuments(locale, {
    q,
    categoryId: category ? String(category.id) : undefined,
    sort,
    page,
  })

  const action = localizedPath('/documents', locale)
  const query = { q, category: category?.slug, sort: sort === 'popular' ? 'popular' : undefined }

  return (
    <>
      <PageHero
        locale={locale}
        title={t('title')}
        eyebrow={tn('documents')}
        lead={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('documents') }]}
        placement="documents"
      />

      <section className="py-16 md:py-24">
        <div className="container-x">
          <Reveal variant="up">
            <form action={action} role="search" className="grid gap-3 md:grid-cols-[1fr_240px_200px_auto]">
              <label className="relative block">
                <span className="sr-only">{t('search')}</span>
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder={t('searchPlaceholder')}
                  className="h-14 w-full border border-line bg-white pl-12 pr-4 text-[16px] outline-none transition-colors focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="sr-only">{t('category')}</span>
                <select
                  name="category"
                  defaultValue={category?.slug ?? ''}
                  className="h-14 w-full border border-line bg-white px-4 text-[15px] outline-none focus:border-brand"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">Sort</span>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="h-14 w-full border border-line bg-white px-4 text-[15px] outline-none focus:border-brand"
                >
                  <option value="newest">{t('sortNewest')}</option>
                  <option value="popular">{t('sortPopular')}</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary h-14">
                {t('search')}
              </button>
            </form>
          </Reveal>

          <BannerSlot placement="documents-top" locale={locale} className="mt-12" />

          <p className="mt-12 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink-soft" aria-live="polite">
            {t('results', { count: result.totalDocs })}
          </p>

          {result.docs.length ? (
            <ul className="mt-4 border-t border-line">
              {result.docs.map((doc, i) => (
                <li key={doc.id}>
                  <Reveal variant="up" delay={Math.min(i, 5) * 50}>
                    <DocumentRow doc={doc} locale={locale} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 border border-dashed border-line p-10 text-center text-ink-soft">{t('noResults')}</p>
          )}

          <Pagination locale={locale} page={page} totalPages={result.totalPages} pathname="/documents" query={query} />
        </div>
      </section>
    </>
  )
}
