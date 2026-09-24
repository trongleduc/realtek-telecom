import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { NextResponse } from 'next/server'

import { isAllowedDocumentUrl } from '@/lib/documentLinks'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** Counts the download, then sends the visitor to the Google Drive / OneDrive link (SRS FR-S2). */
export async function GET(_request: Request, { params }: RouteContext<'/[locale]/documents/[slug]/download'>) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'documents',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 1,
    select: { externalUrl: true },
  })
  const doc = docs[0]
  if (!doc?.externalUrl || !isAllowedDocumentUrl(doc.externalUrl)) {
    return new NextResponse('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  }

  // Atomic $inc straight on the collection; it skips hooks/versions on purpose (a counter is not an edit).
  try {
    const model = (payload.db as MongooseAdapter).collections.documents
    await model.updateOne({ _id: doc.id }, { $inc: { downloadCount: 1 } })
  } catch (error) {
    payload.logger.error({ err: error, msg: `Could not count download for ${slug}` })
  }

  return NextResponse.redirect(doc.externalUrl, {
    status: 302,
    headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
  })
}
