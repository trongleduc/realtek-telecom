import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdminOrEditor, isStaff, ownOrEditor, publishedOrStaff } from '@/access'
import { auditFields, stampAudit } from '@/fields/audit'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { preventContributorPublish } from '@/hooks/preventContributorPublish'
import { revalidateCollection } from '@/hooks/revalidate'
import { isAllowedDocumentUrl } from '@/lib/documentLinks'
import { previewUrl } from '@/lib/preview'
import { normalizeSearch } from '@/lib/text'

/** searchText is localized, so each locale stores its own accent-free copy of title + summary + keywords. */
const buildSearchText: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const pick = (key: string) => (data[key] ?? originalDoc?.[key] ?? '') as string
  data.searchText = normalizeSearch([pick('title'), pick('summary'), pick('keywords')].join(' '))
  return data
}

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Tài liệu', plural: 'Tài liệu' },
  // Avoid clashing with the DOM's global `Document` type in generated types.
  typescript: { interface: 'LibraryDocument' },
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'category', 'provider', 'downloadCount', '_status', 'createdBy'],
    preview: (doc, { locale }) => previewUrl(`/documents/${doc.slug}`, locale),
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
          label: 'Giới thiệu',
          fields: [
            { name: 'title', label: 'Tên tài liệu', type: 'text', localized: true, required: true },
            { name: 'summary', label: 'Tóm tắt', type: 'textarea', localized: true, required: true },
            { name: 'coverImage', label: 'Ảnh bìa', type: 'upload', relationTo: 'media' },
            { name: 'content', label: 'Mô tả chi tiết', type: 'richText', localized: true },
            {
              name: 'keywords',
              label: 'Từ khoá tìm kiếm',
              type: 'text',
              localized: true,
              admin: { description: 'Các từ khoá cách nhau bằng dấu phẩy, giúp khách tìm thấy tài liệu.' },
            },
          ],
        },
        {
          label: 'Tệp tải về',
          fields: [
            {
              name: 'provider',
              label: 'Nơi lưu trữ',
              type: 'select',
              required: true,
              defaultValue: 'gdrive',
              options: [
                { label: 'Google Drive', value: 'gdrive' },
                { label: 'OneDrive', value: 'onedrive' },
              ],
            },
            {
              name: 'externalUrl',
              label: 'Đường dẫn tải tài liệu',
              type: 'text',
              required: true,
              admin: {
                description:
                  'Link chia sẻ công khai trên Google Drive hoặc OneDrive (https://drive.google.com/…, https://1drv.ms/…).',
              },
              validate: (value: unknown) =>
                typeof value === 'string' && isAllowedDocumentUrl(value)
                  ? true
                  : 'Chỉ chấp nhận link https từ Google Drive, OneDrive hoặc SharePoint.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fileFormat',
                  label: 'Định dạng',
                  type: 'select',
                  defaultValue: 'pdf',
                  options: ['pdf', 'docx', 'xlsx', 'pptx', 'dwg', 'zip', 'other'].map((v) => ({
                    label: v === 'other' ? 'Khác' : v.toUpperCase(),
                    value: v,
                  })),
                },
                { name: 'fileSize', label: 'Dung lượng', type: 'text', admin: { placeholder: '2.4 MB' } },
                { name: 'pageCount', label: 'Số trang', type: 'number', min: 1 },
              ],
            },
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
      relationTo: 'document-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Ngày đăng',
      type: 'date',
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'downloadCount',
      label: 'Lượt tải',
      type: 'number',
      defaultValue: 0,
      index: true,
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'searchText',
      type: 'text',
      localized: true,
      index: true,
      admin: { hidden: true },
    },
    ...auditFields,
  ],
  hooks: {
    beforeChange: [stampAudit, preventContributorPublish, buildSearchText],
    ...revalidateCollection(),
  },
}
