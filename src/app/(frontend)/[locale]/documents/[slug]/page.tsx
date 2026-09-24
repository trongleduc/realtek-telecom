import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { DocumentRow } from '@/components/cards'
import { ArrowRight, Download } from '@/components/Icons'
import { Img } from '@/components/Img'
import { breadcrumbJsonLd, JsonLd } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { RichText } from '@/components/RichText'
import { ShareButtons } from '@/components/ShareButtons'
import { Link } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { getBySlug, searchDocuments } from '@/lib/data'
import { loadDetail } from '@/lib/detail'
import { buildMetadata } from '@/lib/metadata'
import { absoluteUrl, localizedPath } from '@/lib/site'
import type { DocumentCategory } from '@/payload-types'

export async function generateMetadata({ params }: PageProps<'/[locale]/documents/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const doc = await getBySlug('documents', slug, locale)
  if (!doc) return {}
  return buildMetadata({
    locale,
    path: `/documents/${slug}`,
    title: doc.title,
    description: doc.summary,
    image: doc.coverImage,
    seo: doc.seo,
  })
}

export default async function DocumentPage({ params }: PageProps<'/[locale]/documents/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const doc = await loadDetail('documents', slug, locale)
  const category = typeof doc.category === 'object' ? (doc.category as DocumentCategory | null) : null
  const [related, t, tn, format] = await Promise.all([
    searchDocuments(locale, {
      categoryId: category ? String(category.id) : undefined,
      excludeId: String(doc.id),
      limit: 4,
    }),
    getTranslations({ locale, namespace: 'documents' }),
    getTranslations({ locale, namespace: 'nav' }),
    getFormatter({ locale }),
  ])
  const url = absoluteUrl(`/documents/${slug}`, locale)
  const provider = t(`providers.${doc.provider}`)
  const downloadHref = localizedPath(`/documents/${slug}/download`, locale)

  const info = [
    {
      label: t('format'),
      value: doc.fileFormat ? (doc.fileFormat === 'other' ? '—' : doc.fileFormat.toUpperCase()) : null,
    },
    { label: t('size'), value: doc.fileSize },
    { label: t('pages'), value: doc.pageCount ? String(doc.pageCount) : null },
    { label: t('category'), value: category?.title },
    { label: t('updated'), value: format.dateTime(new Date(doc.updatedAt), { dateStyle: 'medium' }) },
    { label: t('source'), value: provider },
  ].filter((i) => i.value)

  return (
    <>
      <PageHero
        locale={locale}
        title={doc.title}
        eyebrow={tn('documents')}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('documents'), href: '/documents' },
          { label: doc.title },
        ]}
        image={doc.coverImage}
      />

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <Reveal variant="up">
              <p className="font-display text-xl font-semibold leading-snug text-brand md:text-2xl">{doc.summary}</p>
            </Reveal>
            {doc.content ? (
              <Reveal variant="up" delay={120}>
                <RichText data={doc.content} className="mt-10" />
              </Reveal>
            ) : null}

            <Reveal variant="up" delay={160}>
              <div className="mt-12 flex flex-col gap-6 bg-paper p-8 md:flex-row md:items-center md:justify-between md:p-10">
                <p className="max-w-md text-[15px] text-ink-soft">{t('downloadNote', { provider })}</p>
                {/* Plain anchor: the route handler redirects off-site, so client-side navigation must not intercept it. */}
                <a href={downloadHref} target="_blank" rel="noopener nofollow" className="btn btn-primary shrink-0">
                  <Download size={18} /> {t('download')}
                </a>
              </div>
            </Reveal>

            <div className="mt-10 border-t border-line pt-8">
              <ShareButtons url={url} title={doc.title} />
            </div>

            <Reveal variant="up">
              <div className="mt-14 border-l-2 border-accent pl-6">
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.04em] text-brand">
                  {t('aboutTitle')}
                </h2>
                <p className="mt-3 text-[15px] text-ink-soft">{t('aboutText')}</p>
                <Link href="/contact" className="link-arrow mt-5 text-brand">
                  <span className="underline-grow">{tn('contact')}</span> <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </article>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              {doc.coverImage && typeof doc.coverImage === 'object' ? (
                <Reveal variant="zoom" className="hidden lg:block">
                  <div className="relative aspect-[3/4] overflow-hidden border border-line bg-paper">
                    <Img media={doc.coverImage} size="card" fill sizes="360px" className="object-cover" />
                  </div>
                </Reveal>
              ) : null}
              <Reveal variant="left">
                <h2 className="eyebrow">{t('info')}</h2>
                <dl className="mt-5 border-t border-line">
                  {info.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 border-b border-line py-3.5 text-[15px]">
                      <dt className="text-ink-soft">{row.label}</dt>
                      <dd className="text-right font-medium text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={downloadHref}
                  target="_blank"
                  rel="noopener nofollow"
                  className="btn btn-outline mt-6 w-full text-brand"
                >
                  <Download size={17} /> {t('download')}
                </a>
              </Reveal>
              <BannerSlot placement="documents-sidebar" locale={locale} sizes="(min-width: 1024px) 360px, 100vw" />
            </div>
          </aside>
        </div>
      </section>

      {related.docs.length ? (
        <section className="bg-paper py-20">
          <div className="container-x">
            <Reveal variant="mask-x">
              <p className="eyebrow">{t('related')}</p>
            </Reveal>
            <ul className="mt-8 border-t border-line">
              {related.docs.slice(0, 3).map((d, i) => (
                <li key={d.id}>
                  <Reveal variant="up" delay={i * 80}>
                    <DocumentRow doc={d} locale={locale} />
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
          '@type': 'DigitalDocument',
          name: doc.title,
          description: doc.summary,
          url,
          dateModified: doc.updatedAt,
          encodingFormat: doc.fileFormat && doc.fileFormat !== 'other' ? doc.fileFormat : undefined,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('documents'), url: absoluteUrl('/documents', locale) },
          { name: doc.title, url },
        ])}
      />
    </>
  )
}
