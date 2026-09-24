import type { MongooseAdapter } from '@payloadcms/db-mongodb'

import { getPayloadClient } from './payload'

/**
 * Payload implementation of the download lookup (src/lib/downloads.ts): finds the published document's link and
 * atomically increments `downloadCount` straight on the collection (skipping hooks/versions: a counter is not an edit).
 */
export async function resolveDownload(slug: string): Promise<string | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'documents',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 1,
    select: { externalUrl: true },
  })
  const doc = docs[0]
  if (!doc?.externalUrl) return null
  try {
    const model = (payload.db as MongooseAdapter).collections.documents
    await model.updateOne({ _id: doc.id }, { $inc: { downloadCount: 1 } })
  } catch (error) {
    payload.logger.error({ err: error, msg: `Could not count download for ${slug}` })
  }
  return doc.externalUrl
}
