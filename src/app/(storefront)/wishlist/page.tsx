'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  ShoppingCart,
  Check,
  Trash2,
  Heart,
  ArrowRight,
  Loader2,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { addToCart } from '@/actions/cart'
import { removeWishlistProduct } from '@/lib/wishlist'

const WISHLIST_STORAGE_KEY = 'hs_agro_wishlist'

export type WishlistItem = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  featuredImage?: string | null
  minPrice: number | null
  originalPrice?: number | null
  rating?: number | null
  reviewCount?: number | null
  variantId?: string | null
}

export default function WishlistPage() {
  const { refreshCart } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null)
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null)
  const [isAddingAll, setIsAddingAll] = useState(false)
  const [addAllSuccess, setAddAllSuccess] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Load wishlist items from localStorage & resolve product data
  const loadWishlist = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return

      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (!stored) {
        setWishlistItems([])
        setLoading(false)
        return
      }

      const parsed: Record<string, boolean> = JSON.parse(stored)
      const savedKeys = Object.keys(parsed).filter((key) => parsed[key] === true)

      if (savedKeys.length === 0) {
        setWishlistItems([])
        setLoading(false)
        return
      }

      // 1. Prepare Fallback Catalog Mapping
      const fallbackList: WishlistItem[] = Object.values(FALLBACK_PRODUCTS).map((p) => {
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

      // 2. Try fetching dynamic products from Supabase (separate UUIDs from slugs to prevent Postgres UUID parse errors)
      let dbItems: WishlistItem[] = []
      try {
        const supabase = createClient()
        const isUuid = (val: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

        const uuidKeys = savedKeys.filter(isUuid)
        const slugKeys = savedKeys.filter((k) => !isUuid(k))

        const fetchResults: any[] = []

        if (uuidKeys.length > 0) {
          const { data: byId } = await supabase
            .from('products')
            .select(`
              id,
              slug,
              name,
              short_description,
              featured_image_url,
              average_rating,
              review_count,
              product_variants (
                id,
                variant_name,
                price,
                original_price,
                stock_quantity,
                is_active
              )
            `)
            .in('id', uuidKeys)
            .eq('is_active', true)

          if (byId) fetchResults.push(...byId)
        }

        if (slugKeys.length > 0) {
          const { data: bySlug } = await supabase
            .from('products')
            .select(`
              id,
              slug,
              name,
              short_description,
              featured_image_url,
              average_rating,
              review_count,
              product_variants (
                id,
                variant_name,
                price,
                original_price,
                stock_quantity,
                is_active
              )
            `)
            .in('slug', slugKeys)
            .eq('is_active', true)

          if (bySlug) fetchResults.push(...bySlug)
        }

        if (fetchResults.length > 0) {
          dbItems = fetchResults.map((p: any) => {
            const activeVariants = p.product_variants?.filter((v: any) => v.is_active) || []
            const prices = activeVariants.map((v: any) => v.price)
            const minPrice = prices.length > 0 ? Math.min(...prices) : null
            const minVariant = activeVariants.find((v: any) => v.price === minPrice)

            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              shortDescription: p.short_description,
              featuredImage: p.featured_image_url,
              minPrice,
              originalPrice: minVariant?.original_price || null,
              rating: Number(p.average_rating) || 0,
              reviewCount: Number(p.review_count) || 0,
              variantId: minVariant?.id || null,
            }
          })
        }
      } catch {
        // Fallback gracefully to static catalog
      }

      // 3. Resolve items for all saved keys (matching by id or slug)
      const resolvedMap = new Map<string, WishlistItem>()

      for (const key of savedKeys) {
        // Check in Supabase items first
        const fromDb = dbItems.find((p) => p.id === key || p.slug === key)
        if (fromDb) {
          resolvedMap.set(fromDb.id, fromDb)
          continue
        }

        // Check in Fallback items
        const fromFallback = fallbackList.find((p) => p.id === key || p.slug === key)
        if (fromFallback) {
          resolvedMap.set(fromFallback.id, fromFallback)
        }
      }

      setWishlistItems(Array.from(resolvedMap.values()))
    } catch (err) {
      console.error('Failed to load wishlist:', err)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()

    const handleWishlistUpdated = () => {
      loadWishlist()
    }

    window.addEventListener('hs_wishlist_updated', handleWishlistUpdated)
    window.addEventListener('storage', handleWishlistUpdated)

    return () => {
      window.removeEventListener('hs_wishlist_updated', handleWishlistUpdated)
      window.removeEventListener('storage', handleWishlistUpdated)
    }
  }, [loadWishlist])

  // Remove a single product from wishlist
  const handleRemoveFromWishlist = (e: React.MouseEvent, item: WishlistItem) => {
    e.preventDefault()
    e.stopPropagation()

    setRemovingId(item.id)

    setTimeout(() => {
      removeWishlistProduct(item.id, item.slug)
      setWishlistItems((prev) => prev.filter((p) => p.id !== item.id && p.slug !== item.slug))
      setRemovingId(null)
    }, 200)
  }

  // Clear all items from wishlist
  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to remove all items from your wishlist?')) {
      return
    }

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({}))
      window.dispatchEvent(new Event('hs_wishlist_updated'))
      setWishlistItems([])
    } catch (err) {
      console.error('Failed to clear wishlist:', err)
    }
  }

  // Add individual product to cart
  const handleAddToCart = async (e: React.MouseEvent, item: WishlistItem) => {
    e.preventDefault()
    e.stopPropagation()

    if (!item.variantId) return

    setAddingToCartId(item.id)

    try {
      const result = await addToCart(item.variantId, 1)
      if (result.success) {
        refreshCart()
        setAddedSuccessId(item.id)
        setTimeout(() => setAddedSuccessId(null), 2200)
      } else {
        alert(result.error || 'Failed to add to cart')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setAddingToCartId(null)
    }
  }

  // Add all items in wishlist to cart
  const handleAddAllToCart = async () => {
    const validItems = wishlistItems.filter((item) => item.variantId)
    if (validItems.length === 0) return

    setIsAddingAll(true)
    let addedCount = 0

    try {
      for (const item of validItems) {
        if (item.variantId) {
          const res = await addToCart(item.variantId, 1)
          if (res.success) addedCount++
        }
      }

      if (addedCount > 0) {
        refreshCart()
        setAddAllSuccess(true)
        setTimeout(() => setAddAllSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Error adding all to cart:', err)
    } finally {
      setIsAddingAll(false)
    }
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] relative overflow-hidden">
      {/* ── Ambient Background Lighting Gradients (Matching Shop & Home) ── */}
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

      {/* ── Main Container with py-10 sm:py-14 lg:py-16 ── */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10 py-10 sm:py-14 lg:py-16">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A6458] mb-6 sm:mb-8">
          <Link href="/" className="hover:text-[#E07B0C] transition-colors">
            Home
          </Link>
          <span className="text-[#BBA89B]">/</span>
          <Link href="/shop" className="hover:text-[#E07B0C] transition-colors">
            Shop
          </Link>
          <span className="text-[#BBA89B]">/</span>
          <span className="text-[#14361F] font-bold">Wishlist</span>
        </nav>

        {/* ── Hero Header Banner (Consistent Typography & Color) ── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>SAVED SPICES &amp; POWDERS • KITCHEN WISHLIST</span>
          </div>

          {/* Main Serif Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#14361F] leading-[1.2]">
            Your Kitchen <span className="text-[#E07B0C]">Wishlist</span>
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm lg:text-base text-[#615147] max-w-2xl mx-auto leading-relaxed font-medium">
            All your saved 100% pure cold-ground spices, royal aromatic blends, and dehydrated fruit &amp; vegetable powders in one place.
          </p>

          {/* 4 Mini Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-[11px] sm:text-xs text-[#5A433B] font-semibold">
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

        {/* ── Success Banner for "Add All to Cart" ── */}
        {addAllSuccess && (
          <div className="mb-6 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] p-3.5 text-center text-xs sm:text-sm font-bold text-[#144D29] flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>All wishlisted items have been added to your cart successfully!</span>
          </div>
        )}

        {/* ── Content Area: Loading / Empty State / Products Grid ── */}
        {loading ? (
          /* Loading Skeleton Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[5px] border border-[#EDE4D9] p-3 sm:p-4 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-stone-200/70 rounded-[5px]" />
                <div className="h-4 bg-stone-200/70 rounded-[5px] w-3/4" />
                <div className="h-3 bg-stone-200/50 rounded-[5px] w-1/2" />
                <div className="h-8 bg-stone-200/50 rounded-[5px] mt-4" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          /* ── Modern Empty Wishlist Card ── */
          <div className="text-center py-12 sm:py-16 px-6 bg-white rounded-[5px] border border-[#EDE4D9] shadow-xs max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] mx-auto shadow-2xs">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#E07B0C] stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#6E5951] max-w-md mx-auto leading-relaxed">
                Looks like you haven&apos;t saved any pure spices or powders yet. Tap the heart icon on any product in our shop to save your kitchen favorites here.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#E07B0C] hover:bg-[#C86A08] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Explore All Spices</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#FAF3EB] hover:bg-[#F2E8DC] text-[#14361F] border border-[#EDE4D9] px-6 py-3 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <span>Our Purity Process</span>
              </Link>
            </div>

            {/* 3 Value Pillars */}
            <div className="pt-6 border-t border-[#F0E6DA] grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-base sm:text-lg font-extrabold text-[#14361F]">100%</p>
                <p className="text-[10px] sm:text-xs text-[#7A6458]">Pure &amp; Natural</p>
              </div>
              <div className="border-x border-[#F0E6DA]">
                <p className="text-base sm:text-lg font-extrabold text-[#14361F]">&lt; 40°C</p>
                <p className="text-[10px] sm:text-xs text-[#7A6458]">Cold-Ground</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-extrabold text-[#14361F]">₹499+</p>
                <p className="text-[10px] sm:text-xs text-[#7A6458]">Free Shipping</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Wishlist Active Grid with Header Actions ── */
          <div>
            {/* Header Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EDE4D9]">
              <div className="text-xs sm:text-sm text-[#5A433B]">
                Showing <strong className="text-[#14361F] font-extrabold">{wishlistItems.length}</strong> saved {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Add All to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  disabled={isAddingAll}
                  className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#E07B0C] hover:bg-[#C86A08] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAddingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                  <span>{isAddingAll ? 'Adding to Cart...' : 'Add All to Cart'}</span>
                </button>

                {/* Clear All Wishlist Button */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 rounded-[5px] bg-white hover:bg-rose-50 border border-[#EDE4D9] hover:border-rose-300 px-3 py-1.5 text-xs font-semibold text-[#8C766E] hover:text-rose-600 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>

                <Link
                  href="/shop"
                  className="text-xs font-bold text-[#14361F] hover:text-[#E07B0C] underline transition-colors ml-1 hidden sm:inline"
                >
                  Continue Shopping →
                </Link>
              </div>
            </div>

            {/* Product Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
              {wishlistItems.map((product) => {
                const hasDiscount = product.originalPrice && product.minPrice && product.originalPrice > product.minPrice
                const discountPercent = hasDiscount
                  ? Math.round(((product.originalPrice! - product.minPrice!) / product.originalPrice!) * 100)
                  : null
                const isRemoving = removingId === product.id

                return (
                  <div
                    key={product.id}
                    className={`group relative flex flex-col bg-white rounded-[5px] shadow-[0_2px_12px_rgba(20,54,31,0.04)] border border-[#EDE4D9] hover:border-[#E07B0C]/60 overflow-hidden hover:shadow-[0_14px_36px_rgba(20,54,31,0.09)] transition-all duration-300 transform hover:-translate-y-1 h-full ${
                      isRemoving ? 'opacity-40 scale-95 transition-all duration-200' : ''
                    }`}
                  >
                    <Link href={`/product/${product.slug}`} className="flex flex-col flex-1">
                      {/* Image Container with Rounded-[5px] & Warm Glow */}
                      <div className="relative aspect-square m-2 sm:m-2.5 bg-[#FAF6F0] rounded-[5px] overflow-hidden">
                        {/* 100% Pure Ribbon Badge */}
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 inline-flex items-center gap-1 rounded-[5px] bg-[#14361F]/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-[#F09819] uppercase shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>100% Pure</span>
                        </div>

                        {/* Discount Badge */}
                        {hasDiscount && (
                          <div className="absolute top-8 left-2 sm:top-8.5 sm:left-2 z-10 inline-flex items-center rounded-[5px] bg-[#227B44] text-white px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-extrabold tracking-wider uppercase shadow-xs">
                            <span>{discountPercent}% OFF</span>
                          </div>
                        )}

                        {/* ── DELETE BUTTON IN PLACE OF WISHLIST HEART ── */}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFromWishlist(e, product)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          title="Remove from wishlist"
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-white/95 hover:bg-rose-50 text-[#8C766E] hover:text-rose-600 border border-[#EDE4D9] hover:border-rose-300 shadow-2xs hover:shadow-xs flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer group/del"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/del:scale-110 transition-transform" />
                        </button>

                        {/* Featured Product Image */}
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6F0]">
                            <span className="text-stone-400 text-xs font-medium">No Image</span>
                          </div>
                        )}

                        {/* Subtle Vignette on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      {/* Content Container */}
                      <div className="flex flex-col flex-1 p-3 sm:p-4 pt-2 sm:pt-2.5">
                        {/* Product Title */}
                        <h3 className="font-serif text-sm sm:text-base lg:text-[17px] font-bold text-[#14361F] group-hover:text-[#E07B0C] transition-colors line-clamp-1 leading-snug">
                          {product.name}
                        </h3>

                        {/* Short Description: Exactly 2 lines only */}
                        {product.shortDescription && (
                          <p className="mt-1 text-[#6E5951] line-clamp-2 leading-relaxed mb-2 text-xs min-h-[2rem]">
                            {product.shortDescription}
                          </p>
                        )}

                        {/* Card Footer: Starting Price & Animated Add-to-Cart Button */}
                        <div className="mt-auto pt-3 sm:pt-3.5 flex items-center justify-between border-t border-[#F0E6DA]">
                          <div className="flex flex-col">
                            <span className="text-[8.5px] sm:text-[9.5px] text-[#8C766E] uppercase tracking-wider font-semibold">
                              Starting from
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#E07B0C]">
                                {product.minPrice !== null ? `₹${product.minPrice}` : 'Check'}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button with Add to Cart + Smooth Morphing Animation */}
                          <div className="relative">
                            {/* Animated Floating Pop-up Badge on Success */}
                            {addedSuccessId === product.id && (
                              <span className="absolute -top-7 right-0 bg-[#14361F] text-[#FAF7F2] border border-[#E07B0C]/40 text-[9px] font-bold py-0.5 px-2 rounded-[5px] shadow-lg animate-bounce pointer-events-none whitespace-nowrap z-30 flex items-center gap-1">
                                ✓ Added!
                              </span>
                            )}

                            {/* Ripple Pulse on Added */}
                            {addedSuccessId === product.id && (
                              <span className="absolute inset-0 rounded-[5px] bg-emerald-500/40 animate-ping pointer-events-none" />
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={!product.variantId || addingToCartId === product.id}
                              aria-label={`Add ${product.name} to cart`}
                              className={`relative z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-[5px] transition-all duration-300 shadow-xs cursor-pointer active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${
                                addedSuccessId === product.id
                                  ? 'bg-emerald-600 text-white border border-emerald-600 scale-105 shadow-md'
                                  : 'bg-[#FAF3EB] text-[#E07B0C] border border-[#F09819]/40 hover:bg-[#E07B0C] hover:text-white hover:scale-105'
                              }`}
                            >
                              {addingToCartId === product.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07B0C]" />
                              ) : addedSuccessId === product.id ? (
                                <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-200" />
                              ) : (
                                <ShoppingCart className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

