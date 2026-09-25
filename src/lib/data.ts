/**
 * Site data layer: every read goes through Payload's local API (src/cms/data.ts), cached and tagged per collection.
 * src/demo/provider.ts has the same exports and serves src/demo/content.ts without a database (demo mode).
 */
export * from '@/cms/data'
