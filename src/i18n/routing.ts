import { defineRouting } from 'next-intl/routing'

export const locales = ['vi', 'en', 'zh'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'vi'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
})

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
