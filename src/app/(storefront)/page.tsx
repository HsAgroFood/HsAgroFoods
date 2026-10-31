import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/storefront/HeroSection'
import { PillarsBar } from '@/components/storefront/PillarsBar'
import {
  SpiceRangeSection,
  LiveSpiceItem,
  CategoryItem,
} from '@/components/storefront/SpiceRangeSection'
import { HealthBenefitsSection } from '@/components/storefront/HealthBenefitsSection'
import { PromiseSection } from '@/components/storefront/PromiseSection'
import { BottomBanner } from '@/components/storefront/BottomBanner'
import { SPICE_ASSETS } from '@/constants/assets'
import { FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'

export const metadata = {
  title: 'HS AgroFoods — Pure Spices & Natural Dehydrated Veg & Fruit Powders',
  description:
    "HS AgroFoods brings India's finest cold-ground spices and 100% natural dehydrated vegetable & fruit powders to your kitchen.",
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let liveProducts: LiveSpiceItem[] = []
  let categories: CategoryItem[] = []

  try {
    const supabase = await createClient()

    // 1. Fetch active categories (Exact same as Shop Page)
    const { data: dbCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name')

    categories =
      dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES

    // 2. Dynamically fetch active products (with admin featured flag respected)
    const { data: dbProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        featured_image_url,
        is_featured,
        short_description,
        category_id,
        categories (id, name, slug),
        product_variants (id, price, is_active)
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: true })

    if (dbProducts && dbProducts.length > 0) {
      liveProducts = dbProducts.map((p: any) => {
        const activeVariants = p.product_variants?.filter((v: any) => v.is_active) || []
        const prices = activeVariants.map((v: any) => v.price)
        const minPrice = prices.length > 0 ? Math.min(...prices) : null

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.featured_image_url || SPICE_ASSETS.redChilly,
          tag: 'Featured',
          shortDesc: p.short_description || undefined,
          categoryId: p.category_id || undefined,
          categorySlug: p.categories?.slug || undefined,
          variantId: p.product_variants?.find((v: any) => v.is_active)?.id,
          href: `/product/${p.slug}`,
          priceText: minPrice !== null ? `From ₹${minPrice}` : undefined,
        }
      })
    }
  } catch {
    categories = FALLBACK_CATEGORIES
  }

  return (
    <div className="bg-spice-dust min-h-screen flex flex-col">
      {/* 1. Hero Section (Wired to Hero Slides / DB) */}
      <HeroSection />

      {/* 2. 4-Pillars Feature Bar (Floating) */}
      <PillarsBar />

      {/* 3. Our Spice Range Section (Wired to Shop Categories & Products) */}
      <SpiceRangeSection products={liveProducts} categories={categories} />

      {/* 4. Spices That Do More Than Just Add Taste (Health Benefits & Recipes) */}
      <HealthBenefitsSection />

      {/* 5. Our Promise - Pure. Natural. Trusted. (Quality Seal Stamp & Guarantees) */}
      <PromiseSection />

      {/* 6. Bring Home The Taste of Purity (Full-Width Bottom Banner) */}
      <BottomBanner />
    </div>
  )
}
