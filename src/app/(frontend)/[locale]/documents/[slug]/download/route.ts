import { NextResponse } from 'next/server'

import { isAllowedDocumentUrl } from '@/lib/documentLinks'
import { resolveDownload } from '@/lib/downloads'

export const dynamic = 'force-dynamic'

/** Sends the visitor to the Google Drive / OneDrive link of a document (SRS FR-S2). */
export async function GET(_request: Request, { params }: RouteContext<'/[locale]/documents/[slug]/download'>) {
  const { slug } = await params
  const url = await resolveDownload(slug)
  if (!url || !isAllowedDocumentUrl(url)) {
    return new NextResponse('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  }
  return NextResponse.redirect(url, {
    status: 302,
    headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
  })
}
