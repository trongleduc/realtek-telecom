import { getFormatter, getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import type { LibraryDocument, Post, PostCategory, DocumentCategory, Project, Service } from '@/payload-types'

import { ArrowRight, ArrowUpRight, Download, FileIcon } from './Icons'
import { Img } from './Img'

export async function PostCard({ post, locale, large = false }: { post: Post; locale: Locale; large?: boolean }) {
  const format = await getFormatter({ locale })
  const category = typeof post.category === 'object' ? (post.category as PostCategory | null) : null
  return (
    <Link href={`/news/${post.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-paper ${large ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
        <Img
          media={post.featuredImage}
          size={large ? 'wide' : 'card'}
          fill
          sizes={large ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 100vw'}
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
      </div>
      <div className="mt-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>
            {format.dateTime(new Date(post.publishedAt), { dateStyle: 'medium' })}
          </time>
        ) : null}
        {category ? (
          <>
            <span className="h-px w-5 bg-accent" />
            <span className="text-brand">{category.title}</span>
          </>
        ) : null}
      </div>
      <h3
        className={`mt-3 font-display font-semibold leading-snug text-ink transition-colors group-hover:text-brand ${
          large ? 'text-2xl md:text-[28px]' : 'text-lg'
        }`}
      >
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className={`mt-3 text-[15px] text-ink-soft ${large ? 'line-clamp-3' : 'line-clamp-2'}`}>{post.excerpt}</p>
      ) : null}
    </Link>
  )
}

export async function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const meta = [project.field, project.year].filter(Boolean).join(' · ')
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-brand-deep text-white"
    >
      <Img
        media={project.featuredImage}
        size="card"
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      {/* Fixed-height meta line and two-line title slot keep every card's text on the same baselines. */}
      <span className="absolute inset-x-0 bottom-0 p-6">
        <span className="block min-h-[1lh] text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {meta}
        </span>
        <span className="mt-2 line-clamp-2 block min-h-[2lh] font-display text-xl font-bold uppercase leading-tight tracking-[0.04em]">
          {project.title}
        </span>
        <span className="link-arrow mt-4 translate-y-3 text-[12px] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {t('viewProject')} <ArrowRight size={15} />
        </span>
      </span>
    </Link>
  )
}

export function ServiceRow({ service, index }: { service: Service; index: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group grid items-center gap-6 border-t border-line py-8 md:grid-cols-[80px_1fr_320px_48px] md:gap-10 md:py-10"
    >
      <span className="font-display text-sm font-semibold tabular-nums text-accent">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span>
        <span className="block font-display text-2xl font-bold uppercase tracking-[0.02em] text-brand md:text-3xl">
          {service.title}
        </span>
        {service.excerpt ? (
          <span className="mt-3 block max-w-xl text-[15px] text-ink-soft">{service.excerpt}</span>
        ) : null}
      </span>
      <span className="relative hidden aspect-[16/10] overflow-hidden md:block">
        <Img
          media={service.featuredImage}
          size="card"
          fill
          sizes="320px"
          className="object-cover grayscale-[40%] transition duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:grayscale-0"
        />
      </span>
      <span className="hidden h-12 w-12 place-items-center border border-line text-brand transition-colors duration-500 group-hover:border-brand group-hover:bg-brand group-hover:text-white md:grid">
        <ArrowUpRight size={18} />
      </span>
    </Link>
  )
}

export async function DocumentRow({ doc, locale }: { doc: LibraryDocument; locale: Locale }) {
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'documents' }), getFormatter({ locale })])
  const category = typeof doc.category === 'object' ? (doc.category as DocumentCategory | null) : null
  return (
    <Link
      href={`/documents/${doc.slug}`}
      className="group grid grid-cols-[48px_1fr] items-start gap-5 border-b border-line py-6 transition-colors hover:bg-paper/70 md:grid-cols-[56px_1fr_auto] md:items-center md:px-4"
    >
      <span className="grid h-12 w-12 place-items-center bg-brand-soft text-brand transition-colors duration-500 group-hover:bg-brand group-hover:text-white md:h-14 md:w-14">
        <FileIcon size={22} />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          {doc.fileFormat ? (
            <span className="text-accent">{doc.fileFormat === 'other' ? 'FILE' : doc.fileFormat.toUpperCase()}</span>
          ) : null}
          {category ? <span>{category.title}</span> : null}
          {doc.publishedAt ? (
            <time dateTime={doc.publishedAt}>
              {format.dateTime(new Date(doc.publishedAt), { dateStyle: 'medium' })}
            </time>
          ) : null}
        </span>
        <span className="mt-1.5 block font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {doc.title}
        </span>
        {doc.summary ? (
          <span className="mt-1 line-clamp-2 block text-[14.5px] text-ink-soft">{doc.summary}</span>
        ) : null}
      </span>
      <span className="col-start-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand md:col-start-auto">
        <Download size={16} />
        {t('downloads', { count: doc.downloadCount ?? 0 })}
      </span>
    </Link>
  )
}
