import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'
import { absoluteUrl } from '@/lib/seo'

// Rebuilt at most once an hour, so new products reach Google without a redeploy
export const revalidate = 3600

type Row = { slug: string; updated_at?: string | null }

async function loadProducts(): Promise<Row[]> {
  try {
    const admin = createAdminClient()
    const withDates = await admin.from('products').select('slug, updated_at').eq('is_active', true)
    if (!withDates.error && withDates.data && withDates.data.length > 0) return withDates.data as Row[]

    // The table may not have an updated_at column; slugs alone are enough
    const slugsOnly = await admin.from('products').select('slug').eq('is_active', true)
    if (!slugsOnly.error && slugsOnly.data && slugsOnly.data.length > 0) return slugsOnly.data as Row[]
  } catch {
    // fall through to the built-in catalogue
  }
  return Object.values(FALLBACK_PRODUCTS).map((product) => ({ slug: product.slug }))
}

async function loadCategories(): Promise<Row[]> {
  try {
    const { data, error } = await createAdminClient().from('categories').select('slug').eq('is_active', true)
    if (!error && data && data.length > 0) {
      // Hidden "system" rows (hero config, home content…) are stored as inactive categories, so is_active already skips them
      return (data as Row[]).filter((category) => category.slug && !category.slug.startsWith('__'))
    }
  } catch {
    // fall through to the built-in categories
  }
  return FALLBACK_CATEGORIES.map((category) => ({ slug: category.slug }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [products, categories] = await Promise.all([loadProducts(), loadCategories()])

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/shop'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/shop?category=${category.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...pages, ...categoryPages, ...productPages]
}
