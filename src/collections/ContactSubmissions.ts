import type { CollectionAfterChangeHook, CollectionConfig, Where } from 'payload'
import ExcelJS from 'exceljs'

import { hasRole, hiddenForContributor, isAdmin, isAdminOrEditor } from '@/access'

export const contactStatuses = [
  { label: 'Mới', value: 'new' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đã xong', value: 'done' },
]

const statusLabel = (value: string) => contactStatuses.find((s) => s.value === value)?.label ?? value

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

const notifyByEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  try {
    const settings = await req.payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    const recipients = (settings.notifyEmails ?? []).map((r) => r.email).filter(Boolean)
    if (!recipients.length) return doc

    const rows: [string, unknown][] = [
      ['Họ tên', doc.fullName],
      ['Số điện thoại', doc.phone],
      ['Email', doc.email],
      ['Công ty', doc.company],
      ['Dịch vụ quan tâm', doc.serviceTitle],
      ['Nội dung', doc.message],
      ['Trang gửi', doc.sourceUrl],
    ]
    await req.payload.sendEmail({
      to: recipients,
      subject: `[Website] Liên hệ mới từ ${doc.fullName}`,
      html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="color:#555;vertical-align:top">${k}</td><td style="white-space:pre-line">${escapeHtml(v)}</td></tr>`,
        )
        .join('')}</table>`,
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Không gửi được email thông báo liên hệ' })
  }
  return doc
}

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Liên hệ', plural: 'Liên hệ khách hàng' },
  admin: {
    useAsTitle: 'fullName',
    group: 'Khách hàng',
    defaultColumns: ['fullName', 'phone', 'email', 'serviceTitle', 'status', 'createdAt'],
    hidden: hiddenForContributor,
    components: {
      beforeListTable: ['@/components/admin/ExportContacts#ExportContacts'],
    },
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdminOrEditor,
    // Created only by the public contact form server action (overrideAccess), never via the admin or REST API.
    create: () => false,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'fullName', label: 'Họ tên', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'phone', label: 'Số điện thoại', type: 'text', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'Email', type: 'email', admin: { readOnly: true } },
        { name: 'company', label: 'Công ty', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'service',
      label: 'Dịch vụ quan tâm',
      type: 'relationship',
      relationTo: 'services',
      admin: { readOnly: true },
    },
    { name: 'serviceTitle', label: 'Dịch vụ', type: 'text', admin: { hidden: true } },
    { name: 'message', label: 'Nội dung', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: contactStatuses,
      admin: { position: 'sidebar' },
    },
    { name: 'internalNote', label: 'Ghi chú nội bộ', type: 'textarea', admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Thông tin kỹ thuật',
      admin: { initCollapsed: true },
      fields: [
        { name: 'locale', label: 'Ngôn ngữ', type: 'text', admin: { readOnly: true } },
        { name: 'sourceUrl', label: 'Trang gửi', type: 'text', admin: { readOnly: true } },
        { name: 'ip', label: 'IP', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyByEmail],
  },
  endpoints: [
    {
      path: '/export',
      method: 'get',
      handler: async (req) => {
        if (!hasRole(req.user, 'admin', 'editor')) {
          return Response.json({ message: 'Bạn không có quyền xuất dữ liệu.' }, { status: 403 })
        }

        const where = (req.query?.where as Where | undefined) ?? undefined
        const { docs } = await req.payload.find({
          collection: 'contact-submissions',
          where,
          sort: '-createdAt',
          limit: 10000,
          pagination: false,
          depth: 0,
          user: req.user,
          overrideAccess: false,
          req,
        })

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Realtek Telecom'
        const sheet = workbook.addWorksheet('Liên hệ')
        sheet.columns = [
          { header: 'Thời gian', key: 'createdAt', width: 20 },
          { header: 'Họ tên', key: 'fullName', width: 26 },
          { header: 'Số điện thoại', key: 'phone', width: 16 },
          { header: 'Email', key: 'email', width: 28 },
          { header: 'Công ty', key: 'company', width: 26 },
          { header: 'Dịch vụ quan tâm', key: 'serviceTitle', width: 28 },
          { header: 'Nội dung', key: 'message', width: 60 },
          { header: 'Trạng thái', key: 'status', width: 14 },
          { header: 'Ghi chú nội bộ', key: 'internalNote', width: 36 },
          { header: 'Ngôn ngữ', key: 'locale', width: 10 },
          { header: 'Trang gửi', key: 'sourceUrl', width: 40 },
        ]
        sheet.getRow(1).font = { bold: true }
        sheet.views = [{ state: 'frozen', ySplit: 1 }]

        for (const doc of docs) {
          sheet.addRow({
            ...doc,
            createdAt: new Date(doc.createdAt),
            status: statusLabel(doc.status),
          })
        }
        sheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm'
        sheet.getColumn('message').alignment = { wrapText: true, vertical: 'top' }

        const buffer = await workbook.xlsx.writeBuffer()
        const stamp = new Date().toISOString().slice(0, 10)
        return new Response(buffer as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="lien-he-${stamp}.xlsx"`,
            'Cache-Control': 'no-store',
          },
        })
      },
    },
  ],
}
