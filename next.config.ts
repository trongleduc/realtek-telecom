import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const r2Public = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Photos come from Unsplash, which resizes them itself (see the loader file).
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/demo/**' }],
    remotePatterns: [
      // Demo-mode photos (src/demo/content.ts) are served straight from Unsplash.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(r2Public
        ? [{ protocol: r2Public.protocol.replace(':', '') as 'https' | 'http', hostname: r2Public.hostname }]
        : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Payload's `withPayload` wrapper is not applied while the CMS is switched off (see src/cms/README.md).
export default withNextIntl(nextConfig)
