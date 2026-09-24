import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { RichText } from '@/components/RichText'
import { isLocale } from '@/i18n/routing'
import { getAboutPage } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [page, t] = await Promise.all([getAboutPage(locale), getTranslations({ locale, namespace: 'nav' })])
  return buildMetadata({
    locale,
    path: '/about',
    title: page.heading || t('about'),
    description: page.lead,
    image: page.image,
    seo: page.seo,
  })
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [page, t, tn] = await Promise.all([
    getAboutPage(locale),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])
  const title = page.heading || tn('about')
  const certificates = (page.certificates ?? []).filter((c) => typeof c === 'object')

  return (
    <>
      <PageHero
        locale={locale}
        title={title}
        eyebrow={t('eyebrow')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('about') }]}
        placement="about"
        image={page.image}
      />

      {page.lead || page.content ? (
        <section className="py-24 md:py-32">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            {page.lead ? (
              <Reveal variant="up" className="lg:col-span-5">
                <p className="font-display text-[clamp(22px,2.4vw,30px)] font-semibold leading-snug text-brand">
                  {page.lead}
                </p>
                <span aria-hidden className="mt-8 block h-px w-24 bg-accent" />
              </Reveal>
            ) : null}
            <Reveal variant="up" delay={150} className={page.lead ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <RichText data={page.content} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {page.values?.length ? (
        <section className="bg-brand py-24 text-white md:py-28">
          <div className="container-x">
            <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {page.values.map((v, i) => (
                <li key={v.id ?? i} className="bg-brand">
                  <Reveal variant="up" delay={i * 100} innerClassName="h-full p-8 md:p-10">
                    <span className="font-display text-sm font-semibold tabular-nums text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-[0.04em]">{v.title}</h2>
                    {v.text ? <p className="mt-3 text-[15px] leading-relaxed text-white/75">{v.text}</p> : null}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.milestones?.length ? (
        <section className="bg-paper py-24 md:py-32">
          <div className="container-x">
            <ol className="relative border-l border-line pl-8 md:mx-auto md:max-w-4xl md:border-l-0 md:pl-0">
              <span
                aria-hidden
                className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-line md:block"
              />
              {page.milestones.map((m, i) => {
                const right = i % 2 === 1
                return (
                  <li key={m.id ?? i} className={`relative pb-14 last:pb-0 md:grid md:grid-cols-2 md:gap-16`}>
                    <span
                      aria-hidden
                      className="absolute -left-[37px] top-2 h-3 w-3 rounded-full border-2 border-accent bg-paper md:left-1/2 md:-translate-x-1/2"
                    />
                    <Reveal variant={right ? 'right' : 'left'} className={right ? 'md:col-start-2' : 'md:text-right'}>
                      <p className="font-display text-4xl font-bold text-accent">{m.year}</p>
                      <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-[0.04em] text-brand">
                        {m.title}
                      </h3>
                      {m.text ? <p className="mt-2 text-[15px] text-ink-soft">{m.text}</p> : null}
                    </Reveal>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {certificates.length ? (
        <section className="py-24">
          <div className="container-x grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {certificates.map((c, i) => (
              <Reveal key={typeof c === 'object' ? c.id : i} variant="zoom" delay={i * 80}>
                <div className="relative aspect-[3/4] border border-line bg-white p-3">
                  <Img media={c} size="card" fill sizes="20vw" className="object-contain p-3" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
