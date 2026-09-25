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

/** Saves a contact-form submission to Payload, whose hook emails staff (see src/cms/contact.ts). */
export { saveContact } from '@/cms/contact'
