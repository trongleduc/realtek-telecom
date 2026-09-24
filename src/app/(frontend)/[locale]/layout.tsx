import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Montserrat } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { JsonLd } from '@/components/JsonLd'
import { QuickContact } from '@/components/layout/QuickContact'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader, type NavItem } from '@/components/layout/SiteHeader'
import { Logo } from '@/components/Logo'
import { isLocale } from '@/i18n/routing'
import { getHeader, getSiteSettings } from '@/lib/data'
import { resolveImage } from '@/lib/media'
import { siteUrl } from '@/lib/site'

import '../globals.css'

const bodyFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const headingFont = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

/**
 * Nothing is prerendered at build time, so building (e.g. on Vercel) never needs the database.
 * Each locale page is rendered on its first request and then cached like a static page (ISR).
 */
export function generateStaticParams() {
  return []
}

export const viewport: Viewport = {
  themeColor: '#0c3a78',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [settings, t] = await Promise.all([getSiteSettings(locale), getTranslations({ locale, namespace: 'meta' })])
  const siteName = settings.shortName || t('siteName')
  const favicon = resolveImage(settings.favicon)
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.defaultMetaTitle || siteName, template: `%s | ${siteName}` },
    description: settings.defaultMetaDescription || t('defaultDescription'),
    applicationName: siteName,
    verification: settings.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
    icons: favicon ? { icon: favicon.url } : undefined,
    formatDetection: { telephone: false },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)

  const [settings, header, t, draft] = await Promise.all([
    getSiteSettings(locale),
    getHeader(locale),
    getTranslations({ locale, namespace: 'nav' }),
    draftMode(),
  ])

  const defaultNav: NavItem[] = [
    { label: t('about'), href: '/about' },
    { label: t('services'), href: '/services' },
    { label: t('projects'), href: '/projects' },
    { label: t('news'), href: '/news' },
    { label: t('documents'), href: '/documents' },
    { label: t('contact'), href: '/contact' },
  ]
  const nav: NavItem[] = header.navItems?.length
    ? header.navItems.map((item) => ({
        label: item.label ?? '',
        href: item.url ?? '/',
        children: item.children?.map((c) => ({ label: c.label ?? '', href: c.url ?? '/' })),
      }))
    : defaultNav

  const name = settings.shortName || 'Realtek Telecom'
  const logoImage = resolveImage(settings.logo)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName || name,
    url: siteUrl,
    logo: logoImage ? new URL(logoImage.url, siteUrl).toString() : undefined,
    email: settings.email || undefined,
    telephone: settings.hotline || undefined,
    address: settings.address || undefined,
    sameAs: [settings.facebookUrl, settings.youtubeUrl, settings.linkedinUrl].filter(Boolean),
  }

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-[100] bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {t('skip')}
          </a>
          {draft.isEnabled ? (
            <div className="fixed bottom-4 left-4 z-[60] flex items-center gap-3 bg-ink px-4 py-2 text-xs text-white shadow-lg">
              Đang xem bản nháp
              {/* Route handler, not a page: needs a full request so the draft-mode cookie is cleared. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/next/exit-preview" className="font-semibold text-accent underline">
                Thoát
              </a>
            </div>
          ) : null}
          <SiteHeader
            items={nav}
            hotline={settings.hotline}
            logo={<Logo logo={settings.logo} name={name} />}
            logoLight={<Logo logo={settings.logoLight} tone="light" name={name} />}
          />
          <main id="main">{children}</main>
          <SiteFooter locale={locale} fallbackLinks={[{ label: t('home'), href: '/' }, ...defaultNav]} />
          <QuickContact
            hotline={settings.hotline}
            zaloPhone={settings.zaloPhone}
            email={settings.email}
            mapLink={settings.mapLink}
          />
        </NextIntlClientProvider>
        <JsonLd data={organization} />
      </body>
    </html>
  )
}
