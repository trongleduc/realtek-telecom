import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'

function categoryCollection(slug: 'post-categories' | 'document-categories', plural: string): CollectionConfig {
  return {
    slug,
    labels: { singular: 'Danh mục', plural },
    admin: { useAsTitle: 'title', group: 'Danh mục', defaultColumns: ['title', 'slug', 'order'] },
    defaultSort: 'order',
    access: {
      read: anyone,
      create: isAdminOrEditor,
      update: isAdminOrEditor,
      delete: isAdminOrEditor,
    },
    fields: [
      { name: 'title', label: 'Tên danh mục', type: 'text', localized: true, required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', localized: true },
      ...slugField({ trackHistory: false }),
      { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    ],
    hooks: revalidateCollection(slug === 'post-categories' ? 'posts' : 'documents'),
  }
}

export const PostCategories = categoryCollection('post-categories', 'Danh mục tin tức')
export const DocumentCategories = categoryCollection('document-categories', 'Danh mục tài liệu')
