import type { CollectionConfig } from 'payload'

import { hiddenForContributor, isAdminOrEditor, publishedOrStaff } from '@/access'
import { auditFields, stampAudit } from '@/fields/audit'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { previewUrl } from '@/lib/preview'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Dự án', plural: 'Dự án – năng lực' },
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'client', 'year', 'featured', '_status', 'updatedAt'],
    hidden: hiddenForContributor,
    preview: (doc, { locale }) => previewUrl(`/projects/${doc.slug}`, locale),
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'title', label: 'Tên dự án', type: 'text', localized: true, required: true },
            { name: 'excerpt', label: 'Tóm tắt', type: 'textarea', localized: true },
            {
              type: 'row',
              fields: [
                { name: 'client', label: 'Khách hàng', type: 'text', localized: true },
                { name: 'location', label: 'Địa điểm', type: 'text', localized: true },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'field', label: 'Lĩnh vực', type: 'text', localized: true },
                { name: 'year', label: 'Năm thực hiện', type: 'number', min: 1990, max: 2100 },
              ],
            },
            { name: 'content', label: 'Nội dung chi tiết', type: 'richText', localized: true },
          ],
        },
        {
          label: 'Hình ảnh',
          fields: [
            { name: 'featuredImage', label: 'Ảnh đại diện', type: 'upload', relationTo: 'media', required: true },
            { name: 'gallery', label: 'Bộ sưu tập ảnh', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    ...slugField(),
    {
      name: 'featured',
      label: 'Hiện ở trang chủ',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    ...auditFields,
  ],
  hooks: {
    beforeChange: [stampAudit],
    ...revalidateCollection(),
  },
}
