'use server'

import { headers } from 'next/headers'

import { isLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rateLimit'

export type ContactField = 'fullName' | 'phone' | 'email' | 'message'
export type ContactState = {
  status: 'idle' | 'success' | 'error'
  errors?: Partial<Record<ContactField, 'required' | 'invalidPhone' | 'invalidEmail'>>
  message?: 'tooMany' | 'captcha' | 'error'
  values?: Record<string, string>
}

const PHONE = /^\+?[\d\s.()-]{8,20}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch {
    return false
  }
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (key: string, max = 200) =>
    String(formData.get(key) ?? '')
      .trim()
      .slice(0, max)
  const values = {
    fullName: get('fullName', 120),
    phone: get('phone', 30),
    email: get('email', 160),
    company: get('company', 160),
    service: get('service', 40),
    message: get('message', 4000),
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
  if (get('website')) return { status: 'success' }

  const errors: ContactState['errors'] = {}
  if (!values.fullName) errors.fullName = 'required'
  if (!values.phone) errors.phone = 'required'
  else if (!PHONE.test(values.phone)) errors.phone = 'invalidPhone'
  if (values.email && !EMAIL.test(values.email)) errors.email = 'invalidEmail'
  if (!values.message) errors.message = 'required'
  if (Object.keys(errors).length) return { status: 'error', errors, values }

  const h = await headers()
  const ip = (
    h.get('cf-connecting-ip') ||
    h.get('x-forwarded-for')?.split(',')[0] ||
    h.get('x-real-ip') ||
    'unknown'
  ).trim()
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) return { status: 'error', message: 'tooMany', values }
  if (!(await verifyTurnstile(get('cf-turnstile-response', 4000), ip)))
    return { status: 'error', message: 'captcha', values }

  const locale = get('locale', 5)
  try {
    const payload = await getPayloadClient()
    let serviceId: string | undefined
    let serviceTitle: string | undefined
    if (values.service) {
      const service = await payload
        .findByID({ collection: 'services', id: values.service, depth: 0, locale: 'vi', disableErrors: true })
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
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        company: values.company || undefined,
        service: serviceId,
        serviceTitle,
        message: values.message,
        status: 'new',
        locale: isLocale(locale) ? locale : 'vi',
        sourceUrl: h.get('referer')?.slice(0, 500) || undefined,
        ip,
      },
    })
    return { status: 'success' }
  } catch (error) {
    console.error('Contact form submission failed', error)
    return { status: 'error', message: 'error', values }
  }
}
