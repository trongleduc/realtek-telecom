import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BannerSlot } from '@/components/BannerSlot'
import { ProjectCard } from '@/components/cards'
import { Gallery } from '@/components/Gallery'
import { breadcrumbJsonLd, JsonLd } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/reveal/Reveal'
import { RichText } from '@/components/RichText'
import { ShareButtons } from '@/components/ShareButtons'
import { isLocale } from '@/i18n/routing'
import { getBySlug, listProjects } from '@/lib/data'
import { loadDetail } from '@/lib/detail'
import { buildMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/projects/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const doc = await getBySlug('projects', slug, locale)
  if (!doc) return {}
  return buildMetadata({
    locale,
    path: `/projects/${slug}`,
    title: doc.title,
    description: doc.excerpt,
    image: doc.featuredImage,
    seo: doc.seo,
  })
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/projects/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [project, more, tn, tc] = await Promise.all([
    loadDetail('projects', slug, locale),
    listProjects(locale, { limit: 4 }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const related = more.docs.filter((p) => p.id !== project.id).slice(0, 3)
  const url = absoluteUrl(`/projects/${slug}`, locale)
  const facts = [
    { label: tc('client'), value: project.client },
    { label: tc('location'), value: project.location },
    { label: tc('field'), value: project.field },
    { label: tc('year'), value: project.year ? String(project.year) : null },
  ].filter((f) => f.value)

  return (
    <>
      <PageHero
        locale={locale}
        title={project.title}
        eyebrow={tn('projects')}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('projects'), href: '/projects' },
          { label: project.title },
        ]}
        image={project.featuredImage}
      />

      {facts.length ? (
        <div className="border-b border-line bg-paper">
          <dl className="container-x grid grid-cols-2 md:grid-cols-4">
            {facts.map((f, i) => (
              <Reveal
                key={f.label}
                variant="up"
                delay={i * 80}
                className={`py-7 ${i ? 'md:border-l md:border-line md:pl-8' : ''}`}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">{f.label}</dt>
                <dd className="mt-1.5 font-display text-lg font-semibold text-brand">{f.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      ) : null}

      <section className="py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          {project.excerpt ? (
            <Reveal variant="up" className="lg:col-span-4">
              <p className="font-display text-xl font-semibold leading-snug text-brand md:text-2xl">
                {project.excerpt}
              </p>
              <span aria-hidden className="mt-8 block h-px w-24 bg-accent" />
            </Reveal>
          ) : null}
          <article className={project.excerpt ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <Reveal variant="up" delay={120}>
              <RichText data={project.content} />
            </Reveal>
            <div className="mt-12 border-t border-line pt-8">
              <ShareButtons url={url} title={project.title} />
            </div>
          </article>
        </div>
      </section>

      {project.gallery?.length ? (
        <section className="pb-24">
          <div className="container-x">
            <Gallery images={project.gallery} />
          </div>
        </section>
      ) : null}

      <BannerSlot placement="projects-detail" locale={locale} className="container-x pb-20" />

      {related.length ? (
        <section className="bg-paper py-20 md:py-24">
          <div className="container-x">
            <Reveal variant="mask-x">
              <p className="eyebrow">{tc('related')}</p>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <li key={p.id}>
                  <Reveal variant="up" delay={i * 100}>
                    <ProjectCard project={p} locale={locale} />
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
          { name: tn('projects'), url: absoluteUrl('/projects', locale) },
          { name: project.title, url },
        ])}
      />
    </>
  )
}
