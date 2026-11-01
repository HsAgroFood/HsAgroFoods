import { Navbar } from '@/components/storefront/Navbar'
import { CornerAccentsProvider } from '@/components/storefront/CornerAccents'
import { getCornerAccents } from '@/lib/cornerAccents'
import { Footer } from '@/components/storefront/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { getCartCount } from '@/actions/cart'
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { FloatingContact } from '@/components/storefront/FloatingContact'
import { ScrollToTop } from '@/components/storefront/ScrollToTop'
import { MobileBottomBar } from '@/components/storefront/MobileBottomBar'
import { PageTransitionLoader } from '@/components/storefront/PageTransitionLoader'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'
import { getShippingConfig } from '@/actions/shipping'
import { ShippingConfigProvider } from '@/contexts/ShippingConfigContext'

export const metadata = {
  title: {
    template: '%s | HS AgroFoods',
    default: 'HS AgroFoods | Pure Spices & Dehydrated Veg & Fruit Powders',
  },
  description: 'Bringing the authentic aroma of pure cold-ground Indian spices and nutrient-rich dehydrated vegetable & fruit powders right to your kitchen.',
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const shippingConfig = await getShippingConfig()
  let signatureProducts: { name: string; slug: string }[] = []
  let cartCount = 0
  let isLoggedIn = false
  let currentUser: { name: string; email: string; role?: string } | null = null
  let categories: { name: string; slug: string; description?: string | null; image_url?: string | null; badge_text?: string | null }[] = FALLBACK_CATEGORIES.map((c) => ({
    name: c.name,
    slug: c.slug,
  }))

  try {
    try {
      const adminClient = createAdminClient()
      const loadCategories = (columns: string) =>
        adminClient
          .from('categories')
          .select(columns)
          .eq('is_active', true)
          .not('slug', 'like', '__system_%')
          .order('name')

      const withTags = await loadCategories('name, slug, description, image_url, badge_text')
      // badge_text column not created yet (migration pending): keep the menu working without tags
      const data = withTags.error
        ? (await loadCategories('name, slug, description, image_url')).data
        : withTags.data
      if (data && data.length > 0) {
        categories = data as unknown as typeof categories
      }
    } catch {
      // Fallback
    }

    // Footer "Signature Range": the featured products (Admin > Products > Featured)
    try {
      const { data: featured } = await createAdminClient()
        .from('products')
        .select('name, slug')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: true })
        .limit(7)
      if (featured) signatureProducts = featured
    } catch {
      // Footer simply shows its fallback link
    }

    cartCount = await getCartCount()

    const authUser = await getEffectiveUser()
    if (authUser) {
      isLoggedIn = true
      currentUser = {
        name: authUser.full_name,
        email: authUser.email,
        role: authUser.role,
      }
    }
  } catch {
    // Safe offline fallback
  }

  const cornerAccents = await getCornerAccents()

  return (
    <CornerAccentsProvider accents={cornerAccents}>
    <ShippingConfigProvider config={shippingConfig}>
    <CartProvider initialCount={cartCount}>
      <div className="min-h-screen flex flex-col bg-[#FBF5EE]">
        <AnnouncementBar />
        <Navbar isLoggedIn={isLoggedIn} user={currentUser} categories={categories} />
        <main className="flex-grow">{children}</main>
        <Footer categories={categories} signatureProducts={signatureProducts} />
        <FloatingContact />
        <ScrollToTop />
        <MobileBottomBar categories={categories} />
        <PageTransitionLoader />
      </div>
    </CartProvider>
    </ShippingConfigProvider>
    </CornerAccentsProvider>
  )
}
