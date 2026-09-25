import { revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'crypto'

import config from '@payload-config'

/**
 * Clears every cached read. Used by scripts (seed, imports) that write through Payload's local API
 * outside the Next.js server, where the collection hooks cannot reach the cache.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYLOAD_SECRET ?? ''
  const given = request.headers.get('x-revalidate-secret') ?? ''
  const ok =
    secret.length > 0 && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret))
  if (!ok) return new Response('Forbidden', { status: 403 })

  const resolved = await config
  const tags = [
    ...resolved.collections.map((c) => c.slug),
    ...resolved.globals.map((g) => `global:${g.slug}`),
    'sitemap',
  ]
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  return Response.json({ revalidated: tags.length })
}
