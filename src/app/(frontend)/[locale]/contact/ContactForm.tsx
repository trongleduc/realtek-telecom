'use client'

import Script from 'next/script'
import { useLocale, useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef } from 'react'

import { ArrowRight } from '@/components/Icons'

import { submitContact, type ContactField, type ContactState } from './actions'

type Props = { services: { id: string; title: string }[] }

const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function ContactForm({ services }: Props) {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
    if (state.status !== 'idle') statusRef.current?.focus()
  }, [state])

  const labels: Record<ContactField, string> = {
    fullName: t('fullName'),
    phone: t('phone'),
    email: t('email'),
    message: t('message'),
  }
  const errorFor = (field: ContactField) => {
    const code = state.errors?.[field]
    if (!code) return null
    return code === 'required' ? t('required', { field: labels[field].toLowerCase() }) : t(code)
  }
  const v = (key: string) => state.values?.[key] ?? ''

  const input =
    'peer w-full border-0 border-b border-line bg-transparent pb-3 pt-6 text-[16px] outline-none transition-colors focus:border-brand aria-[invalid=true]:border-red-600'
  const label =
    'pointer-events-none absolute left-0 top-6 origin-left text-[15px] text-ink-soft transition-all duration-300 peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.16em] peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.16em]'

  const field = (name: ContactField | 'company', required = false, type = 'text') => {
    const error = name === 'company' ? null : errorFor(name)
    return (
      <div className="relative">
        <input
          id={`c-${name}`}
          name={name}
          type={type}
          required={required}
          defaultValue={v(name)}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `c-${name}-err` : undefined}
          autoComplete={
            name === 'fullName' ? 'name' : name === 'phone' ? 'tel' : name === 'email' ? 'email' : 'organization'
          }
          className={input}
        />
        <label htmlFor={`c-${name}`} className={label}>
          {name === 'company' ? t('company') : labels[name]}
          {required ? ' *' : ''}
        </label>
        {error ? (
          <p id={`c-${name}-err`} className="mt-2 text-[13px] text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  const messageError = errorFor('message')

  return (
    <form ref={formRef} action={action} noValidate className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot field, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {field('fullName', true)}
        {field('phone', true, 'tel')}
        {field('email', false, 'email')}
        {field('company')}
      </div>

      {services.length ? (
        <div>
          <label htmlFor="c-service" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {t('service')}
          </label>
          <select
            id="c-service"
            name="service"
            defaultValue={v('service')}
            className="mt-2 w-full border-0 border-b border-line bg-transparent py-3 text-[16px] outline-none focus:border-brand"
          >
            <option value="">{t('servicePlaceholder')}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="relative">
        <textarea
          id="c-message"
          name="message"
          rows={5}
          required
          defaultValue={v('message')}
          placeholder=" "
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? 'c-message-err' : undefined}
          className={`${input} resize-y`}
        />
        <label htmlFor="c-message" className={label}>
          {labels.message} *
        </label>
        {messageError ? (
          <p id="c-message-err" className="mt-2 text-[13px] text-red-600">
            {messageError}
          </p>
        ) : null}
      </div>

      {turnstileKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div
            className="cf-turnstile"
            data-sitekey={turnstileKey}
            data-language={locale === 'zh' ? 'zh-cn' : locale}
          />
        </>
      ) : null}

      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {state.status === 'success' ? (
          <p className="border-l-2 border-accent bg-accent-soft px-5 py-4 text-[15px] text-ink">{t('success')}</p>
        ) : state.message ? (
          <p className="border-l-2 border-red-600 bg-red-50 px-5 py-4 text-[15px] text-red-700">{t(state.message)}</p>
        ) : null}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary disabled:cursor-wait disabled:opacity-70">
        {pending ? t('sending') : t('submit')} <ArrowRight size={16} />
      </button>
    </form>
  )
}
