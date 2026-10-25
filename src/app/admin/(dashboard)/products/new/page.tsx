import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import ProductForm from '../_components/ProductForm'

export const metadata: Metadata = {
  title: 'New Product',
}

export const dynamic = 'force-dynamic'

const DEFAULT_CATEGORIES = [
  { name: 'Pure & Ground Spices', slug: 'pure-ground-spices', description: 'Freshly grounded single-origin pure spices' },
  { name: 'Blended Masalas', slug: 'blended-masalas', description: 'Authentic traditional Indian spice blends' },
  { name: 'Whole Spices (Khada Masala)', slug: 'whole-spices', description: 'Premium handpicked whole spices' },
  { name: 'Exotic & Royal Herbs', slug: 'exotic-herbs', description: 'Royal aromatic seasoning and spices' },
  { name: 'Organic & Wellness Spices', slug: 'organic-wellness', description: 'Pure organic and Ayurvedic immunity spices' },
]

export default async function NewProductPage() {
  const supabase = createAdminClient()

  let { data: categories } = await supabase
    .from('categories')
    .select('*')
    .not('slug', 'like', '__system_%')
    .eq('is_active', true)
    .order('name')

  // Auto-seed standard spice categories if the database categories table is currently empty
  if (!categories || categories.length === 0) {
    try {
      const { data: inserted } = await supabase
        .from('categories')
        .insert(DEFAULT_CATEGORIES.map(c => ({ ...c, is_active: true })))
        .select('*')
      if (inserted && inserted.length > 0) {
        categories = inserted
      }
    } catch {
      // Ignore if already seeded
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New Product</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Add a new product to your catalog
        </p>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  )
}
