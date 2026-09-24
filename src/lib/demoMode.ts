/**
 * Demo mode serves the public site from src/demo/content.ts instead of Payload/MongoDB, so the
 * interface can be shown before a database exists. On when `DEMO_MODE=1`, or when no `DATABASE_URI` is set.
 * The admin (/admin) and REST API (/api) are unavailable in this mode.
 */
export const isDemoMode = process.env.DEMO_MODE === '1' || !process.env.DATABASE_URI
