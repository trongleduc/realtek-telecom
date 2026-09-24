import { notFound, permanentRedirect } from 'next/navigation'

import type { Locale } from '@/i18n/routing'

import { findRenamedSlug, getBySlug } from './data'
import { localizedPath } from './site'

const basePaths = { services: '/services', projects: '/projects', posts: '/news', documents: '/documents' } as const

/** Loads a published document by slug; an old (renamed) slug gets a 301 to the current one, anything else a 404. */
export async function loadDetail<C extends keyof typeof basePaths>(collection: C, slug: string, locale: Locale) {
  const doc = await getBySlug(collection, slug, locale)
  if (doc) return doc
  const renamed = await findRenamedSlug(collection, slug)
  if (renamed) permanentRedirect(localizedPath(`${basePaths[collection]}/${renamed}`, locale))
  notFound()
}
