import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProjectCard } from '@/components/cards'
import { PageHero } from '@/components/PageHero'
import { Pagination } from '@/components/Pagination'
import { Reveal } from '@/components/reveal/Reveal'
import { isLocale } from '@/i18n/routing'
import { listProjects } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

// Reads searchParams (page / filters). Pages under [locale] are not prerendered, so Next cannot infer this;
// without it the first request is treated as static and fails with DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic'

const parsePage = (value: unknown) => Math.max(1, Number.parseInt(String(value ?? '1'), 10) || 1)

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/projects'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = parsePage((await searchParams).page)
  const [t, th] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'home' }),
  ])
  return buildMetadata({
    locale,
    path: '/projects',
    title: page > 1 ? `${th('projectsTitle')} – ${page}` : t('projects'),
  })
}

export default async function ProjectsPage({ params, searchParams }: PageProps<'/[locale]/projects'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const page = parsePage((await searchParams).page)
  const [result, tn, th, tc] = await Promise.all([
    listProjects(locale, { page, limit: 12 }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
  ])
  if (page > 1 && !result.docs.length) notFound()

  return (
    <>
      <PageHero
        locale={locale}
        title={th('projectsTitle')}
        eyebrow={tn('projects')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('projects') }]}
        placement="projects"
        image={result.docs[0]?.featuredImage}
      />
      <section className="py-20 md:py-28">
        <div className="container-x">
          {result.docs.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.docs.map((project, i) => (
                <li key={project.id}>
                  <Reveal variant={i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'up'} delay={(i % 3) * 90}>
                    <ProjectCard project={project} locale={locale} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">{tc('empty')}</p>
          )}
          <Pagination locale={locale} page={page} totalPages={result.totalPages} pathname="/projects" />
        </div>
      </section>
    </>
  )
}
