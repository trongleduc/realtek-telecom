import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { isDemoMode } from '@/lib/demoMode'
import { getPayloadClient } from '@/lib/payload'

/** Admin "Preview" target: only logged-in staff may turn on draft mode. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })

  if (isDemoMode) return new Response('Not available in demo mode', { status: 404 })
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Bạn cần đăng nhập trang quản trị để xem bản nháp.', { status: 403 })

  ;(await draftMode()).enable()
  redirect(path)
}
