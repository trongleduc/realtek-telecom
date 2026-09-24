/**
 * Site data layer. The CMS (Payload + MongoDB) is currently switched off: every read is served from the
 * placeholder content in src/demo/content.ts, with no database and no environment variables.
 * src/cms/data.ts is the Payload implementation with the same exports (see src/cms/README.md).
 */
export * from '@/demo/provider'
