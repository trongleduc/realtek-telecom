import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { listPostCategories, listPosts } from '@/lib/data'

import { BannerSlot } from './BannerSlot'
import { PostCard } from './cards'
import { PageHero } from './PageHero'
import { Pagination } from './Pagination'
import { Reveal } from './reveal/Reveal'

type Props = {
  locale: Locale
  page: number
  category?: { id: string; slug: string; title: string } | null
}

export async function NewsListing({ locale, page, category }: Props) {
  const [result, categories, tn, th, tc] = await Promise.all([
    listPosts(locale, { page, limit: 9, categoryId: category?.id }),
    listPostCategories(locale),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const basePath = category ? `/news/category/${category.slug}` : '/news'
  const crumbs = [
    { label: tn('home'), href: '/' },
    { label: tn('news'), href: category ? '/news' : undefined },
    ...(category ? [{ label: category.title }] : []),
  ]

  return (
    <>
      <PageHero
        locale={locale}
        title={category?.title ?? th('newsTitle')}
        eyebrow={tn('news')}
        crumbs={crumbs}
        placement="news"
        image={result.docs[0]?.featuredImage}
      />
      <section className="py-16 md:py-24">
        <div className="container-x">
          {categories.length ? (
            <nav aria-label={tn('news')} className="mb-14 flex flex-wrap gap-2">
              {[{ id: 'all', slug: '', title: tc('viewAll') }, ...categories].map((c) => {
                const active = category ? category.id === c.id : c.id === 'all'
                return (
                  <Link
                    key={c.id}
                    href={c.slug ? `/news/category/${c.slug}` : '/news'}
                    aria-current={active ? 'page' : undefined}
                    className={`border px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                      active
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-ink hover:border-brand hover:text-brand'
                    }`}
                  >
                    {c.title}
                  </Link>
                )
              })}
            </nav>
          ) : null}

          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-9">
              {result.docs.length ? (
                <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {result.docs.map((post, i) => (
                    <li key={post.id}>
                      <Reveal variant="up" delay={(i % 3) * 100}>
                        <PostCard post={post} locale={locale} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-soft">{tc('empty')}</p>
              )}
              <Pagination locale={locale} page={page} totalPages={result.totalPages} pathname={basePath} />
            </div>
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
                <BannerSlot placement="news-sidebar" locale={locale} sizes="(min-width: 1024px) 300px, 100vw" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
