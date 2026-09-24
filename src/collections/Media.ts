import type { CollectionConfig } from 'payload'

import { anyone, isStaff, ownOrEditor } from '@/access'
import { auditFields, stampAudit } from '@/fields/audit'
import { revalidateCollection } from '@/hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Hình ảnh / tệp', plural: 'Thư viện ảnh' },
  admin: {
    group: 'Nội dung',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isStaff,
    update: ownOrEditor,
    delete: ownOrEditor,
  },
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 900, height: 1100, position: 'centre' },
      { name: 'wide', width: 1600 },
      { name: 'hero', width: 2400 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      label: 'Mô tả ảnh (alt)',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Mô tả ngắn nội dung ảnh, dùng cho SEO và người khiếm thị.' },
    },
    { name: 'caption', label: 'Chú thích', type: 'text', localized: true },
    ...auditFields,
  ],
  hooks: {
    beforeChange: [stampAudit],
    ...revalidateCollection(),
  },
}
