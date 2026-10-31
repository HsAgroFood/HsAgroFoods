import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { ShopSidebar } from './_components/ShopSidebar'
import { Sparkles, X, Leaf, FlaskConical, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'

export const metadata = {
  title: 'Shop 100% Pure Spices & Dehydrated Powders | HS AgroFoods',
  description: 'Explore our full range of 100% pure ground spices, royal blended masale, and natural dehydrated vegetable & fruit powders (Beetroot, Tomato, Banana, Garlic, Carrot & Radish).',
}

export const dynamic = 'force-dynamic'

// Helper function for modern smart pagination range with dots
function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const delta = 1
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let prevNumber: number | undefined

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (prevNumber !== undefined) {
      if (i - prevNumber === 2) {
        rangeWithDots.push(prevNumber + 1)
      } else if (i - prevNumber !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    prevNumber = i
  }

  return rangeWithDots
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const categoryFilter = typeof params.category === 'string' ? params.category : null
  const searchQuery = typeof params.q === 'string' ? params.q : null
  const pageStr = typeof params.page === 'string' ? params.page : '1'
  const page = parseInt(pageStr, 10) || 1
  const limit = 9 // Exactly 12 products per page
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createClient()

  const fetchWithTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs = 5000): Promise<T | null> => {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
      return (await Promise.race([Promise.resolve(promise), timeout])) as T | null
    } catch {
      return null
    }
  }

  // Fetch all active categories for the sidebar
  const categoriesRes = await fetchWithTimeout(
    supabase.from('categories').select('*').eq('is_active', true).order('name')
  )
  const dbCategories = (categoriesRes as any)?.data || null
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES

  // Resolve category id if filtered
  const selectedCategory = categoryFilter && categories
    ? categories.find((c: any) => c.slug === categoryFilter)
    : null

  // Build the products query
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      product_variants (
        id,
        variant_name,
        price,
        original_price,
        stock_quantity,
        is_active
      )
    `, { count: 'exact' })
    .eq('is_active', true)

  if (selectedCategory && dbCategories && dbCategories.length > 0) {
    query = query.eq('category_id', selectedCategory.id)
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
  }

  query = query.order('name', { ascending: true }).range(from, to)

  const productsRes = await fetchWithTimeout(query)
  const products = (productsRes as any)?.data || null
  const count = (productsRes as any)?.count || (products ? products.length : 0)

  // Process products to find minimum variant price & discounts
  let formattedProducts = (products || []).map((product: any) => {
    const activeVariants = product.product_variants?.filter((v: any) => v.is_active) || []
    const prices = activeVariants.map((v: any) => v.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null
    const minVariant = activeVariants.find((v: any) => v.price === minPrice)
    const originalPrice = minVariant?.original_price || null
    const rating = Number(product.average_rating) || 0
    const reviewCount = Number(product.review_count) || 0

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.short_description,
      featuredImage: product.featured_image_url,
      minPrice,
      originalPrice,
      rating,
      reviewCount,
      variantId: minVariant?.id || null,
    }
  })

  // Fallback to static catalog if DB is empty or not yet seeded
  let totalCount = count
  if (!products || products.length === 0) {
    let fallbackList = Object.values(FALLBACK_PRODUCTS)
    if (categoryFilter) {
      fallbackList = fallbackList.filter((p) => p.categories.slug === categoryFilter)
    }
    if (searchQuery) {
      const qLower = searchQuery.toLowerCase()
      fallbackList = fallbackList.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.short_description.toLowerCase().includes(qLower) ||
          p.slug.toLowerCase().includes(qLower)
      )
    }
    totalCount = fallbackList.length
    const pagedFallback = fallbackList.slice(from, to + 1)

    formattedProducts = pagedFallback.map((p) => {
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

  const totalPages = Math.ceil(totalCount / limit) || 1
  const paginationRange = getPaginationRange(page, totalPages)

  const currentCategoryName = categoryFilter
    ? categories?.find((c: any) => c.slug === categoryFilter)?.name
    : null

  // Helper to build page URL preserving active category and search query
  const buildPageUrl = (targetPage: number) => {
    const queryParts: string[] = [`page=${targetPage}`]
    if (categoryFilter) queryParts.push(`category=${encodeURIComponent(categoryFilter)}`)
    if (searchQuery) queryParts.push(`q=${encodeURIComponent(searchQuery)}`)
    return `/shop?${queryParts.join('&')}`
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] pb-16 relative overflow-hidden">
      {/* ── Ambient Background Lighting Gradients (matching Home Page) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 5%, rgba(240, 152, 25, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 92% 12%, rgba(224, 123, 12, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 5% 40%, rgba(20, 77, 41, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Right Accent Spices */}
      <div className="absolute top-0 right-0 w-36 h-36 sm:w-56 sm:h-56 lg:w-80 lg:h-80 pointer-events-none select-none mix-blend-multiply opacity-75 z-0">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spice Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 144px, 320px"
          priority={false}
        />
      </div>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10 pt-6 sm:pt-10">

        {/* ── Modern Hero Header Banner (Home Page Typography & Style) ── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8 sm:mb-10">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-[#144D29] fill-[#144D29]/20" />
            <span>100% PURE &amp; NATURAL • FARM TO PAN</span>
          </div>

          {/* Main Serif Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#14361F] leading-[1.2]">
            {currentCategoryName ? (
              <>
                Pure Indian <span className="text-[#E07B0C]">{currentCategoryName}</span>
              </>
            ) : (
              <>
                Our Spices &amp; <span className="text-[#E07B0C]">Natural Powders</span>
              </>
            )}
          </h1>

          {/* Subheading */}
          <p className="hidden sm:block text-xs sm:text-sm lg:text-base text-[#615147] max-w-2xl mx-auto leading-relaxed font-medium">
            Explore 100% pure single-origin ground spices, royal blended masale, and nutrient-dense dehydrated vegetable &amp; fruit powders.
          </p>

          {/* 4 Mini Trust Indicators */}
          <div className="hidden sm:block flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-[11px] sm:text-xs text-[#5A433B] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#144D29]" />
              <span>100% Natural</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>Zero Preservatives</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#144D29]" />
              <span>Premium Quality</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>All-India Delivery</span>
            </span>
          </div>
        </div>

        {/* ── Active Filter & Results Summary Strip ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#EDE4D9]">
          <div className="text-xs sm:text-sm text-[#5A433B]">
            Showing <strong className="text-[#14361F] font-extrabold">{totalCount > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, totalCount)}</strong> of <strong className="text-[#14361F] font-extrabold">{totalCount}</strong> {totalCount === 1 ? 'item' : 'items'}
            {searchQuery && <span> for &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>}
          </div>

          {/* Active Filter Chips */}
          {(categoryFilter || searchQuery) && (
            <div className="flex items-center gap-2">
              {categoryFilter && (
                <Link
                  href={`/shop${searchQuery ? `?q=${searchQuery}` : ''}`}
                  className="inline-flex items-center gap-1.5 rounded-[5px] bg-white border border-[#E07B0C]/50 px-2.5 py-1 text-xs font-semibold text-[#E07B0C] hover:bg-[#FAF3EB] transition-colors shadow-2xs"
                >
                  <span>Category: {currentCategoryName || categoryFilter}</span>
                  <X className="w-3.5 h-3.5 text-[#E07B0C]" />
                </Link>
              )}
              {searchQuery && (
                <Link
                  href={`/shop${categoryFilter ? `?category=${categoryFilter}` : ''}`}
                  className="inline-flex items-center gap-1.5 rounded-[5px] bg-white border border-[#E07B0C]/50 px-2.5 py-1 text-xs font-semibold text-[#E07B0C] hover:bg-[#FAF3EB] transition-colors shadow-2xs"
                >
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <X className="w-3.5 h-3.5 text-[#E07B0C]" />
                </Link>
              )}
              <Link
                href="/shop"
                className="text-xs font-bold text-[#8C766E] hover:text-[#E07B0C] underline transition-colors ml-1"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        {/* ── Main Shop Grid: Sidebar + Modern Products Grid ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* Modern Shop Sidebar */}
          <ShopSidebar
            categories={categories || []}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
          />

          {/* Product Grid Area */}
          <div className="flex-1 w-full">
            {formattedProducts.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-[5px] border border-[#EDE4D9] shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-[5px] bg-[#FAF3EB] border border-[#F09819]/40 flex items-center justify-center text-[#E07B0C] mx-auto shadow-2xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#14361F]">No products found</h3>
                <p className="text-xs sm:text-sm text-[#6E5951] max-w-sm mx-auto">
                  We couldn&apos;t find any products matching your selection. Try adjusting your search or category filter.
                </p>
                {(searchQuery || categoryFilter) && (
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-[5px] bg-[#E07B0C] hover:bg-[#C86A08] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors"
                  >
                    View All Products
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Responsive Grid: 2 columns on mobile, 3 on tablet/desktop, 3 or 4 on large screens */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3.5 sm:gap-5">
                  {formattedProducts.map((product: any) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* ── Modern & Responsive Pagination Controls ── */}
                {totalPages > 1 && (
                  <div className="mt-10 sm:mt-12 pt-6 border-t border-[#EDE4D9] flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Range Summary */}
                    <p className="text-xs text-[#6E5951] order-2 sm:order-1 font-medium">
                      Showing <span className="font-bold text-[#14361F]">{(page - 1) * limit + 1}</span>–<span className="font-bold text-[#14361F]">{Math.min(page * limit, totalCount)}</span> of{' '}
                      <span className="font-bold text-[#14361F]">{totalCount}</span> products
                    </p>

                    {/* Right: Modern Responsive Controls */}
                    <nav
                      aria-label="Shop catalog pagination"
                      className="order-1 sm:order-2 flex items-center gap-1.5 sm:gap-2 select-none"
                    >
                      {/* Previous Page Button */}
                      {page > 1 ? (
                        <Link
                          href={buildPageUrl(page - 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-[#EDE4D9] rounded-[5px] text-xs font-bold text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#E07B0C] hover:border-[#E07B0C]/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
                          aria-label="Go to previous page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 text-[#E07B0C]" />
                          <span className="hidden xs:inline">Prev</span>
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D9]/60 rounded-[5px] text-xs font-semibold text-[#8C766E]/50 cursor-not-allowed pointer-events-none"
                          aria-disabled="true"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 opacity-40" />
                          <span className="hidden xs:inline">Prev</span>
                        </span>
                      )}

                      {/* Mobile-only page indicator pill */}
                      <span className="sm:hidden px-3 py-2 bg-white border border-[#EDE4D9] rounded-[5px] text-xs font-bold text-[#14361F] shadow-2xs">
                        Page {page} of {totalPages}
                      </span>

                      {/* Desktop & Tablet Page Number Buttons */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {paginationRange.map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span
                                key={`dots-${idx}`}
                                className="w-9 h-9 flex items-center justify-center text-xs font-bold text-[#8C766E]"
                              >
                                …
                              </span>
                            )
                          }

                          const pageNum = item as number
                          const isCurrent = pageNum === page

                          return (
                            <Link
                              key={`page-${pageNum}`}
                              href={buildPageUrl(pageNum)}
                              aria-current={isCurrent ? 'page' : undefined}
                              className={`w-9 h-9 flex items-center justify-center rounded-[5px] text-xs font-bold transition-all duration-200 active:scale-95 ${
                                isCurrent
                                  ? 'bg-[#E07B0C] text-white shadow-xs font-extrabold border border-[#E07B0C]'
                                  : 'bg-white border border-[#EDE4D9] text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#E07B0C] hover:border-[#E07B0C]/40'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          )
                        })}
                      </div>

                      {/* Next Page Button */}
                      {page < totalPages ? (
                        <Link
                          href={buildPageUrl(page + 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-[#EDE4D9] rounded-[5px] text-xs font-bold text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#E07B0C] hover:border-[#E07B0C]/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
                          aria-label="Go to next page"
                        >
                          <span className="hidden xs:inline">Next</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#E07B0C]" />
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D9]/60 rounded-[5px] text-xs font-semibold text-[#8C766E]/50 cursor-not-allowed pointer-events-none"
                          aria-disabled="true"
                        >
                          <span className="hidden xs:inline">Next</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </span>
                      )}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
