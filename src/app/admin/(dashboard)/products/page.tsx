import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import ProductsList, { type ProductWithCategory } from './_components/ProductsList'

export const metadata: Metadata = {
  title: 'Products',
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const supabase = createAdminClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name), product_variants(price, stock_quantity, is_active)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <ProductsList products={(products ?? []) as ProductWithCategory[]} />
    </div>
  )
}
