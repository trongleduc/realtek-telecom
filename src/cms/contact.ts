import { isLocale } from '@/i18n/routing'
import type { ContactInput } from '@/lib/contactStore'

import { getPayloadClient } from './payload'

/**
 * Payload implementation of saveContact (src/lib/contactStore.ts): creates a `contact-submissions` document,
 * whose afterChange hook emails the addresses configured in Site settings.
 */
export async function saveContact(input: ContactInput): Promise<void> {
  const payload = await getPayloadClient()
  let serviceId: string | undefined
  let serviceTitle: string | undefined
  if (input.service) {
    const service = await payload
      .findByID({ collection: 'services', id: input.service, depth: 0, locale: 'vi', disableErrors: true })
      .catch(() => null)
    if (service) {
      serviceId = String(service.id)
      serviceTitle = service.title
    }
  }
  await payload.create({
    collection: 'contact-submissions',
    overrideAccess: true,
    data: {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || undefined,
      company: input.company || undefined,
      service: serviceId,
      serviceTitle,
      message: input.message,
      status: 'new',
      locale: isLocale(input.locale) ? input.locale : 'vi',
      sourceUrl: input.sourceUrl,
      ip: input.ip,
    },
  })
}
