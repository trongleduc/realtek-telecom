import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { PostCard } from '@/components/cards'
import { Img } from '@/components/Img'
import { breadcrumbJsonLd, JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Reveal } from '@/components/reveal/Reveal'
import { RichText } from '@/components/RichText'
import { ShareButtons } from '@/components/ShareButtons'
import { Link } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { getBySlug, getSiteSettings, listPosts } from '@/lib/data'
import { loadDetail } from '@/lib/detail'
import { resolveImage } from '@/lib/media'
import { buildMetadata } from '@/lib/metadata'
import { absoluteUrl, siteUrl } from '@/lib/site'
import type { PostCategory } from '@/payload-types'

export async function generateMetadata({ params }: PageProps<'/[locale]/news/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const doc = await getBySlug('posts', slug, locale)
  if (!doc) return {}
  return buildMetadata({
    locale,
    path: `/news/${slug}`,
    title: doc.title,
    description: doc.excerpt,
    image: doc.featuredImage,
    seo: doc.seo,
    type: 'article',
    publishedTime: doc.publishedAt,
  })
}

export default async function PostPage({ params }: PageProps<'/[locale]/news/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const post = await loadDetail('posts', slug, locale)
  const category = typeof post.category === 'object' ? (post.category as PostCategory | null) : null
  const [related, settings, tn, tc, format] = await Promise.all([
    listPosts(locale, { limit: 3, excludeId: String(post.id), categoryId: category ? String(category.id) : undefined }),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
    getFormatter({ locale }),
  ])
  const url = absoluteUrl(`/news/${slug}`, locale)
  const image = resolveImage(post.featuredImage, 'wide')

  return (
    <>
      <section className="bg-brand-deep pb-16 pt-[calc(var(--header-h)+56px)] text-white md:pb-24">
        <div className="container-x max-w-5xl">
          <Reveal variant="down" once>
            <Breadcrumbs
              tone="light"
              items={[{ label: tn('home'), href: '/' }, { label: tn('news'), href: '/news' }, { label: post.title }]}
            />
          </Reveal>
          <Reveal variant="up" delay={120} once>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>
                  {format.dateTime(new Date(post.publishedAt), { dateStyle: 'long' })}
                </time>
              ) : null}
              {category ? (
                <>
                  <span className="h-px w-6 bg-accent" />
                  <Link href={`/news/category/${category.slug}`} className="text-accent hover:underline">
                    {category.title}
                  </Link>
                </>
              ) : null}
            </div>
            <h1 className="mt-5 font-display text-[clamp(28px,4.2vw,52px)] font-bold leading-[1.15]">{post.title}</h1>
            {post.excerpt ? <p className="mt-6 max-w-3xl text-lg text-white/80">{post.excerpt}</p> : null}
          </Reveal>
        </div>
      </section>

      {image ? (
        <div className="container-x -mt-px max-w-6xl">
          <Reveal variant="mask" once>
            <div className="relative aspect-[16/9] overflow-hidden">
              <Img
                media={post.featuredImage}
                size="hero"
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      ) : null}

      <section className="py-16 md:py-24">
        <div className="container-x grid max-w-6xl gap-14 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <RichText data={post.content} />
            <div className="mt-12 border-t border-line pt-8">
              <ShareButtons url={url} title={post.title} />
            </div>
          </article>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <BannerSlot placement="news-sidebar" locale={locale} sizes="(min-width: 1024px) 360px, 100vw" />
            </div>
          </aside>
        </div>
      </section>

      {related.docs.length ? (
        <section className="bg-paper py-20 md:py-24">
          <div className="container-x">
            <Reveal variant="mask-x">
              <p className="eyebrow">{tc('related')}</p>
            </Reveal>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.docs.map((p, i) => (
                <li key={p.id}>
                  <Reveal variant="up" delay={i * 100}>
                    <PostCard post={p} locale={locale} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: post.title,
          description: post.excerpt || undefined,
          image: image ? [new URL(image.url, siteUrl).toString()] : undefined,
          datePublished: post.publishedAt || post.createdAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: url,
          publisher: { '@type': 'Organization', name: settings.companyName || 'Realtek Telecom' },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('news'), url: absoluteUrl('/news', locale) },
          { name: post.title, url },
        ])}
      />
    </>
  )
}
