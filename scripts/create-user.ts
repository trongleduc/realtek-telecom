/**
 * Creates (or resets) an admin-area account.
 *
 *   npm run create-user -- --email=ten@realtek.vn --name="Nguyễn Văn A" --role=admin --password="mat-khau-du-10-ky-tu"
 *
 * Role: admin | editor | contributor (default: admin). Omit --password to generate one.
 */
import 'dotenv/config'
import crypto from 'crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

function arg(name: string) {
  const prefix = `--${name}=`
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length)
}

const email = arg('email')
const name = arg('name') ?? email?.split('@')[0]
const role = (arg('role') ?? 'admin') as 'admin' | 'editor' | 'contributor'
const password = arg('password') ?? crypto.randomBytes(9).toString('base64url')

if (!email) {
  console.error('Thiếu --email. Ví dụ: npm run create-user -- --email=ten@realtek.vn --role=admin')
  process.exit(1)
}
if (!['admin', 'editor', 'contributor'].includes(role)) {
  console.error('--role phải là admin, editor hoặc contributor')
  process.exit(1)
}

const payload = await getPayload({ config })
const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs[0]) {
  await payload.update({
    collection: 'users',
    id: existing.docs[0].id,
    data: { password, role, active: true, name: name ?? existing.docs[0].name },
    overrideAccess: true,
  })
  console.log(`Đã cập nhật tài khoản ${email} (vai trò: ${role}).`)
} else {
  await payload.create({
    collection: 'users',
    data: { email, password, name: name ?? email, role, active: true },
    overrideAccess: true,
  })
  console.log(`Đã tạo tài khoản ${email} (vai trò: ${role}).`)
}
if (!arg('password')) console.log(`Mật khẩu: ${password}`)
process.exit(0)
