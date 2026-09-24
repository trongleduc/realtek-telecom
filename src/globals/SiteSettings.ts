import type { GlobalConfig } from 'payload'

import { anyone, hiddenForContributor, isAdmin } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cấu hình chung',
  admin: { group: 'Cấu hình', hidden: hiddenForContributor },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Doanh nghiệp',
          fields: [
            { name: 'companyName', label: 'Tên công ty', type: 'text', localized: true, required: true },
            { name: 'shortName', label: 'Tên ngắn', type: 'text', defaultValue: 'Realtek Telecom' },
            { name: 'tagline', label: 'Khẩu hiệu', type: 'text', localized: true },
            { name: 'description', label: 'Giới thiệu ngắn (chân trang)', type: 'textarea', localized: true },
            {
              type: 'row',
              fields: [
                { name: 'logo', label: 'Logo (nền sáng)', type: 'upload', relationTo: 'media' },
                { name: 'logoLight', label: 'Logo (nền tối)', type: 'upload', relationTo: 'media' },
                { name: 'favicon', label: 'Biểu tượng tab (favicon)', type: 'upload', relationTo: 'media' },
              ],
            },
            { name: 'taxCode', label: 'Mã số thuế', type: 'text' },
          ],
        },
        {
          label: 'Liên hệ',
          fields: [
            { name: 'address', label: 'Địa chỉ', type: 'textarea', localized: true },
            {
              type: 'row',
              fields: [
                { name: 'hotline', label: 'Hotline', type: 'text' },
                { name: 'phone', label: 'Điện thoại bàn', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'zaloPhone', label: 'Số Zalo', type: 'text' },
              ],
            },
            { name: 'workingHours', label: 'Giờ làm việc', type: 'text', localized: true },
            {
              name: 'mapEmbedUrl',
              label: 'Link nhúng Google Maps',
              type: 'text',
              admin: { description: 'Google Maps → Chia sẻ → Nhúng bản đồ → copy giá trị src của iframe.' },
            },
            { name: 'mapLink', label: 'Link chỉ đường Google Maps', type: 'text' },
          ],
        },
        {
          label: 'Mạng xã hội',
          fields: [
            { name: 'facebookUrl', label: 'Facebook', type: 'text' },
            { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
            { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
          ],
        },
        {
          label: 'Thông báo & CRM',
          fields: [
            {
              name: 'notifyEmails',
              label: 'Email nhận thông báo liên hệ',
              type: 'array',
              labels: { singular: 'Email', plural: 'Email' },
              fields: [{ name: 'email', type: 'email', required: true }],
            },
            {
              name: 'crmUrl',
              label: 'Đường dẫn hệ thống CRM',
              type: 'text',
              admin: { description: 'Hiển thị nút "Mở CRM" trên trang tổng quan sau khi nhân viên đăng nhập.' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'defaultMetaTitle', label: 'Tiêu đề mặc định', type: 'text', localized: true },
            { name: 'defaultMetaDescription', label: 'Mô tả mặc định', type: 'textarea', localized: true },
            { name: 'defaultOgImage', label: 'Ảnh chia sẻ mặc định', type: 'upload', relationTo: 'media' },
            {
              name: 'googleSiteVerification',
              label: 'Mã xác minh Google Search Console',
              type: 'text',
              admin: { description: 'Chỉ nhập phần content của thẻ meta google-site-verification.' },
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobal] },
}
