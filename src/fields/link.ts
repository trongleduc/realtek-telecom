import type { Field } from 'payload'

export function linkFields({ required = false }: { required?: boolean } = {}): Field[] {
  return [
    { name: 'label', label: 'Nhãn', type: 'text', localized: true, required },
    {
      name: 'url',
      label: 'Đường dẫn',
      type: 'text',
      required,
      admin: {
        description: 'Trang nội bộ bắt đầu bằng "/" (ví dụ /services), hoặc liên kết đầy đủ https://…',
      },
    },
  ]
}
