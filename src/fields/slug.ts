import type { Field, FieldHook } from 'payload'

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const trackPreviousSlug: FieldHook = ({ value, originalDoc, siblingData }) => {
  const previous = originalDoc?.slug as string | undefined
  if (previous && value && previous !== value && originalDoc?._status === 'published') {
    const list = new Set<string>((originalDoc?.previousSlugs as string[] | undefined) ?? [])
    list.add(previous)
    list.delete(value)
    siblingData.previousSlugs = [...list]
  }
  return value
}

/**
 * English-only slug shared by every locale. It is never generated from the Vietnamese title:
 * editors must type it, so URLs stay English as required by the SRS.
 */
export function slugField({ trackHistory = true }: { trackHistory?: boolean } = {}): Field[] {
  const fields: Field[] = [
    {
      name: 'slug',
      label: 'Đường dẫn (slug)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 100,
      admin: {
        position: 'sidebar',
        description: 'Tiếng Anh, chữ thường, không dấu, nối bằng dấu gạch ngang. Ví dụ: fiber-optic-installation',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) return 'Vui lòng nhập đường dẫn.'
        if (!SLUG_PATTERN.test(value))
          return 'Đường dẫn chỉ gồm chữ thường a-z, số 0-9 và dấu gạch ngang, không dấu, không khoảng trắng.'
        return true
      },
      hooks: trackHistory ? { beforeChange: [trackPreviousSlug] } : undefined,
    },
  ]

  if (trackHistory) {
    fields.push({
      name: 'previousSlugs',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { hidden: true },
    })
  }

  return fields
}
