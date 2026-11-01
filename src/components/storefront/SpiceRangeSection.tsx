'use client'

import { useState } from 'react'
import { CornerAccentImage } from '@/components/storefront/CornerAccents'
import Link from 'next/link'
import { ArrowRight, LayoutGrid, Leaf } from 'lucide-react'
import { SPICE_ASSETS } from '@/constants/assets'
import { FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'
import { ProductCard } from '@/components/storefront/ProductCard'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'

export type CategoryItem = {
  id: string
  name: string
  slug: string
  description?: string | null
}

export type LiveSpiceItem = {
  id: string
  name: string
  slug: string
  image: string
  tag?: string | null
  shortDesc?: string
  href: string
  priceText?: string
  categorySlug?: string
  categoryId?: string
  variantId?: string
  minPrice?: number | null
  originalPrice?: number | null
  rating?: number
  reviewCount?: number
}

export type SpiceProduct = {
  id: string
  name: string
  slug: string
  image: string
  tag: string | null
  shortDesc: string
  categorySlug: string
  categoryId?: string
  minPrice?: number | null
  originalPrice?: number | null
  rating?: number
  reviewCount?: number
  href: string
  priceText: string
  variantId: string
}

// 14 Core Authentic Products of HS AgroFoods
// Exactly mapped to the 3 shop page categories:
// 1. Ground Spices ('ground-spices')
// 2. Blended Masale ('blended-spices')
// 3. Dehydrated Veg & Fruit Powders ('dehydrated-powders')
// The first 8 strictly mirror the screenshot cards
const DEFAULT_14_PRODUCTS: SpiceProduct[] = [
  {
    id: 'prod-turmeric-01',
    name: 'Turmeric Powder (Haldi)',
    slug: 'turmeric-powder',
    image: SPICE_ASSETS.turmeric,
    tag: 'FEATURED',
    shortDesc: 'Pure & aromatic turmeric powder with natural golden color.',
    categorySlug: 'ground-spices',
    href: '/product/turmeric-powder',
    priceText: 'From ₹55',
    variantId: 'var-t-100',
  },
  {
    id: 'prod-chilly-01',
    name: 'Red Chilli Powder (Laal Mirch)',
    slug: 'red-chilli-powder',
    image: SPICE_ASSETS.redChilly,
    tag: 'FEATURED',
    shortDesc: 'Rich color and authentic spice for everyday cooking.',
    categorySlug: 'ground-spices',
    href: '/product/red-chilli-powder',
    priceText: 'From ₹65',
    variantId: 'var-c-100',
  },
  {
    id: 'prod-coriander-01',
    name: 'Coriander Powder (Dhaniya)',
    slug: 'coriander-powder',
    image: SPICE_ASSETS.coriander,
    tag: 'FEATURED',
    shortDesc: 'Freshly ground coriander with rich aroma and natural taste.',
    categorySlug: 'ground-spices',
    href: '/product/coriander-powder',
    priceText: 'From ₹50',
    variantId: 'var-cor-100',
  },
  {
    id: 'prod-cumin-01',
    name: 'Zeera Powder (Cumin Powder)',
    slug: 'zeera-powder',
    image: SPICE_ASSETS.cumin,
    tag: 'FEATURED',
    shortDesc: 'Aromatic cumin powder for authentic Indian flavor.',
    categorySlug: 'ground-spices',
    href: '/product/zeera-powder',
    priceText: 'From ₹75',
    variantId: 'var-cum-100',
  },
  {
    id: 'prod-garam-01',
    name: 'Shahi Garam Masala',
    slug: 'shahi-garam-masala',
    image: SPICE_ASSETS.garamMasala,
    tag: 'FEATURED',
    shortDesc: 'A perfect blend of premium Indian spices.',
    categorySlug: 'blended-spices',
    href: '/product/shahi-garam-masala',
    priceText: 'From ₹85',
    variantId: 'var-gm-100',
  },
  {
    id: 'prod-chat-01',
    name: 'Tangy Chaat Masala',
    slug: 'chat-masala',
    image: SPICE_ASSETS.chatMasala,
    tag: 'FEATURED',
    shortDesc: 'Chatpata and flavorful blend for snacks and street food.',
    categorySlug: 'blended-spices',
    href: '/product/chat-masala',
    priceText: 'From ₹65',
    variantId: 'var-cm-100',
  },
  {
    id: 'prod-beetroot-01',
    name: 'Pure Beetroot Powder (Chukandar)',
    slug: 'beetroot-powder',
    image: SPICE_ASSETS.beetrootPowder,
    tag: 'FEATURED',
    shortDesc: 'Natural beetroot powder packed with nutrients.',
    categorySlug: 'dehydrated-powders',
    href: '/product/beetroot-powder',
    priceText: 'From ₹95',
    variantId: 'var-bt-100',
  },
  {
    id: 'prod-tomato-01',
    name: 'Dehydrated Tomato Powder',
    slug: 'tomato-powder',
    image: SPICE_ASSETS.tomatoPowder,
    tag: 'FEATURED',
    shortDesc: 'Rich in natural taste and color for healthy cooking.',
    categorySlug: 'dehydrated-powders',
    href: '/product/tomato-powder',
    priceText: 'From ₹90',
    variantId: 'var-tm-100',
  },
  {
    id: 'prod-banana-01',
    name: 'Raw Banana Powder',
    slug: 'banana-powder',
    image: SPICE_ASSETS.bananaPowder,
    tag: 'FEATURED',
    shortDesc: 'High-fiber raw banana powder for digestive wellness & smoothies.',
    categorySlug: 'dehydrated-powders',
    href: '/product/banana-powder',
    priceText: 'From ₹95',
    variantId: 'var-bn-100',
  },
  {
    id: 'prod-garlic-01',
    name: 'Dehydrated Garlic Powder (Lehsun)',
    slug: 'garlic-powder',
    image: SPICE_ASSETS.garlicPowder,
    tag: 'FEATURED',
    shortDesc: 'Pungent cold-ground garlic powder with intense natural aroma.',
    categorySlug: 'dehydrated-powders',
    href: '/product/garlic-powder',
    priceText: 'From ₹80',
    variantId: 'var-gl-100',
  },
  {
    id: 'prod-carrot-01',
    name: 'Dehydrated Carrot Powder (Gajar)',
    slug: 'carrot-powder',
    image: SPICE_ASSETS.carrotPowder,
    tag: 'FEATURED',
    shortDesc: 'Naturally sweet carrot powder rich in Vitamin A & beta-carotene.',
    categorySlug: 'dehydrated-powders',
    href: '/product/carrot-powder',
    priceText: 'From ₹95',
    variantId: 'var-cr-100',
  },
  {
    id: 'prod-radish-01',
    name: 'Dehydrated White Radish Powder (Mooli)',
    slug: 'radish-powder',
    image: SPICE_ASSETS.radishPowder,
    tag: 'FEATURED',
    shortDesc: 'Pure dehydrated mooli powder rich in enzymes for healthy digestion.',
    categorySlug: 'dehydrated-powders',
    href: '/product/radish-powder',
    priceText: 'From ₹90',
    variantId: 'var-rd-100',
  },
  {
    id: 'prod-fruitchat-01',
    name: 'Special Fruit Chaat Masala',
    slug: 'fruit-chat-masala',
    image: SPICE_ASSETS.fruitChatMasala,
    tag: 'FEATURED',
    shortDesc: 'Sweet, tangy & zesty seasoning blend crafted for fruit salads.',
    categorySlug: 'blended-spices',
    href: '/product/fruit-chat-masala',
    priceText: 'From ₹70',
    variantId: 'var-fcm-100',
  },
  {
    id: 'prod-mango-01',
    name: 'Dry Mango Powder (Amchur)',
    slug: 'mango-powder',
    image: SPICE_ASSETS.mangoPowder,
    tag: 'FEATURED',
    shortDesc: 'Tart and sour sun-dried raw mango powder for tangy curries.',
    categorySlug: 'ground-spices',
    href: '/product/mango-powder',
    priceText: 'From ₹70',
    variantId: 'var-mp-100',
  },
]

// Realistic Botanical Leaf SVG for Ambient Background Decor
function RealisticLeaf({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="leafGradDark" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4A8F44" />
          <stop offset="50%" stopColor="#2D6A28" />
          <stop offset="100%" stopColor="#1B4D1A" />
        </linearGradient>
        <linearGradient id="leafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DB85A" />
          <stop offset="100%" stopColor="#387A32" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 C30 30 15 65 18 105 C20 125 35 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#leafGradDark)"
      />
      <path
        d="M50 10 C70 30 85 65 82 105 C80 125 65 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#leafGradLight)"
        opacity="0.95"
      />
      <path
        d="M50 10 Q50 85 50 155"
        stroke="#8FE073"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d="M50 35 Q35 45 28 55" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 40 Q65 50 72 60" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 65 Q32 75 24 90" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 70 Q68 80 76 95" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 95 Q35 108 28 122" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 100 Q65 112 72 125" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 155 Q49 165 46 172" stroke="#2D6A28" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// "From ₹55" -> 55 (only used by the built-in sample range, which has no numeric price)
function priceFromText(text?: string | null): number | null {
  const match = /(\d+(?:\.\d+)?)/.exec(text || '')
  return match ? Number(match[1]) : null
}

export function SpiceRangeSection({
  products = [],
  categories = [],
  useLiveProducts = false,
  content = HOME_DEFAULTS.spiceRange,
}: {
  content?: HomeContent['spiceRange']
  products?: LiveSpiceItem[]
  categories?: CategoryItem[]
  /** true: show only the products passed in (from the database). false: fall back to the built-in sample range. */
  useLiveProducts?: boolean
}) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all')
  const [showAll14, setShowAll14] = useState<boolean>(false)

  // Use shop page categories (from DB or fallback to shop categories)
  const resolvedCategories: CategoryItem[] =
    categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES

  // Build filter tabs: "All Products" + the shop categories (live mode: only those with a product to show)
  const tabCategories = useLiveProducts
    ? resolvedCategories.filter((c) =>
        products.some((p) => p.categorySlug === c.slug || (p.categoryId && p.categoryId === c.id))
      )
    : resolvedCategories
  const filterTabs = [
    { id: 'all', name: 'All Products', slug: 'all' },
    ...tabCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  ]

  // Merge database products with complete 14-product definitions if provided
  const combinedProducts: SpiceProduct[] = (useLiveProducts ? [] : DEFAULT_14_PRODUCTS).map((def) => {
    const liveMatch = products.find((p) => p.slug === def.slug || p.id === def.id)
    if (liveMatch) {
      return {
        ...def,
        id: liveMatch.id || def.id,
        name: liveMatch.name || def.name,
        image: liveMatch.image || def.image,
        priceText: liveMatch.priceText || def.priceText,
        variantId: liveMatch.variantId || def.variantId,
        shortDesc: liveMatch.shortDesc || def.shortDesc,
        categorySlug: liveMatch.categorySlug || def.categorySlug,
        categoryId: liveMatch.categoryId,
        href: liveMatch.href || `/product/${liveMatch.slug}`,
      }
    }
    return def
  })

  // Also include any extra live products from DB that are not in the default 14
  const extraProducts: SpiceProduct[] = products
    .filter((p) => useLiveProducts || !DEFAULT_14_PRODUCTS.some((def) => def.slug === p.slug || def.id === p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      tag: p.tag || 'Featured',
      shortDesc: p.shortDesc || '100% natural, premium cold-ground product.',
      categorySlug: p.categorySlug || 'ground-spices',
      categoryId: p.categoryId,
      href: `/product/${p.slug}`,
      priceText: p.priceText || 'In Stock',
      variantId: p.variantId || '',
      minPrice: p.minPrice ?? null,
      originalPrice: p.originalPrice ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
    }))

  const allAvailableProducts = [...combinedProducts, ...extraProducts]

  // Filter products strictly according to active shop category
  const filteredProducts = allAvailableProducts.filter((item) => {
    if (activeCategorySlug === 'all') return true
    return (
      item.categorySlug === activeCategorySlug ||
      (item.categoryId && item.categoryId === activeCategorySlug)
    )
  })

  // In 'All Products' tab, default view showcases the exact 8 cards from the design.
  // Clicking "View All 14 Products" expands to reveal all 14 cards seamlessly.
  const displayedProducts =
    activeCategorySlug === 'all' && !showAll14
      ? filteredProducts.slice(0, 8)
      : filteredProducts

  // Active category name for dynamic button text & shop link
  const activeCategoryObj = resolvedCategories.find((c) => c.slug === activeCategorySlug)

  return (
    <section className="relative overflow-hidden pt-8 pb-36 sm:py-12 lg:py-16 bg-[#FBF7EE]">
      {/* Studio Lighting & Warm Organic Background Gradients */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(240, 152, 25, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 92% 15%, rgba(224, 123, 12, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 8% 85%, rgba(224, 123, 12, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 92% 90%, rgba(20, 77, 41, 0.06) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Right Dried Kashmiri Chillies (flipped to hang from the top) */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply z-0 -scale-100 opacity-100">
        <CornerAccentImage
          kind="chillies"
          alt="Dried Kashmiri Chillies Accent"
          fill
          className="object-contain object-bottom-left"
          sizes="(max-width: 640px) 128px, (max-width: 768px) 256px, 384px"
          priority={false}
        />
      </div>

      {/* Decorative Corner Asset: Bottom Left Kashmiri Chillies & Spices */}
      <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply z-0 opacity-100">
        <CornerAccentImage
          kind="chillies"
          alt="Dried Kashmiri Chillies Accent"
          fill
          className="object-contain object-bottom-left"
          sizes="(max-width: 768px) 176px, 384px"
          priority={false}
        />
      </div>

      {/* Decorative Corner Asset: Top Left Dried Kashmiri Chillies (flipped to hang from the top) */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply z-0 -scale-y-100 opacity-100">
        <CornerAccentImage
          kind="chillies"
          alt="Dried Kashmiri Chillies Accent"
          fill
          className="object-contain object-bottom-left"
          sizes="(max-width: 640px) 128px, (max-width: 768px) 256px, 384px"
          priority={false}
        />
      </div>

      {/* Decorative Corner Asset: Bottom Right Spices & Herbal Accent */}
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply z-0 -scale-x-100 opacity-100">
        <CornerAccentImage
          kind="chillies"
          alt="Spices Corner Accent"
          fill
          className="object-contain object-bottom-left"
          sizes="(max-width: 768px) 176px, 384px"
          priority={false}
        />
      </div>

      {/* Mid-Left Floating Bay Leaf */}
      <div className="hidden lg:block absolute left-3 top-[46%] -translate-y-1/2 w-8 h-14 -rotate-15 opacity-75 pointer-events-none drop-shadow-sm z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>

      {/* Mid-Right Floating Bay Leaf */}
      <div className="hidden lg:block absolute right-3 top-[52%] -translate-y-1/2 w-8 h-14 rotate-40 opacity-75 pointer-events-none drop-shadow-sm z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>

      <div className="mx-auto max-w-[1330px] px-2.5 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header: Centered Pill, Serif Title, Clean Subtitle */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8 sm:mb-10">
          {/* 100% PURE & NATURAL Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-[#144D29] fill-[#144D29]/20" />
            <span>{content.badge}</span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#14361F]">
            {content.title}
          </h2>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-[#615147] max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* Category Filter Tabs: Exact categories from Shop Page */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 sm:px-0 mb-8 sm:mb-12">
          {filterTabs.map((tab) => {
            const isActive = activeCategorySlug === tab.slug
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategorySlug(tab.slug)
                  setShowAll14(false)
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-2 rounded-[5px] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-[#E07B0C] text-white shadow-md shadow-[#E07B0C]/25'
                    : 'bg-white/90 hover:bg-white text-[#4A3B32] hover:text-[#14361F] border border-[#E8DFD5] hover:border-[#E07B0C]/40 shadow-xs'
                }`}
              >
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {displayedProducts.length === 0 && (
          <p className="py-10 text-center text-sm text-[#7A6458]">
            {content.emptyText}
          </p>
        )}

        {/* Product Cards Grid: 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              shortDescription={product.shortDesc}
              featuredImage={product.image}
              minPrice={product.minPrice ?? priceFromText(product.priceText)}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              variantId={product.variantId || null}
            />
          ))}
        </div>

        {/* View All Products Centered Button Flanked by Fresh Botanical Leaves */}
        <div className="mt-6 sm:mt-14 text-center relative flex items-center justify-center">
          {/* Left Decorative Botanical Leaf */}
          <div className="hidden sm:block absolute right-[calc(50%+145px)] lg:right-[calc(50%+170px)] w-9 h-14 -rotate-35 opacity-90 pointer-events-none drop-shadow-sm">
            <RealisticLeaf className="w-full h-full" />
          </div>

          {activeCategorySlug === 'all' ? (
            !showAll14 && filteredProducts.length > 8 ? (
              <button
                type="button"
                onClick={() => setShowAll14(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-[5px] bg-[#14361F] hover:bg-[#0D2515] px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 z-10 cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                <span>View All {filteredProducts.length} Products</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2.5 rounded-[5px] bg-[#14361F] hover:bg-[#0D2515] px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 z-10"
              >
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                <span>{content.catalogButtonText}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            )
          ) : (
            <Link
              href={`/shop?category=${activeCategorySlug}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#14361F] hover:bg-[#0D2515] px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 z-10"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>
                View {activeCategoryObj?.name || 'Category'} in Shop
              </span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          )}

          {/* Right Decorative Botanical Leaf */}
          <div className="hidden sm:block absolute left-[calc(50%+145px)] lg:left-[calc(50%+170px)] w-9 h-14 rotate-35 opacity-90 pointer-events-none drop-shadow-sm">
            <RealisticLeaf className="w-full h-full" />
          </div>
        </div>

      </div>
    </section>
  )
}
