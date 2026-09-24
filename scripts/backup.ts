/**
 * Daily database backup (SRS FR-12): mongodump → gzip archive → Cloudflare R2, keeping the newest 30.
 * Requires the MongoDB Database Tools (`mongodump`) on PATH. Schedule with cron, e.g.:
 *   0 2 * * * cd /srv/realtek-telecom && npm run backup >> /var/log/realtek-backup.log 2>&1
 *
 * Restore: download an archive, then `mongorestore --uri="$DATABASE_URI" --gzip --archive=<file> --drop`
 */
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { spawn } from 'child_process'
import 'dotenv/config'
import { createReadStream, mkdirSync, statSync, unlinkSync } from 'fs'
import path from 'path'

const KEEP = 30
const PREFIX = 'mongodb/'

const { DATABASE_URI, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BACKUP_BUCKET } = process.env
if (!DATABASE_URI || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BACKUP_BUCKET) {
  console.error(
    'Thiếu biến môi trường: DATABASE_URI, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BACKUP_BUCKET',
  )
  process.exit(1)
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = path.resolve('backups')
mkdirSync(dir, { recursive: true })
const file = path.join(dir, `realtek-${stamp}.archive.gz`)

await new Promise<void>((resolve, reject) => {
  const child = spawn('mongodump', [`--uri=${DATABASE_URI}`, `--archive=${file}`, '--gzip'], { stdio: 'inherit' })
  child.on('error', reject)
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`mongodump exited with ${code}`))))
})

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

const key = `${PREFIX}${path.basename(file)}`
await s3.send(
  new PutObjectCommand({
    Bucket: R2_BACKUP_BUCKET,
    Key: key,
    Body: createReadStream(file),
    ContentLength: statSync(file).size,
    ContentType: 'application/gzip',
  }),
)
unlinkSync(file)
console.log(`Đã tải bản sao lưu lên r2://${R2_BACKUP_BUCKET}/${key}`)

const listed = await s3.send(new ListObjectsV2Command({ Bucket: R2_BACKUP_BUCKET, Prefix: PREFIX }))
const old = (listed.Contents ?? [])
  .filter((o) => o.Key)
  .sort((a, b) => (b.Key! > a.Key! ? 1 : -1))
  .slice(KEEP)
if (old.length) {
  await s3.send(
    new DeleteObjectsCommand({ Bucket: R2_BACKUP_BUCKET, Delete: { Objects: old.map((o) => ({ Key: o.Key! })) } }),
  )
  console.log(`Đã xoá ${old.length} bản sao lưu cũ.`)
}
