import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import CategoriesList from './_components/CategoriesList'

export const metadata: Metadata = {
  title: 'Categories',
}

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .not('slug', 'like', '__system_%')
    .order('created_at', { ascending: false })

  // How many products each category holds
  const { data: productRows } = await supabase.from('products').select('category_id')
  const productCounts = new Map<string, number>()
  for (const row of productRows || []) {
    if (row.category_id) productCounts.set(row.category_id, (productCounts.get(row.category_id) || 0) + 1)
  }

  const activeCount = (categories || []).filter((c) => c.is_active).length
  const withoutImage = (categories || []).filter((c) => !c.image_url).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {categories?.length || 0} {categories?.length === 1 ? 'category' : 'categories'} · {activeCount} active
            {withoutImage > 0 && (
              <span className="text-amber-600"> · {withoutImage} without an image</span>
            )}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <CategoriesList
        categories={(categories || []).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image_url: c.image_url,
          badge_text: c.badge_text,
          is_active: c.is_active,
          created_at: c.created_at,
          product_count: productCounts.get(c.id) || 0,
        }))}
      />
    </div>
  )
}
