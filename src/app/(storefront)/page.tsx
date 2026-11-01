import { Fragment, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/storefront/HeroSection'
import { ShopByCategory } from '@/components/storefront/ShopByCategory'
import { PillarsBar } from '@/components/storefront/PillarsBar'
import {
  SpiceRangeSection,
  LiveSpiceItem,
  CategoryItem,
} from '@/components/storefront/SpiceRangeSection'
import { ReelsSection } from '@/components/storefront/ReelsSection'
import { getActiveReels } from '@/actions/admin/reels'
import { getActiveGlobalFaqs } from '@/actions/global_faqs'
import { HomeFaqSection } from '@/components/storefront/HomeFaqSection'
import { HealthBenefitsSection } from '@/components/storefront/HealthBenefitsSection'
import { ShowcaseSection } from '@/components/storefront/ShowcaseSection'
import { getHomeContent } from '@/actions/admin/homeContent'
import { PromiseSection } from '@/components/storefront/PromiseSection'
import { BottomBanner } from '@/components/storefront/BottomBanner'
import { SPICE_ASSETS } from '@/constants/assets'
import { FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'

export const metadata = {
  // `absolute` skips the "| HS AgroFoods" suffix, because the brand is already in this title
  title: { absolute: 'HS AgroFoods — Pure Spices & Natural Dehydrated Veg & Fruit Powders' },
  description:
    "Buy 100% pure cold-ground Indian spices (turmeric, red chilli, coriander, zeera, garam masala) and natural dehydrated vegetable & fruit powders from HS AgroFoods, Hyderabad. Free shipping across India above ₹500.",
  alternates: { canonical: '/' },
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let liveProducts: LiveSpiceItem[] = []
  let productsFromDatabase = false
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

    // 2. Fetch the products the admin marked as Featured (Admin > Products > Edit > Featured)
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        featured_image_url,
        is_featured,
        short_description,
        average_rating,
        review_count,
        category_id,
        categories (id, name, slug),
        product_variants (id, price, original_price, is_active)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: true })

    // The database answered: show exactly what it returned, even when nothing is featured
    productsFromDatabase = !productsError && Array.isArray(dbProducts)

    if (dbProducts && dbProducts.length > 0) {
      liveProducts = dbProducts.map((p: any) => {
        const activeVariants = p.product_variants?.filter((v: any) => v.is_active) || []
        const prices = activeVariants.map((v: any) => v.price)
        const minPrice = prices.length > 0 ? Math.min(...prices) : null
        const minVariant = activeVariants.find((v: any) => v.price === minPrice)

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.featured_image_url || SPICE_ASSETS.redChilly,
          tag: 'Featured',
          shortDesc: p.short_description || undefined,
          categoryId: p.category_id || undefined,
          categorySlug: p.categories?.slug || undefined,
          variantId: minVariant?.id,
          href: `/product/${p.slug}`,
          priceText: minPrice !== null ? `From ₹${minPrice}` : undefined,
          minPrice,
          originalPrice: minVariant?.original_price || null,
          rating: Number(p.average_rating) || 0,
          reviewCount: Number(p.review_count) || 0,
        }
      })
    }
  } catch {
    categories = FALLBACK_CATEGORIES
  }

  const [reels, faqs, content] = await Promise.all([getActiveReels(), getActiveGlobalFaqs(), getHomeContent()])

  // Section order and visibility are controlled in Admin > Home Customization
  const sections: Record<string, ReactNode> = {
    hero: <HeroSection />,
    shopByCategory: <ShopByCategory content={content.shopByCategory} />,
    pillars: <PillarsBar content={content.pillars} />,
    spiceRange: (
      <SpiceRangeSection
        products={liveProducts}
        categories={categories}
        useLiveProducts={productsFromDatabase}
        content={content.spiceRange}
      />
    ),
    reels: <ReelsSection reels={reels} content={content.reels} />,
    showcase: <ShowcaseSection content={content.showcase} />,
    gallery: <HealthBenefitsSection content={content.gallery} />,
    promise: <PromiseSection content={content.promise} />,
    faq: <HomeFaqSection faqs={faqs} content={content.faq} />,
    newsletter: <BottomBanner content={content.newsletter} />,
  }

  return (
    <div className="bg-spice-dust min-h-screen flex flex-col">
      {content.layout
        .filter((item) => item.visible && sections[item.id])
        .map((item) => (
          <Fragment key={item.id}>{sections[item.id]}</Fragment>
        ))}
    </div>
  )
}
