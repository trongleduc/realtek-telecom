import type { MetadataRoute } from 'next'

import { listPublishedSlugs } from '@/lib/data'
import { languageAlternates } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

const staticPaths = ['/', '/about', '/services', '/projects', '/news', '/documents', '/contact']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entry = (path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path, 'vi'),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    priority,
    alternates: { languages: languageAlternates(path) },
  })

  const [services, projects, posts, documents] = await Promise.all([
    listPublishedSlugs('services'),
    listPublishedSlugs('projects'),
    listPublishedSlugs('posts'),
    listPublishedSlugs('documents'),
  ])

  return [
    ...staticPaths.map((p) => entry(p, undefined, p === '/' ? 1 : 0.8)),
    ...services.map((d) => entry(`/services/${d.slug}`, d.updatedAt, 0.8)),
    ...projects.map((d) => entry(`/projects/${d.slug}`, d.updatedAt)),
    ...posts.map((d) => entry(`/news/${d.slug}`, d.updatedAt, 0.6)),
    ...documents.map((d) => entry(`/documents/${d.slug}`, d.updatedAt, 0.6)),
  ]
}
