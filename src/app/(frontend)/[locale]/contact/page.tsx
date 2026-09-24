import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { Clock, Mail, MapPin, Phone } from '@/components/Icons'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { isLocale } from '@/i18n/routing'
import { getSiteSettings, listServices } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

import { ContactForm } from './ContactForm'

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'contact' })
  return buildMetadata({ locale, path: '/contact', title: t('title'), description: t('intro') })
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [settings, services, t, tn] = await Promise.all([
    getSiteSettings(locale),
    listServices(locale),
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  const tel = settings.hotline?.replace(/[^\d+]/g, '')
  const items = [
    settings.address && {
      icon: <MapPin size={20} />,
      label: t('address'),
      value: settings.address,
      href: settings.mapLink,
    },
    settings.hotline && {
      icon: <Phone size={20} />,
      label: t('hotline'),
      value: [settings.hotline, settings.phone].filter(Boolean).join(' · '),
      href: `tel:${tel}`,
    },
    settings.email && {
      icon: <Mail size={20} />,
      label: t('email'),
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.workingHours && { icon: <Clock size={20} />, label: t('workingHours'), value: settings.workingHours },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href?: string | null }[]

  return (
    <>
      <PageHero
        locale={locale}
        title={t('title')}
        eyebrow={settings.shortName || 'Realtek Telecom'}
        lead={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('contact') }]}
        placement="contact"
      />

      <section className="py-20 md:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal variant="mask-x">
              <p className="eyebrow">{settings.companyName}</p>
            </Reveal>
            <ul className="mt-8 border-t border-line">
              {items.map((item, i) => (
                <li key={item.label}>
                  <Reveal variant="left" delay={i * 90}>
                    <div className="flex gap-5 border-b border-line py-6">
                      <span className="grid h-12 w-12 shrink-0 place-items-center bg-brand-soft text-brand">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="mt-1 block whitespace-pre-line text-[16px] font-medium text-ink transition-colors hover:text-brand"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 whitespace-pre-line text-[16px] font-medium text-ink">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <Reveal variant="up">
              <div className="bg-paper p-8 md:p-12">
                <h2 className="font-display text-2xl font-bold uppercase tracking-[0.02em] text-brand md:text-3xl">
                  {t('formTitle')}
                </h2>
                <div className="mt-8">
                  <ContactForm services={services.map((s) => ({ id: String(s.id), title: s.title }))} />
                </div>
              </div>
            </Reveal>
            <BannerSlot placement="contact" locale={locale} className="mt-8" sizes="(min-width: 1024px) 700px, 100vw" />
          </div>
        </div>
      </section>

      {settings.mapEmbedUrl ? (
        <Reveal variant="up">
          <div className="relative h-[420px] w-full bg-paper md:h-[520px]">
            <iframe
              src={settings.mapEmbedUrl}
              title={t('map')}
              className="absolute inset-0 h-full w-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      ) : null}
    </>
  )
}
