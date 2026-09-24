import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

function safeRevalidate(tags: string[]) {
  for (const tag of tags) {
    try {
      // Editors expect their change on the very next page load, so stale content is never served.
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Outside a Next.js request (seed/CLI scripts) there is no cache to invalidate.
    }
  }
}

/** Every public read in src/lib/data.ts is cached under its collection slug, so one tag clears list and detail pages. */
export function revalidateCollection(...extraTags: string[]) {
  const afterChange: CollectionAfterChangeHook = ({ collection, req: { context } }) => {
    if (!context.disableRevalidate) safeRevalidate([collection.slug, 'sitemap', ...extraTags])
  }
  const afterDelete: CollectionAfterDeleteHook = ({ collection, req: { context } }) => {
    if (!context.disableRevalidate) safeRevalidate([collection.slug, 'sitemap', ...extraTags])
  }
  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ global, req: { context } }) => {
  if (!context.disableRevalidate) safeRevalidate([`global:${global.slug}`])
}
