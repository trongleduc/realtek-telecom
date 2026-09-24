import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import type { Where } from 'payload'

import type { Locale } from '@/i18n/routing'
import type { BannerPlacement } from '@/collections/Banners'
import type { Banner, LibraryDocument, Partner, Post, Project, Service, Slider } from '@/payload-types'

import * as demo from '@/demo/provider'

import { isDemoMode } from './demoMode'
import { getPayloadClient } from './payload'
import { escapeRegex, normalizeSearch } from './text'

type Loader<T> = (draft: boolean) => Promise<T>

/**
 * In demo mode (no database) every read below is answered by src/demo/provider.ts and Payload is never initialised.
 *
 * Public reads are cached under the collection slug (or `global:<slug>`); the Payload
 * afterChange hooks in src/hooks/revalidate.ts clear those tags. Draft mode bypasses the cache.
 */
async function cached<T>(key: string[], tags: string[], load: Loader<T>): Promise<T> {
  let draft = false
  try {
    draft = (await draftMode()).isEnabled
  } catch {
    // Called outside a request (sitemap generation at build time).
  }
  if (draft) return load(true)
  return unstable_cache(() => load(false), key, { tags, revalidate: 3600 })()
}

const published: Where = { _status: { equals: 'published' } }

function publicWhere(draft: boolean, ...conditions: (Where | undefined)[]): Where {
  const all = [...(draft ? [] : [published]), ...conditions.filter(Boolean)] as Where[]
  return all.length ? { and: all } : {}
}

/* ---------- Globals ---------- */

export const getSiteSettings = (locale: Locale) =>
  isDemoMode
    ? demo.getSiteSettings(locale)
    : cached(['site-settings', locale], ['global:site-settings'], async () =>
        (await getPayloadClient()).findGlobal({ slug: 'site-settings', locale, depth: 1 }),
      )

export const getHeader = (locale: Locale) =>
  isDemoMode
    ? demo.getHeader()
    : cached(['header', locale], ['global:header'], async () =>
        (await getPayloadClient()).findGlobal({ slug: 'header', locale, depth: 0 }),
      )

export const getFooter = (locale: Locale) =>
  isDemoMode
    ? demo.getFooter()
    : cached(['footer', locale], ['global:footer'], async () =>
        (await getPayloadClient()).findGlobal({ slug: 'footer', locale, depth: 0 }),
      )

export const getHomePage = (locale: Locale) =>
  isDemoMode
    ? demo.getHomePage(locale)
    : cached(['home-page', locale], ['global:home-page', 'services', 'projects', 'media'], async (draft) =>
        (await getPayloadClient()).findGlobal({ slug: 'home-page', locale, depth: 2, draft }),
      )

export const getAboutPage = (locale: Locale) =>
  isDemoMode
    ? demo.getAboutPage(locale)
    : cached(['about-page', locale], ['global:about-page', 'media'], async () =>
        (await getPayloadClient()).findGlobal({ slug: 'about-page', locale, depth: 1 }),
      )

/* ---------- Display ---------- */

export const getSlider = (placement: string, locale: Locale) =>
  isDemoMode
    ? demo.getSlider(placement, locale)
    : cached(['slider', placement, locale], ['sliders', 'media'], async (): Promise<Slider | null> => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection: 'sliders',
          where: { placement: { equals: placement } },
          locale,
          depth: 1,
          limit: 1,
        })
        return docs[0] ?? null
      })

export async function getBanners(placement: BannerPlacement, locale: Locale): Promise<Banner[]> {
  if (isDemoMode) return demo.getBanners()
  const docs = await cached(['banners', placement, locale], ['banners', 'media'], async () => {
    const result = await (
      await getPayloadClient()
    ).find({
      collection: 'banners',
      where: { and: [{ placement: { equals: placement } }, { enabled: { equals: true } }] },
      locale,
      depth: 1,
      limit: 10,
      sort: 'order',
    })
    return result.docs
  })
  // Date window is checked per request so scheduled banners switch on/off without a cache flush.
  const now = Date.now()
  return docs.filter(
    (b) => (!b.startAt || new Date(b.startAt).getTime() <= now) && (!b.endAt || new Date(b.endAt).getTime() >= now),
  )
}

export const getPartners = () =>
  isDemoMode
    ? demo.getPartners()
    : cached(['partners'], ['partners', 'media'], async (): Promise<Partner[]> => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection: 'partners',
          where: { enabled: { equals: true } },
          depth: 1,
          limit: 40,
          sort: 'order',
        })
        return docs
      })

/* ---------- Services ---------- */

export const listServices = (locale: Locale, opts: { featuredOnly?: boolean } = {}) =>
  isDemoMode
    ? demo.listServices(locale, opts)
    : cached(['services', locale, String(!!opts.featuredOnly)], ['services', 'media'], async (draft) => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection: 'services',
          where: publicWhere(draft, opts.featuredOnly ? { featured: { equals: true } } : undefined),
          locale,
          depth: 1,
          limit: 50,
          sort: 'order',
          draft,
        })
        return docs as Service[]
      })

/* ---------- Detail lookups (shared by services, projects, posts, documents) ---------- */

type DetailCollection = 'services' | 'projects' | 'posts' | 'documents'
type DetailDoc = { services: Service; projects: Project; posts: Post; documents: LibraryDocument }

export function getBySlug<C extends DetailCollection>(collection: C, slug: string, locale: Locale) {
  if (isDemoMode) return demo.getBySlug(collection, slug, locale)
  return cached([collection, 'slug', slug, locale], [collection, 'media'], async (draft) => {
    const { docs } = await (
      await getPayloadClient()
    ).find({
      collection,
      where: publicWhere(draft, { slug: { equals: slug } }),
      locale,
      depth: 2,
      limit: 1,
      draft,
    })
    return (docs[0] as DetailDoc[C] | undefined) ?? null
  })
}

/** Finds the current slug for a document whose slug was renamed, for a 301 redirect. */
export function findRenamedSlug(collection: DetailCollection, slug: string) {
  if (isDemoMode) return demo.findRenamedSlug()
  return cached([collection, 'previous', slug], [collection], async () => {
    const { docs } = await (
      await getPayloadClient()
    ).find({
      collection,
      where: { and: [published, { previousSlugs: { in: [slug] } }] },
      depth: 0,
      limit: 1,
      select: { slug: true },
    })
    return (docs[0]?.slug as string | undefined) ?? null
  })
}

/* ---------- Projects ---------- */

export const listProjects = (locale: Locale, opts: { page?: number; limit?: number; featuredOnly?: boolean } = {}) => {
  if (isDemoMode) return demo.listProjects(locale, opts)
  const { page = 1, limit = 12, featuredOnly = false } = opts
  return cached(
    ['projects', locale, String(page), String(limit), String(featuredOnly)],
    ['projects', 'media'],
    async (draft) =>
      (await getPayloadClient()).find({
        collection: 'projects',
        where: publicWhere(draft, featuredOnly ? { featured: { equals: true } } : undefined),
        locale,
        depth: 1,
        page,
        limit,
        sort: 'order',
        draft,
      }),
  )
}

/* ---------- Posts ---------- */

export const listPosts = (
  locale: Locale,
  opts: { page?: number; limit?: number; categoryId?: string; excludeId?: string } = {},
) => {
  if (isDemoMode) return demo.listPosts(locale, opts)
  const { page = 1, limit = 9, categoryId, excludeId } = opts
  return cached(
    ['posts', locale, String(page), String(limit), categoryId ?? '', excludeId ?? ''],
    ['posts', 'post-categories', 'media'],
    async (draft) =>
      (await getPayloadClient()).find({
        collection: 'posts',
        where: publicWhere(
          draft,
          categoryId ? { category: { equals: categoryId } } : undefined,
          excludeId ? { id: { not_equals: excludeId } } : undefined,
        ),
        locale,
        depth: 1,
        page,
        limit,
        sort: '-publishedAt',
        draft,
      }),
  )
}

export const listPostCategories = (locale: Locale) =>
  isDemoMode
    ? demo.listPostCategories(locale)
    : cached(['post-categories', locale], ['post-categories'], async () => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection: 'post-categories',
          locale,
          depth: 0,
          limit: 50,
          sort: 'order',
        })
        return docs
      })

/* ---------- Documents ---------- */

export const listDocumentCategories = (locale: Locale) =>
  isDemoMode
    ? demo.listDocumentCategories(locale)
    : cached(['document-categories', locale], ['document-categories'], async () => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection: 'document-categories',
          locale,
          depth: 0,
          limit: 50,
          sort: 'order',
        })
        return docs
      })

export type DocumentSort = 'newest' | 'popular'

export async function searchDocuments(
  locale: Locale,
  opts: { q?: string; categoryId?: string; sort?: DocumentSort; page?: number; limit?: number; excludeId?: string },
) {
  if (isDemoMode) return demo.searchDocuments(locale, opts)
  const { q, categoryId, sort = 'newest', page = 1, limit = 12, excludeId } = opts
  const terms = q ? normalizeSearch(q).split(' ').filter(Boolean).slice(0, 8) : []
  const load = async (draft: boolean) =>
    (await getPayloadClient()).find({
      collection: 'documents',
      where: publicWhere(
        draft,
        categoryId ? { category: { equals: categoryId } } : undefined,
        excludeId ? { id: { not_equals: excludeId } } : undefined,
        // Every word must appear in the accent-free search text of the current locale.
        ...terms.map((term): Where => ({ searchText: { like: escapeRegex(term) } })),
      ),
      locale,
      depth: 1,
      page,
      limit,
      sort: sort === 'popular' ? '-downloadCount' : '-publishedAt',
      draft,
    })

  // Free-text queries are not cached: the key space is unbounded.
  if (terms.length) {
    const draft = await draftMode()
      .then((d) => d.isEnabled)
      .catch(() => false)
    return load(draft)
  }
  return cached(
    ['documents', locale, categoryId ?? '', sort, String(page), String(limit), excludeId ?? ''],
    ['documents', 'document-categories', 'media'],
    load,
  )
}

/* ---------- Sitemap ---------- */

export const listPublishedSlugs = (collection: DetailCollection) =>
  isDemoMode
    ? demo.listPublishedSlugs(collection)
    : cached([collection, 'sitemap'], [collection, 'sitemap'], async () => {
        const { docs } = await (
          await getPayloadClient()
        ).find({
          collection,
          where: published,
          depth: 0,
          limit: 5000,
          pagination: false,
          select: { slug: true, updatedAt: true },
        })
        return docs.map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt as string }))
      })
