/**
 * The site's data reads (re-exported by src/lib/data.ts), built from src/demo/content.ts.
 * Signatures match the Payload implementation in src/cms/data.ts so the two are interchangeable.
 * Documents are shaped like Payload's (generated types), so pages and components need no changes.
 * Photos are served straight from Unsplash at the same sizes Payload would generate.
 */
import type { PaginatedDocs } from 'payload'

import type { BannerPlacement } from '@/collections/Banners'
import type { Locale } from '@/i18n/routing'
import { normalizeSearch } from '@/lib/text'
import type {
  AboutPage,
  Banner,
  DocumentCategory,
  Footer,
  Header,
  HomePage,
  LibraryDocument,
  Media,
  Partner,
  Post,
  PostCategory,
  Project,
  Service,
  SiteSetting,
  Slider,
} from '@/payload-types'

import * as content from './content'

const loadedAt = Date.now()
const isoDaysAgo = (days: number) => new Date(loadedAt - days * 24 * 3600 * 1000).toISOString()
const stamp = isoDaysAgo(0)

/* ---------- Media ---------- */

const sizes = { thumbnail: [480, 320], card: [900, 1100], wide: [1600, 1067], hero: [2400, 1600] } as const

function unsplash(id: string, width: number, height: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces,center&q=75&w=${width}&h=${height}`
}

function photoMedia(key: content.PhotoKey, locale: Locale): Media {
  const id = content.photos[key]
  const size = (name: keyof typeof sizes) => ({
    url: unsplash(id, sizes[name][0], sizes[name][1]),
    width: sizes[name][0],
    height: sizes[name][1],
    mimeType: 'image/jpeg',
    filename: `${key}-${name}.jpg`,
  })
  return {
    id: `photo-${key}`,
    alt: content.photoAlts[key][locale],
    url: unsplash(id, 2400, 1600),
    width: 2400,
    height: 1600,
    mimeType: 'image/jpeg',
    filename: `${key}.jpg`,
    sizes: { thumbnail: size('thumbnail'), card: size('card'), wide: size('wide'), hero: size('hero') },
    createdAt: stamp,
    updatedAt: stamp,
  }
}

const loc = <T>(value: unknown, locale: Locale) =>
  content.localize(value, locale, (key) => photoMedia(key, locale)) as T

/* ---------- Collections ---------- */

function postCategoriesFor(locale: Locale): PostCategory[] {
  return content.postCategories.map((c, i) => ({
    id: `post-cat-${c.slug}`,
    slug: c.slug,
    title: c.title[locale],
    order: i + 1,
    createdAt: stamp,
    updatedAt: stamp,
  }))
}

function documentCategoriesFor(locale: Locale): DocumentCategory[] {
  return content.documentCategories.map((c, i) => ({
    id: `doc-cat-${c.slug}`,
    slug: c.slug,
    title: c.title[locale],
    order: i + 1,
    createdAt: stamp,
    updatedAt: stamp,
  }))
}

const published = { _status: 'published' as const, createdAt: stamp, updatedAt: stamp }

function servicesFor(locale: Locale): Service[] {
  return content.services.map((s) => ({ id: `service-${s.slug}`, ...loc<object>(s, locale), ...published }) as Service)
}

function projectsFor(locale: Locale): Project[] {
  return content.projects.map((p) => ({ id: `project-${p.slug}`, ...loc<object>(p, locale), ...published }) as Project)
}

function postsFor(locale: Locale): Post[] {
  const categories = postCategoriesFor(locale)
  return content.posts.map(
    ({ daysAgo, category, ...p }) =>
      ({
        id: `post-${p.slug}`,
        ...loc<object>(p, locale),
        category: categories.find((c) => c.slug === category) ?? null,
        publishedAt: isoDaysAgo(daysAgo),
        ...published,
      }) as Post,
  )
}

function documentsFor(locale: Locale): LibraryDocument[] {
  const categories = documentCategoriesFor(locale)
  return content.documents.map(
    ({ daysAgo, category, ...d }) =>
      ({
        id: `document-${d.slug}`,
        ...loc<object>(d, locale),
        category: categories.find((c) => c.slug === category) ?? null,
        publishedAt: isoDaysAgo(daysAgo),
        searchText: normalizeSearch([d.title[locale], d.summary[locale], d.keywords[locale]].join(' ')),
        ...published,
      }) as LibraryDocument,
  )
}

function paginate<T>(all: T[], page = 1, limit = 10): PaginatedDocs<T> {
  const totalDocs = all.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
  const current = Math.min(Math.max(1, page), totalPages)
  return {
    docs: all.slice((current - 1) * limit, current * limit),
    totalDocs,
    limit,
    totalPages,
    page: current,
    pagingCounter: (current - 1) * limit + 1,
    hasPrevPage: current > 1,
    hasNextPage: current < totalPages,
    prevPage: current > 1 ? current - 1 : null,
    nextPage: current < totalPages ? current + 1 : null,
  }
}

/* ---------- Public API (mirrors src/lib/data.ts) ---------- */

export const getSiteSettings = async (locale: Locale) =>
  ({ id: 'site-settings', ...loc<object>(content.siteSettings, locale), notifyEmails: [] }) as unknown as SiteSetting

export const getHeader: (locale: Locale) => Promise<Header> = async () => ({ id: 'header', navItems: [] })

export const getFooter: (locale: Locale) => Promise<Footer> = async () => ({ id: 'footer', links: [] })

export const getHomePage = async (locale: Locale) =>
  ({ id: 'home-page', ...loc<object>(content.homePage, locale), services: [], projects: [] }) as unknown as HomePage

export const getAboutPage = async (locale: Locale) =>
  ({ id: 'about-page', ...loc<object>(content.aboutPage, locale) }) as unknown as AboutPage

export async function getSlider(placement: string, locale: Locale): Promise<Slider | null> {
  const slider = content.sliders.find((s) => s.placement === placement)
  if (!slider) return null
  return {
    id: `slider-${placement}`,
    name: slider.name,
    placement: slider.placement,
    autoplay: true,
    interval: 7,
    slides: slider.slides.map((slide, i) => ({
      id: `slide-${placement}-${i}`,
      enabled: true,
      type: 'image' as const,
      ...loc<object>(slide, locale),
    })) as Slider['slides'],
    createdAt: stamp,
    updatedAt: stamp,
  }
}

export const getBanners: (placement: BannerPlacement, locale: Locale) => Promise<Banner[]> = async () => []

export async function getPartners(): Promise<Partner[]> {
  return content.partners.map((name, i) => ({
    id: `partner-${i}`,
    name,
    order: i,
    enabled: true,
    logo: {
      id: `partner-logo-${i}`,
      alt: name,
      url: content.partnerLogoPath(name),
      width: 520,
      height: 140,
      mimeType: 'image/svg+xml',
      filename: `${name.toLowerCase()}.svg`,
      createdAt: stamp,
      updatedAt: stamp,
    },
    createdAt: stamp,
    updatedAt: stamp,
  }))
}

export async function listServices(locale: Locale, opts: { featuredOnly?: boolean } = {}) {
  return servicesFor(locale).filter((s) => !opts.featuredOnly || s.featured)
}

type DetailCollection = 'services' | 'projects' | 'posts' | 'documents'
type DetailDoc = { services: Service; projects: Project; posts: Post; documents: LibraryDocument }

const detailSources: { [C in DetailCollection]: (locale: Locale) => DetailDoc[C][] } = {
  services: servicesFor,
  projects: projectsFor,
  posts: postsFor,
  documents: documentsFor,
}

export async function getBySlug<C extends DetailCollection>(collection: C, slug: string, locale: Locale) {
  return (detailSources[collection](locale) as DetailDoc[C][]).find((d) => d.slug === slug) ?? null
}

export const findRenamedSlug: (collection: DetailCollection, slug: string) => Promise<string | null> = async () => null

export async function listProjects(
  locale: Locale,
  opts: { page?: number; limit?: number; featuredOnly?: boolean } = {},
) {
  const all = projectsFor(locale).filter((p) => !opts.featuredOnly || p.featured)
  return paginate(all, opts.page ?? 1, opts.limit ?? 12)
}

export async function listPosts(
  locale: Locale,
  opts: { page?: number; limit?: number; categoryId?: string; excludeId?: string } = {},
) {
  const all = postsFor(locale)
    .filter((p) => !opts.categoryId || (typeof p.category === 'object' && p.category?.id === opts.categoryId))
    .filter((p) => p.id !== opts.excludeId)
  return paginate(all, opts.page ?? 1, opts.limit ?? 9)
}

export const listPostCategories = async (locale: Locale) => postCategoriesFor(locale)

export const listDocumentCategories = async (locale: Locale) => documentCategoriesFor(locale)

export type DocumentSort = 'newest' | 'popular'

export async function searchDocuments(
  locale: Locale,
  opts: {
    q?: string
    categoryId?: string
    sort?: DocumentSort
    page?: number
    limit?: number
    excludeId?: string
  },
) {
  const terms = opts.q ? normalizeSearch(opts.q).split(' ').filter(Boolean).slice(0, 8) : []
  const all = documentsFor(locale)
    .filter((d) => !opts.categoryId || (typeof d.category === 'object' && d.category?.id === opts.categoryId))
    .filter((d) => d.id !== opts.excludeId)
    .filter((d) => terms.every((term) => d.searchText?.includes(term)))
    .sort((a, b) =>
      opts.sort === 'popular'
        ? (b.downloadCount ?? 0) - (a.downloadCount ?? 0)
        : String(b.publishedAt).localeCompare(String(a.publishedAt)),
    )
  return paginate(all, opts.page ?? 1, opts.limit ?? 12)
}

export async function listPublishedSlugs(collection: DetailCollection) {
  return detailSources[collection]('vi').map((d) => ({ slug: d.slug, updatedAt: d.updatedAt }))
}
