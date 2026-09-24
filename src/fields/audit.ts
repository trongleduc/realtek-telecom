import type { CollectionBeforeChangeHook, Field } from 'payload'

export const auditFields: Field[] = [
  {
    name: 'createdBy',
    label: 'Người tạo',
    type: 'relationship',
    relationTo: 'users',
    index: true,
    access: { update: () => false },
    admin: { position: 'sidebar', readOnly: true },
  },
  {
    name: 'updatedBy',
    label: 'Người sửa gần nhất',
    type: 'relationship',
    relationTo: 'users',
    access: { update: () => false },
    admin: { position: 'sidebar', readOnly: true },
  },
]

export const stampAudit: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  const userId = req.user?.collection === 'users' ? req.user.id : undefined
  if (!userId) return data
  if (operation === 'create') data.createdBy = userId
  data.updatedBy = userId
  return data
}
