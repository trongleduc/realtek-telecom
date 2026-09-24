import { getLocale, getTranslations } from 'next-intl/server'

import { ArrowRight } from '@/components/Icons'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-brand-deep pt-[var(--header-h)] text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[4vw] bottom-[-6vw] select-none font-display text-[38vw] font-bold leading-none text-white/[0.04]"
      >
        404
      </span>
      <div className="container-x relative">
        <p className="eyebrow eyebrow--light">404</p>
        <h1 className="mt-5 max-w-3xl font-display text-[clamp(34px,5vw,64px)] font-bold uppercase leading-[1.05]">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/75">{t('text')}</p>
        <Link href="/" className="btn btn-light mt-10">
          {t('back')} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
