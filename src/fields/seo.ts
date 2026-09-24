import type { Field } from 'payload'

export const seoField: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  admin: {
    description: 'Để trống thì hệ thống dùng tiêu đề, tóm tắt và ảnh đại diện.',
  },
  fields: [
    { name: 'metaTitle', label: 'Tiêu đề SEO', type: 'text', localized: true, maxLength: 70 },
    {
      name: 'metaDescription',
      label: 'Mô tả SEO',
      type: 'textarea',
      localized: true,
      maxLength: 170,
    },
    { name: 'ogImage', label: 'Ảnh chia sẻ mạng xã hội', type: 'upload', relationTo: 'media' },
  ],
}
