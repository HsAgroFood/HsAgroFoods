import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private or useless-for-search areas. Search results (?q=) stay crawlable so their noindex tag can be read.
        disallow: ['/admin', '/api/', '/cart', '/checkout', '/account', '/wishlist', '/login', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
