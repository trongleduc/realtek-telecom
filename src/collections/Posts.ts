import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isStaff, ownOrEditor, publishedOrStaff } from '@/access'
import { auditFields, stampAudit } from '@/fields/audit'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { preventContributorPublish } from '@/hooks/preventContributorPublish'
import { revalidateCollection } from '@/hooks/revalidate'
import { previewUrl } from '@/lib/preview'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Bài viết', plural: 'Tin tức' },
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'category', 'publishedAt', '_status', 'createdBy'],
    preview: (doc, { locale }) => previewUrl(`/news/${doc.slug}`, locale),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: ownOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          fields: [
            { name: 'title', label: 'Tiêu đề', type: 'text', localized: true, required: true },
            { name: 'excerpt', label: 'Tóm tắt', type: 'textarea', localized: true },
            { name: 'featuredImage', label: 'Ảnh đại diện', type: 'upload', relationTo: 'media', required: true },
            { name: 'content', label: 'Nội dung', type: 'richText', localized: true },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    ...slugField(),
    {
      name: 'category',
      label: 'Danh mục',
      type: 'relationship',
      relationTo: 'post-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Ngày đăng',
      type: 'date',
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    ...auditFields,
  ],
  hooks: {
    beforeChange: [stampAudit, preventContributorPublish],
    ...revalidateCollection(),
  },
}
