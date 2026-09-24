import { getTranslations } from 'next-intl/server'

import { Facebook, Linkedin, Youtube } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { Reveal } from '@/components/reveal/Reveal'
import { SmartLink } from '@/components/SmartLink'
import type { Locale } from '@/i18n/routing'
import { getFooter, getSiteSettings } from '@/lib/data'

import type { NavItem } from './SiteHeader'

export async function SiteFooter({ locale, fallbackLinks }: { locale: Locale; fallbackLinks: NavItem[] }) {
  const [t, tc, settings, footer] = await Promise.all([
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'contact' }),
    getSiteSettings(locale),
    getFooter(locale),
  ])

  const links = footer.links?.length
    ? footer.links.map((l) => ({ label: l.label ?? '', href: l.url ?? '/' }))
    : fallbackLinks
  const socials = [
    { href: settings.facebookUrl, label: 'Facebook', icon: <Facebook /> },
    { href: settings.youtubeUrl, label: 'YouTube', icon: <Youtube /> },
    { href: settings.linkedinUrl, label: 'LinkedIn', icon: <Linkedin /> },
  ].filter((s) => s.href)
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-brand text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-white/5"
      />

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <Reveal className="md:col-span-5" variant="up">
          <Logo logo={settings.logoLight} tone="light" name={settings.shortName ?? undefined} />
          {settings.tagline ? (
            <p className="mt-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              {settings.tagline}
            </p>
          ) : null}
          {settings.description ? (
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">{settings.description}</p>
          ) : null}
          {socials.length ? (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{t('follow')}</p>
              <ul className="mt-3 flex gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center border border-white/25 transition-colors hover:border-accent hover:bg-accent"
                    >
                      {s.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Reveal>

        <Reveal className="md:col-span-3" variant="up" delay={120}>
          <h2 className="border-b border-white/15 pb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t('links')}
          </h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/80">
            {links.map((l) => (
              <li key={l.href + l.label}>
                <SmartLink href={l.href} className="underline-grow hover:text-white">
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="md:col-span-4" variant="up" delay={240}>
          <h2 className="border-b border-white/15 pb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t('contact')}
          </h2>
          <dl className="mt-4 space-y-4 text-[15px]">
            {settings.address ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tc('address')}</dt>
                <dd className="mt-1 whitespace-pre-line text-white/85">{settings.address}</dd>
              </div>
            ) : null}
            {settings.hotline ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tc('hotline')}</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${settings.hotline.replace(/[^\d+]/g, '')}`}
                    className="underline-grow text-white/85 hover:text-white"
                  >
                    {settings.hotline}
                  </a>
                  {settings.phone ? <span className="text-white/60"> · {settings.phone}</span> : null}
                </dd>
              </div>
            ) : null}
            {settings.email ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tc('email')}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${settings.email}`} className="underline-grow text-white/85 hover:text-white">
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {settings.mapEmbedUrl ? (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden border border-white/15 bg-brand-deep">
              <iframe
                src={settings.mapEmbedUrl}
                title={t('map')}
                className="absolute inset-0 h-full w-full grayscale-[40%] transition duration-500 hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
        </Reveal>
      </div>

      <div className="border-t border-white/10 bg-brand-deep">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-center text-[13px] text-white/60 md:flex-row md:text-left">
          <p>
            {footer.copyright || (
              <>
                © {year} {t('rights')} <strong className="font-semibold text-white">{settings.companyName}</strong>
              </>
            )}
            {settings.taxCode ? (
              <span className="block md:ml-3 md:inline">
                · {t('taxCode')}: {settings.taxCode}
              </span>
            ) : null}
          </p>
          <p>
            {t.rich('designedBy', {
              brand: (chunks) => (
                <a
                  href="https://ximitech.vn"
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-white/85 transition-colors hover:text-accent"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </div>
    </footer>
  )
}
