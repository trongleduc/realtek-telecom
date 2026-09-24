import type { GlobalConfig } from 'payload'

import { anyone, hiddenForContributor, isAdmin } from '@/access'
import { linkFields } from '@/fields/link'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Menu đầu trang',
  admin: {
    group: 'Cấu hình',
    hidden: hiddenForContributor,
    description: 'Để trống thì website dùng menu mặc định (Giới thiệu, Dịch vụ, Dự án, Tin tức, Tài liệu, Liên hệ).',
  },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      name: 'navItems',
      label: 'Mục menu',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Mục', plural: 'Mục' },
      fields: [
        ...linkFields({ required: true }),
        {
          name: 'children',
          label: 'Menu con',
          type: 'array',
          labels: { singular: 'Mục con', plural: 'Mục con' },
          fields: linkFields({ required: true }),
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobal] },
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Chân trang',
  admin: { group: 'Cấu hình', hidden: hiddenForContributor },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      name: 'links',
      label: 'Liên kết nhanh',
      type: 'array',
      labels: { singular: 'Liên kết', plural: 'Liên kết' },
      fields: linkFields({ required: true }),
    },
    { name: 'copyright', label: 'Dòng bản quyền', type: 'text', localized: true },
  ],
  hooks: { afterChange: [revalidateGlobal] },
}
