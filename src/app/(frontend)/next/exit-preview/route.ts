import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  ;(await draftMode()).disable()
  const referer = request.headers.get('referer')
  const back = referer ? new URL(referer).pathname : '/'
  redirect(back.startsWith('/') ? back : '/')
}
