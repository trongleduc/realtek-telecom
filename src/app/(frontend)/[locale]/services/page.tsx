import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ServiceRow } from '@/components/cards'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { isLocale } from '@/i18n/routing'
import { listServices } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'nav' })
  return buildMetadata({ locale, path: '/services', title: t('services') })
}

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [services, tn, th, tc] = await Promise.all([
    listServices(locale),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
  ])

  return (
    <>
      <PageHero
        locale={locale}
        title={th('servicesTitle')}
        eyebrow={tn('services')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('services') }]}
        placement="services"
        image={services[0]?.featuredImage}
      />
      <section className="py-20 md:py-28">
        <div className="container-x">
          {services.length ? (
            <ul className="border-b border-line">
              {services.map((service, i) => (
                <li key={service.id}>
                  <Reveal variant="up" delay={Math.min(i, 4) * 60}>
                    <ServiceRow service={service} index={i} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">{tc('empty')}</p>
          )}
        </div>
      </section>
    </>
  )
}
