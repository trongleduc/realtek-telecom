import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { BlocksFeature, EXPERIMENTAL_TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { YouTubeBlock } from './blocks/YouTube'
import { Banners } from './collections/Banners'
import { DocumentCategories, PostCategories } from './collections/Categories'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Services } from './collections/Services'
import { Sliders } from './collections/Sliders'
import { Users } from './collections/Users'
import { Footer, Header } from './globals/Navigation'
import { AboutPage, HomePage } from './globals/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { extraOrigins, siteUrl } from './lib/site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
const alternateOrigins = (process.env.ALTERNATE_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)
  .map((h) => `https://${h}`)

export default buildConfig({
  serverURL: siteUrl,
  secret: process.env.PAYLOAD_SECRET || '',
  csrf: [siteUrl, ...alternateOrigins, ...extraOrigins],
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Quản trị Realtek' },
    dateFormat: 'dd/MM/yyyy HH:mm',
    components: {
      beforeDashboard: ['@/components/admin/CrmLink#CrmLink'],
    },
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  localization: {
    locales: [
      { code: 'vi', label: 'Tiếng Việt' },
      { code: 'en', label: 'English' },
      { code: 'zh', label: '中文' },
    ],
    defaultLocale: 'vi',
    fallback: true,
  },
  collections: [
    Services,
    Projects,
    Posts,
    Documents,
    Media,
    PostCategories,
    DocumentCategories,
    Sliders,
    Banners,
    Partners,
    ContactSubmissions,
    Users,
  ],
  globals: [HomePage, AboutPage, SiteSettings, Header, Footer],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({ blocks: [YouTubeBlock] }),
    ],
  }),
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  sharp,
  upload: { limits: { fileSize: 30 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'no-reply@realtektelecom.com',
        defaultFromName: 'Website Realtek Telecom',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET),
      collections: {
        media: r2PublicUrl
          ? {
              prefix: 'media',
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => `${r2PublicUrl}/${prefix ? `${prefix}/` : ''}${filename}`,
            }
          : { prefix: 'media' },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
