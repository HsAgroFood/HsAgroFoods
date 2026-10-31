import { Navbar } from '@/components/storefront/Navbar'
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
  let cartCount = 0
  let isLoggedIn = false
  let currentUser: { name: string; email: string; role?: string } | null = null
  let categories: { name: string; slug: string }[] = FALLBACK_CATEGORIES.map((c) => ({
    name: c.name,
    slug: c.slug,
  }))

  try {
    try {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('categories')
        .select('name, slug, description, image_url')
        .eq('is_active', true)
        .not('slug', 'like', '__system_%')
        .order('name')
      if (data && data.length > 0) {
        categories = data
      }
    } catch {
      // Fallback
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

  return (
    <CartProvider initialCount={cartCount}>
      <div className="min-h-screen flex flex-col bg-[#FBF5EE]">
        <AnnouncementBar />
        <Navbar isLoggedIn={isLoggedIn} user={currentUser} categories={categories} />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingContact />
        <ScrollToTop />
        <MobileBottomBar categories={categories} />
        <PageTransitionLoader />
      </div>
    </CartProvider>
  )
}
