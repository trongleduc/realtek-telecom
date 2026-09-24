import type { CollectionConfig } from 'payload'

import { anyone, hiddenForContributor, isAdminOrEditor } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

export const bannerPlacements = [
  { label: 'Trang chủ — giữa trang', value: 'home-middle' },
  { label: 'Trang chủ — trước chân trang', value: 'home-bottom' },
  { label: 'Dịch vụ — cuối trang chi tiết', value: 'services-detail' },
  { label: 'Dự án — cuối trang chi tiết', value: 'projects-detail' },
  { label: 'Tin tức — cột bên', value: 'news-sidebar' },
  { label: 'Tài liệu — đầu danh sách', value: 'documents-top' },
  { label: 'Tài liệu — cột bên trang chi tiết', value: 'documents-sidebar' },
  { label: 'Liên hệ — dưới biểu mẫu', value: 'contact' },
] as const

export type BannerPlacement = (typeof bannerPlacements)[number]['value']

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: 'Banner', plural: 'Banner quảng cáo' },
  admin: {
    useAsTitle: 'name',
    group: 'Hiển thị',
    defaultColumns: ['name', 'placement', 'enabled', 'order', 'endAt'],
    hidden: hiddenForContributor,
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', label: 'Tên banner', type: 'text', required: true },
    {
      name: 'placement',
      label: 'Vị trí hiển thị',
      type: 'select',
      required: true,
      index: true,
      options: [...bannerPlacements],
    },
    { name: 'image', label: 'Ảnh (máy tính)', type: 'upload', relationTo: 'media', required: true },
    { name: 'mobileImage', label: 'Ảnh (điện thoại)', type: 'upload', relationTo: 'media' },
    { name: 'alt', label: 'Mô tả ảnh', type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'url', label: 'Đường dẫn', type: 'text' },
        { name: 'openInNewTab', label: 'Mở tab mới', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'enabled', label: 'Đang bật', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'startAt',
      label: 'Hiển thị từ ngày',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'endAt',
      label: 'Hiển thị đến ngày',
      type: 'date',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: revalidateCollection(),
}
