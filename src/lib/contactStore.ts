export type ContactInput = {
  fullName: string
  phone: string
  email?: string
  company?: string
  /** Service id selected in the form, if any. */
  service?: string
  message: string
  locale: string
  sourceUrl?: string
  ip: string
}

/**
 * Stores a contact-form submission. The CMS is currently switched off, so submissions are only logged;
 * src/cms/contact.ts saves them to Payload (and emails staff) once the CMS is re-enabled.
 */
export async function saveContact(input: ContactInput): Promise<void> {
  console.info('Contact form (CMS disabled, not stored):', input.fullName, input.phone)
}
