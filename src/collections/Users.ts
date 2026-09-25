import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'

import { adminOrSelf, hiddenUnlessAdmin, isAdmin, isAdminField } from '@/access'

const MIN_PASSWORD_LENGTH = 10

async function countActiveAdmins(req: PayloadRequest, excludeId?: string | number) {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: {
      and: [
        { role: { equals: 'admin' } },
        { active: { not_equals: false } },
        ...(excludeId ? [{ id: { not_equals: excludeId } }] : []),
      ],
    },
    overrideAccess: true,
    req,
  })
  return totalDocs
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Tài khoản', plural: 'Tài khoản' },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active', 'lastLoginAt'],
    group: 'Hệ thống',
    hidden: hiddenUnlessAdmin,
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user && (user as { active?: boolean }).active !== false),
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', label: 'Họ tên', type: 'text', required: true },
    { name: 'phone', label: 'Số điện thoại', type: 'text' },
    {
      name: 'role',
      label: 'Vai trò',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Quản trị viên', value: 'admin' },
        { label: 'Biên tập viên', value: 'editor' },
        { label: 'Cộng tác viên', value: 'contributor' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      label: 'Đang hoạt động',
      type: 'checkbox',
      defaultValue: true,
      saveToJWT: true,
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar', description: 'Bỏ chọn để khoá tài khoản.' },
    },
    {
      name: 'lastLoginAt',
      label: 'Đăng nhập gần nhất',
      type: 'date',
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.password && String(data.password).length < MIN_PASSWORD_LENGTH) {
          throw new APIError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, 400, null, true)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'create') {
          // The very first account (created from /admin/create-first-user or the CLI) is always an admin.
          // find, not count: an unfiltered count is an estimatedDocumentCount, which MongoDB refuses inside a
          // transaction (replica sets such as Atlas).
          const { docs } = await req.payload.find({
            collection: 'users',
            limit: 1,
            pagination: false,
            depth: 0,
            select: {},
            overrideAccess: true,
            req,
          })
          if (docs.length === 0) {
            data.role = 'admin'
            data.active = true
          }
          return data
        }

        const wasActiveAdmin = originalDoc?.role === 'admin' && originalDoc?.active !== false
        const losesAdmin = (data.role !== undefined && data.role !== 'admin') || data.active === false
        if (wasActiveAdmin && losesAdmin && (await countActiveAdmins(req, originalDoc.id)) === 0) {
          throw new APIError('Không thể hạ quyền hoặc khoá Quản trị viên cuối cùng.', 400, null, true)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (req.user && String(req.user.id) === String(id)) {
          throw new APIError('Bạn không thể tự xoá tài khoản của mình.', 400, null, true)
        }
        const target = await req.payload.findByID({ collection: 'users', id, overrideAccess: true, req })
        if (target?.role === 'admin' && (await countActiveAdmins(req, id)) === 0) {
          throw new APIError('Không thể xoá Quản trị viên cuối cùng.', 400, null, true)
        }
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user?.active === false) {
          throw new APIError('Tài khoản đã bị khoá. Vui lòng liên hệ Quản trị viên.', 403, null, true)
        }
        return user
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          overrideAccess: true,
          context: { disableRevalidate: true },
          req,
        })
      },
    ],
  },
  timestamps: true,
}
