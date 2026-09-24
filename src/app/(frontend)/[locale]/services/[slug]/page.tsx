import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { Gallery } from '@/components/Gallery'
import { ArrowRight } from '@/components/Icons'
import { Img } from '@/components/Img'
import { breadcrumbJsonLd, JsonLd } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { RichText } from '@/components/RichText'
import { ShareButtons } from '@/components/ShareButtons'
import { Link } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { getBySlug, listServices } from '@/lib/data'
import { loadDetail } from '@/lib/detail'
import { buildMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const doc = await getBySlug('services', slug, locale)
  if (!doc) return {}
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: doc.title,
    description: doc.excerpt,
    image: doc.featuredImage,
    seo: doc.seo,
  })
}

export default async function ServicePage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [service, all, tn, tc] = await Promise.all([
    loadDetail('services', slug, locale),
    listServices(locale),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const others = all.filter((s) => s.id !== service.id)
  const url = absoluteUrl(`/services/${slug}`, locale)

  return (
    <>
      <PageHero
        locale={locale}
        title={service.title}
        eyebrow={tn('services')}
        lead={service.excerpt}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('services'), href: '/services' },
          { label: service.title },
        ]}
        image={service.featuredImage}
      />

      <section className="py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <Reveal variant="up">
              <RichText data={service.content} />
            </Reveal>
            <div className="mt-12 border-t border-line pt-8">
              <ShareButtons url={url} title={service.title} />
            </div>
          </article>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <Reveal variant="left">
                <h2 className="eyebrow">{tn('services')}</h2>
                <ul className="mt-5 border-t border-line">
                  {all.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/services/${s.slug}`}
                        aria-current={s.id === service.id ? 'page' : undefined}
                        className={`group flex items-center justify-between gap-4 border-b border-line py-4 text-[15px] font-medium transition-colors ${
                          s.id === service.id ? 'text-brand' : 'text-ink hover:text-brand'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`h-px bg-accent transition-all duration-500 ${s.id === service.id ? 'w-6' : 'w-0 group-hover:w-6'}`}
                          />
                          {s.title}
                        </span>
                        <ArrowRight size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </aside>
        </div>
      </section>

      {service.gallery?.length ? (
        <section className="pb-24">
          <div className="container-x">
            <Gallery images={service.gallery} />
          </div>
        </section>
      ) : null}

      <BannerSlot placement="services-detail" locale={locale} className="container-x pb-20" />

      {others.length ? (
        <section className="bg-paper py-20 md:py-24">
          <div className="container-x">
            <Reveal variant="mask-x">
              <p className="eyebrow">{tc('related')}</p>
            </Reveal>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((s, i) => (
                <li key={s.id}>
                  <Reveal variant="up" delay={i * 100}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group relative block aspect-[4/3] overflow-hidden bg-brand-deep text-white"
                    >
                      <Img
                        media={s.featuredImage}
                        size="card"
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute bottom-0 p-6 font-display text-lg font-bold uppercase tracking-[0.04em]">
                        {s.title}
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('services'), url: absoluteUrl('/services', locale) },
          { name: service.title, url },
        ])}
      />
    </>
  )
}
