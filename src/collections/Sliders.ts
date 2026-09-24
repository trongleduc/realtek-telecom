import type { CollectionConfig } from 'payload'

import { anyone, hiddenForContributor, isAdminOrEditor } from '@/access'
import { linkFields } from '@/fields/link'
import { revalidateCollection } from '@/hooks/revalidate'

export const pagePlacements = [
  { label: 'Trang chủ', value: 'home' },
  { label: 'Giới thiệu', value: 'about' },
  { label: 'Dịch vụ', value: 'services' },
  { label: 'Dự án', value: 'projects' },
  { label: 'Tin tức', value: 'news' },
  { label: 'Tài liệu', value: 'documents' },
  { label: 'Liên hệ', value: 'contact' },
]

export const Sliders: CollectionConfig = {
  slug: 'sliders',
  labels: { singular: 'Trình chiếu ảnh', plural: 'Trình chiếu ảnh' },
  admin: {
    useAsTitle: 'name',
    group: 'Hiển thị',
    defaultColumns: ['name', 'placement', 'updatedAt'],
    hidden: hiddenForContributor,
    description: 'Mỗi trang có một khối trình chiếu. Kéo thả để đổi thứ tự ảnh.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', label: 'Tên', type: 'text', required: true },
    {
      name: 'placement',
      label: 'Hiển thị tại trang',
      type: 'select',
      required: true,
      unique: true,
      options: pagePlacements,
    },
    {
      type: 'row',
      fields: [
        { name: 'autoplay', label: 'Tự chạy', type: 'checkbox', defaultValue: true },
        {
          name: 'interval',
          label: 'Thời gian mỗi ảnh (giây)',
          type: 'number',
          defaultValue: 6,
          min: 3,
          max: 20,
        },
      ],
    },
    {
      name: 'slides',
      label: 'Danh sách ảnh',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Ảnh', plural: 'Ảnh' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enabled', label: 'Hiển thị', type: 'checkbox', defaultValue: true },
            {
              name: 'type',
              label: 'Loại',
              type: 'radio',
              defaultValue: 'image',
              options: [
                { label: 'Ảnh', value: 'image' },
                { label: 'Video', value: 'video' },
              ],
            },
          ],
        },
        {
          name: 'image',
          label: 'Ảnh (máy tính)',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Với slide video, ảnh này là ảnh chờ khi video đang tải.' },
        },
        { name: 'mobileImage', label: 'Ảnh (điện thoại)', type: 'upload', relationTo: 'media' },
        {
          name: 'video',
          label: 'Video (mp4/webm)',
          type: 'upload',
          relationTo: 'media',
          admin: { condition: (_, sibling) => sibling?.type === 'video' },
        },
        { name: 'eyebrow', label: 'Dòng nhỏ phía trên', type: 'text', localized: true },
        { name: 'heading', label: 'Tiêu đề', type: 'text', localized: true },
        { name: 'text', label: 'Mô tả', type: 'textarea', localized: true },
        { name: 'button', label: 'Nút', type: 'group', fields: linkFields() },
      ],
    },
  ],
  hooks: revalidateCollection(),
}
