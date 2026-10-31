import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { ProductImageGallery } from '@/components/storefront/ProductImageGallery'
import { ProductVariantSelector } from '@/components/storefront/ProductVariantSelector'
import { ProductTabsSection } from '@/components/storefront/ProductTabsSection'
import { ProductCard } from '@/components/storefront/ProductCard'
import { RelatedProductsCarousel } from '@/components/storefront/RelatedProductsCarousel'
import { FALLBACK_PRODUCTS, getFallbackProductBySlug } from '@/constants/fallbackProducts'
import { getEffectiveUser } from '@/lib/userAuth'

function sanitizeBrand(str?: string | null): string | null | undefined {
  if (!str || typeof str !== 'string') return str
  return str
    .replace(/jaandaar\s*masal[ae]?/gi, 'HS AgroFoods')
    .replace(/jaandaar/gi, 'HS AgroFoods')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('seo_title, seo_description, name, short_description')
      .eq('slug', slug)
      .single()

    if (product) {
      return {
        title: sanitizeBrand(product.seo_title) || `${sanitizeBrand(product.name)} | HS AgroFoods`,
        description:
          sanitizeBrand(product.seo_description) ||
          sanitizeBrand(product.short_description) ||
          `Buy authentic ${sanitizeBrand(product.name)} from HS AgroFoods.`,
      }
    }
  } catch {
    // Fallback
  }

  const fallback = getFallbackProductBySlug(slug)
  if (fallback) {
    return {
      title: `${fallback.name} | HS AgroFoods`,
      description: fallback.short_description,
    }
  }

  const formattedName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `${formattedName} | HS AgroFoods`,
    description: `Buy authentic, 100% pure ${formattedName} from HS AgroFoods.`,
  }
}

export const dynamic = 'force-dynamic'

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let product: any = null
  let isAuthenticated = false
  let reviews: any[] = []
  let relatedProducts: any[] = []
  let globalFaqs: any[] = []

  // Check effective logged-in user
  const effectiveUser = await getEffectiveUser()
  isAuthenticated = !!effectiveUser

  try {
    const adminClient = createAdminClient()

    // Fetch product and all related data from database
    const { data: dbProduct } = await adminClient
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        product_images (*),
        product_variants (*),
        product_information (*),
        product_faqs (*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (dbProduct) {
      product = {
        ...dbProduct,
        name: sanitizeBrand(dbProduct.name),
        short_description: sanitizeBrand(dbProduct.short_description),
        description: sanitizeBrand(dbProduct.description),
        product_information: (dbProduct.product_information || []).map((info: any) => ({
          ...info,
          label: sanitizeBrand(info.label),
          value: sanitizeBrand(info.value),
        })),
        product_faqs: (dbProduct.product_faqs || []).map((faq: any) => ({
          ...faq,
          question: sanitizeBrand(faq.question),
          answer: sanitizeBrand(faq.answer),
        })),
      }
    }

    // If db product exists, fetch reviews & related products
    if (product) {
      const adminClient = createAdminClient()

      if (product.use_global_faqs) {
        const { data: faqsData } = await adminClient
          .from('global_faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (faqsData && faqsData.length > 0) {
          globalFaqs = faqsData.map((faq: any) => ({
            ...faq,
            question: sanitizeBrand(faq.question),
            answer: sanitizeBrand(faq.answer),
          }))
        }
      }

      const { data: reviewsData } = await adminClient
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (reviewsData && reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map((r: any) => r.user_id).filter(Boolean))]
        const profilesMap: Record<string, string> = {}

        if (userIds.length > 0) {
          const { data: profiles } = await adminClient
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)

          if (profiles) {
            profiles.forEach((p: any) => {
              if (p.id && p.full_name) profilesMap[p.id] = p.full_name
            })
          }

          const { data: users } = await adminClient
            .from('users')
            .select('id, full_name')
            .in('id', userIds)

          if (users) {
            users.forEach((u: any) => {
              if (u.id && u.full_name && !profilesMap[u.id]) profilesMap[u.id] = u.full_name
            })
          }
        }

        reviews = reviewsData.map((r: any) => ({
          id: r.id,
          rating: Number(r.rating) || 5,
          review_text: sanitizeBrand(r.review_text),
          created_at: r.created_at,
          user: {
            full_name: profilesMap[r.user_id] || 'Verified Customer',
          },
        }))
      }

      const { data: relatedProductsData } = await adminClient
        .from('products')
        .select(`
          id,
          slug,
          name,
          short_description,
          featured_image_url,
          average_rating,
          review_count,
          product_variants ( id, price, original_price, is_active )
        `)
        .neq('id', product.id)
        .eq('is_active', true)
        .limit(20)

      if (relatedProductsData && relatedProductsData.length > 0) {
        const shuffled = [...relatedProductsData].sort(() => 0.5 - Math.random())
        relatedProducts = shuffled.slice(0, 10).map((rp: any) => {
          const activeVariants = rp.product_variants?.filter((v: any) => v.is_active) || []
          const prices = activeVariants.map((v: any) => v.price)
          const minPrice = prices.length > 0 ? Math.min(...prices) : null
          const minVariant = activeVariants.find((v: any) => v.price === minPrice)
          const originalPrice = minVariant?.original_price || null
          const rating = Number(rp.average_rating) || 0
          const reviewCount = Number(rp.review_count) || 0

          return {
            id: rp.id,
            slug: rp.slug,
            name: sanitizeBrand(rp.name) || rp.name,
            shortDescription: sanitizeBrand(rp.short_description),
            featuredImage: rp.featured_image_url,
            minPrice,
            originalPrice,
            rating,
            reviewCount,
            variantId: minVariant?.id || null,
          }
        })
      }
    }
  } catch (err) {
    console.error('Error fetching product from DB:', err instanceof Error ? err.message : err)
  }

  // Graceful fallback to rich static catalog if not in database
  if (!product) {
    const fallback = getFallbackProductBySlug(slug)
    if (fallback) {
      product = fallback
    }
  }

  if (!product) {
    notFound()
  }

  // Build fallback related products if none found from DB
  if (relatedProducts.length === 0) {
    relatedProducts = Object.values(FALLBACK_PRODUCTS)
      .filter((p) => p.slug !== slug)
      .slice(0, 10)
      .map((p) => {
        const activeVariants = p.product_variants.filter((v) => v.is_active)
        const prices = activeVariants.map((v) => v.price)
        const minPrice = prices.length > 0 ? Math.min(...prices) : null
        const minVariant = activeVariants.find((v) => v.price === minPrice)
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          shortDescription: p.short_description,
          featuredImage: p.featured_image_url,
          minPrice,
          originalPrice: minVariant?.original_price || null,
          rating: p.average_rating,
          reviewCount: p.review_count,
          variantId: minVariant?.id || null,
        }
      })
  }

  // Sort relations
  const sortedInfo = (product.product_information || []).sort(
    (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
  )
  const sortedFaqs = (product.product_faqs || []).sort(
    (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
  )
  const displayedFaqs = product.use_global_faqs && globalFaqs.length > 0 ? globalFaqs : sortedFaqs

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10 text-[#14361F] relative overflow-hidden">
      {/* ── Ambient Background Lighting Gradients ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 5%, rgba(240, 152, 25, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 92% 15%, rgba(224, 123, 12, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 8% 85%, rgba(20, 77, 41, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Left Herbal Accent */}
      <div className="absolute top-0 left-0 w-36 h-36 sm:w-56 sm:h-56 lg:w-72 lg:h-72 pointer-events-none select-none mix-blend-multiply opacity-75 z-0 -scale-x-100">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spice Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 144px, 288px"
          priority={false}
        />
      </div>
      <div className="max-w-[1370px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Product Hero Grid (Direct Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-12 xl:gap-x-16 items-start">

          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5">
            <ProductImageGallery
              images={product.product_images || []}
              productName={product.name}
              featuredImage={product.featured_image_url}
            />
          </div>

          {/* Right Column: Product Info & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category Badge & Rating */}
              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                {product.categories && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 border border-[#E8DFD5] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E07B0C]">
                    {product.categories.name}
                  </span>
                )}
                {product.review_count > 0 && product.average_rating > 0 ? (
                  <a
                    href="#reviews"
                    className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-700 font-bold bg-white/90 hover:bg-white px-2.5 py-0.5 rounded-full border border-amber-200/60 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>★</span>
                    <span>{Number(product.average_rating).toFixed(1)}</span>
                    <span className="text-stone-400 font-normal">
                      ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  </a>
                ) : (
                  <a
                    href="#reviews"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-600 font-medium bg-white/90 hover:bg-white px-2.5 py-0.5 rounded-full border border-stone-200 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="text-amber-500 font-bold">★</span>
                    <span>New</span>
                    <span className="text-[#E07B0C] font-semibold hover:underline">(Write a review)</span>
                  </a>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#14361F] mb-2 leading-tight flex items-center gap-2">
                {product.name} <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#227B44] fill-[#227B44]/20 shrink-0 inline-block" />
              </h1>

              {product.short_description && (
                <p className="text-xs sm:text-sm lg:text-base text-[#5A433B] leading-relaxed mb-3 font-normal">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Variants Selector (Handles Price, Pack Size & Add to Cart) */}
            <ProductVariantSelector variants={product.product_variants || []} />
          </div>
        </div>

        {/* Product Information, Specs, FAQs & Customer Reviews Tabs */}
        <ProductTabsSection
          productId={product.id}
          productName={product.name}
          description={product.description}
          shortDescription={product.short_description}
          specs={sortedInfo}
          faqs={displayedFaqs}
          reviews={reviews}
          isAuthenticated={isAuthenticated}
          averageRating={Number(product.average_rating) || 0}
        />

        {/* ── You May Also Like (5 items per row carousel with compact cards) ── */}
        {relatedProducts.length > 0 && (
          <RelatedProductsCarousel products={relatedProducts} />
        )}

      </div>
    </div>
  )
}
