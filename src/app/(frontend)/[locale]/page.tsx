import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { DocumentRow, PostCard } from '@/components/cards'
import { CountUp } from '@/components/home/CountUp'
import { FanCards, type FanCard } from '@/components/home/FanCards'
import { HeroSlider } from '@/components/home/HeroSlider'
import { Parallax } from '@/components/home/Parallax'
import { ProjectAccordion, type AccordionItem } from '@/components/home/ProjectAccordion'
import { ArrowRight, Search } from '@/components/Icons'
import { Img } from '@/components/Img'
import { toHeroSlides } from '@/components/PageHero'
import { PartnerMarquee } from '@/components/PartnerMarquee'
import { Reveal } from '@/components/reveal/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { SmartLink } from '@/components/SmartLink'
import { isLocale } from '@/i18n/routing'
import { getHomePage, getPartners, listPosts, listProjects, listServices, searchDocuments } from '@/lib/data'
import { resolveImage } from '@/lib/media'
import { buildMetadata } from '@/lib/metadata'
import type { Project, Service } from '@/payload-types'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const home = await getHomePage(locale)
  return buildMetadata({ locale, path: '/', seo: home.seo })
}

const pickDocs = <T,>(list: (T | string)[] | null | undefined) =>
  (list ?? []).filter((item): item is T => typeof item === 'object' && item !== null)

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)

  const [t, tc, td, home, hero, featuredServices, featuredProjects, posts, documents, partners] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'documents' }),
    getHomePage(locale),
    toHeroSlides('home', locale),
    listServices(locale, { featuredOnly: true }),
    listProjects(locale, { featuredOnly: true, limit: 6 }),
    listPosts(locale, { limit: 3 }),
    searchDocuments(locale, { limit: 5 }),
    getPartners(),
  ])

  const services = pickDocs<Service>(home.services).length
    ? pickDocs<Service>(home.services)
    : featuredServices.slice(0, 5)
  const projects = pickDocs<Project>(home.projects).length ? pickDocs<Project>(home.projects) : featuredProjects.docs

  const fanCards: FanCard[] = services.map((s) => ({
    id: String(s.id),
    href: `/services/${s.slug}`,
    title: s.title,
    excerpt: s.excerpt,
    image: resolveImage(s.featuredImage, 'card', s.title),
  }))
  const accordion: AccordionItem[] = projects.map((p) => ({
    id: String(p.id),
    href: `/projects/${p.slug}`,
    title: p.title,
    meta: [p.field, p.location].filter(Boolean).join(' · '),
    image: resolveImage(p.featuredImage, 'wide', p.title),
  }))

  const intro = home.intro
  const highlight = home.highlight
  const highlightImage = resolveImage(highlight?.image, 'hero')

  return (
    <>
      {hero.slides.length ? (
        <HeroSlider slides={hero.slides} autoplay={hero.autoplay} intervalSeconds={hero.interval} />
      ) : (
        <section className="flex min-h-[70svh] items-end bg-brand-deep pb-20 pt-40 text-white">
          <div className="container-x">
            <p className="eyebrow eyebrow--light">{t('eyebrow')}</p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(34px,6vw,80px)] font-bold uppercase leading-[1.02]">
              {intro?.heading || t('eyebrow')}
            </h1>
          </div>
        </section>
      )}

      {/* Intro + stats */}
      {intro?.heading || intro?.text ? (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
          <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              {intro.eyebrow ? (
                <Reveal variant="mask-x">
                  <p className="eyebrow">{intro.eyebrow}</p>
                </Reveal>
              ) : null}
              {intro.heading ? (
                <Reveal variant="up" delay={100}>
                  <h2 className="mt-5 whitespace-pre-line font-display text-[clamp(28px,3.6vw,46px)] font-bold uppercase leading-[1.12] text-brand">
                    {intro.heading}
                  </h2>
                </Reveal>
              ) : null}
              {intro.text ? (
                <Reveal variant="up" delay={200}>
                  <p className="mt-7 whitespace-pre-line text-[17px] leading-[1.85] text-ink-soft">{intro.text}</p>
                </Reveal>
              ) : null}
              {intro.link?.url ? (
                <Reveal variant="up" delay={300}>
                  <SmartLink href={intro.link.url} className="btn btn-primary mt-10">
                    {intro.link.label} <ArrowRight size={16} />
                  </SmartLink>
                </Reveal>
              ) : null}
            </div>
            <div className="relative lg:col-span-6">
              {intro.image ? (
                <Reveal variant="mask" className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
                    <Img
                      media={intro.image}
                      size="wide"
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ) : null}
              {intro.stats?.length ? (
                <Reveal
                  variant="right"
                  delay={250}
                  className={intro.image ? 'relative -mt-24 ml-auto w-[88%] md:-mt-32 md:w-[78%]' : ''}
                >
                  <dl className="grid grid-cols-2 bg-brand text-white shadow-[0_30px_60px_-30px_rgb(7_37_82/0.6)]">
                    {intro.stats.map((stat, i) => (
                      <div
                        key={stat.id ?? i}
                        className={`p-6 md:p-8 ${i % 2 ? 'border-l border-white/10' : ''} ${i > 1 ? 'border-t border-white/10' : ''}`}
                      >
                        <dd className="font-display text-4xl font-bold text-white md:text-5xl">
                          <CountUp value={stat.value} suffix={stat.suffix} />
                        </dd>
                        <dt className="mt-2 text-[13px] uppercase tracking-[0.12em] text-white/70">{stat.label}</dt>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Services: cards fan out from the centre */}
      {fanCards.length ? (
        <section className="bg-paper py-24 md:py-32">
          <div className="container-x">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('servicesTitle')}
              action={{ label: tc('viewAll'), href: '/services' }}
              className="mb-12 md:mb-16"
            />
            <FanCards cards={fanCards} />
          </div>
        </section>
      ) : null}

      {/* Full-bleed image band fading into paper */}
      {highlightImage ? (
        <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-paper md:min-h-[640px]">
          <Parallax>
            <Image
              src={highlightImage.url}
              alt={highlightImage.alt}
              fill
              sizes="100vw"
              className="object-cover"
              style={highlightImage.focal ? { objectPosition: highlightImage.focal } : undefined}
            />
          </Parallax>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-l from-paper via-paper/85 to-transparent md:via-paper/70"
          />
          <div className="container-x relative flex justify-end py-24">
            <div className="max-w-xl">
              {highlight?.eyebrow ? (
                <Reveal variant="mask-x">
                  <p className="eyebrow">{highlight.eyebrow}</p>
                </Reveal>
              ) : null}
              {highlight?.heading ? (
                <Reveal variant="blur" delay={120}>
                  <h2 className="mt-5 whitespace-pre-line font-display text-[clamp(28px,3.8vw,48px)] font-bold uppercase leading-[1.1] text-brand">
                    {highlight.heading}
                  </h2>
                </Reveal>
              ) : null}
              {highlight?.text ? (
                <Reveal variant="up" delay={240}>
                  <p className="mt-6 whitespace-pre-line text-[17px] text-ink-soft">{highlight.text}</p>
                </Reveal>
              ) : null}
              {highlight?.link?.url ? (
                <Reveal variant="up" delay={340}>
                  <SmartLink href={highlight.link.url} className="btn btn-outline mt-9 text-brand">
                    {highlight.link.label} <ArrowRight size={16} />
                  </SmartLink>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Projects: expanding image strip */}
      {accordion.length ? (
        <section className="bg-white pt-24 md:pt-32">
          <div className="container-x">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('projectsTitle')}
              action={{ label: tc('viewAll'), href: '/projects' }}
              className="mb-12 md:mb-14"
            />
          </div>
          <Reveal variant="up">
            <ProjectAccordion items={accordion} />
          </Reveal>
        </section>
      ) : null}

      <BannerSlot placement="home-middle" locale={locale} className="container-x pt-20" />

      {/* Document library teaser */}
      <section className="bg-white py-24 md:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t('eyebrow')} title={t('documentsTitle')}>
              {t('documentsText')}
            </SectionHeading>
            <Reveal variant="up" delay={250}>
              <form
                action={locale === 'vi' ? '/documents' : `/${locale}/documents`}
                className="mt-10 flex border-b-2 border-brand"
              >
                <label htmlFor="home-doc-search" className="sr-only">
                  {td('search')}
                </label>
                <input
                  id="home-doc-search"
                  name="q"
                  type="search"
                  placeholder={td('searchPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-4 text-[16px] outline-none placeholder:text-ink-soft/70"
                />
                <button type="submit" className="grid w-12 place-items-center text-brand" aria-label={td('search')}>
                  <Search size={22} />
                </button>
              </form>
            </Reveal>
            <Reveal variant="up" delay={320}>
              <SmartLink href="/documents" className="link-arrow mt-8 text-brand">
                <span className="underline-grow">{tc('viewAll')}</span> <ArrowRight size={16} />
              </SmartLink>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            {documents.docs.length ? (
              <ul className="border-t border-line">
                {documents.docs.map((doc, i) => (
                  <li key={doc.id}>
                    <Reveal variant="right" delay={i * 80}>
                      <DocumentRow doc={doc} locale={locale} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft">{tc('empty')}</p>
            )}
          </div>
        </div>
      </section>

      {/* News */}
      {posts.docs.length ? (
        <section className="bg-paper py-24 md:py-32">
          <div className="container-x">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('newsTitle')}
              action={{ label: tc('viewAll'), href: '/news' }}
              className="mb-12 md:mb-16"
            />
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <Reveal variant="up" className="lg:col-span-7">
                <PostCard post={posts.docs[0]} locale={locale} large />
              </Reveal>
              <div className="grid gap-12 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-10">
                {posts.docs.slice(1).map((post, i) => (
                  <Reveal key={post.id} variant="up" delay={150 + i * 120}>
                    <PostCard post={post} locale={locale} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Partners */}
      {partners.length ? (
        <section className="border-t border-line bg-white py-20">
          <div className="container-x mb-10">
            <Reveal variant="mask-x">
              <p className="eyebrow">{t('partnersTitle')}</p>
            </Reveal>
          </div>
          <Reveal variant="up">
            <PartnerMarquee partners={partners} />
          </Reveal>
        </section>
      ) : null}

      <BannerSlot placement="home-bottom" locale={locale} className="container-x pb-20" />
    </>
  )
}
