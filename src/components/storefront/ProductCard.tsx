'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Star, ShoppingCart, Check, Heart, Leaf, Loader2, Zap } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { addToCart } from '@/actions/cart'
import {
  isProductWishlisted,
  toggleWishlistProduct,
  getWishlistMap,
} from '@/lib/wishlist'

export type ProductCardProps = {
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
  compact?: boolean
}

export function ProductCard({
  id,
  slug,
  name,
  shortDescription,
  featuredImage,
  minPrice,
  originalPrice,
  rating,
  reviewCount,
  variantId,
  compact = false,
}: ProductCardProps) {
  const router = useRouter()
  const { refreshCart } = useCart()
  const [buyingNow, setBuyingNow] = useState(false)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Initialize and synchronize wishlist state with localStorage & custom events
  useEffect(() => {
    const syncWishlist = () => {
      const map = getWishlistMap()
      setIsWishlisted(isProductWishlisted(map, id, slug))
    }

    syncWishlist()
    window.addEventListener('hs_wishlist_updated', syncWishlist)
    window.addEventListener('storage', syncWishlist)

    return () => {
      window.removeEventListener('hs_wishlist_updated', syncWishlist)
      window.removeEventListener('storage', syncWishlist)
    }
  }, [id, slug])

  // Toggle wishlist state
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = toggleWishlistProduct(id, slug)
    setIsWishlisted(next)
  }

  const hasDiscount = originalPrice && minPrice && originalPrice > minPrice
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - minPrice) / originalPrice) * 100)
    : null

  const hasReviews = Boolean(reviewCount && reviewCount > 0 && rating && rating > 0)

  // Quick Add to Cart with live feedback and bounce animation
  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) return

    setAddingToCart(id)

    try {
      const result = await addToCart(variantId, 1)

      if (result.success) {
        refreshCart()
        setAddedSuccess(id)
        setTimeout(() => setAddedSuccess(null), 2200)
      } else {
        alert(result.error || 'Failed to add to cart')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  // Buy Now: put one pack in the cart, then go straight to checkout (same flow as the product page)
  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId || buyingNow) return
    setBuyingNow(true)

    try {
      const result = await addToCart(variantId, 1)

      if (result.success) {
        refreshCart()
        router.push('/checkout')
        return
      }
      alert(result.error || 'Failed to add to cart')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart')
    }
    setBuyingNow(false)
  }

  return (
    <Link
      href={`/product/${slug}`}
      className="group relative flex flex-col bg-gradient-to-b from-white to-[#FFFBF4] rounded-2xl shadow-[0_4px_16px_rgba(20,54,31,0.06)] border border-[#EDE4D9] hover:border-[#E07B0C]/50 overflow-hidden hover:shadow-[0_20px_44px_rgba(20,54,31,0.14)] transition-all duration-500 transform hover:-translate-y-1.5 cursor-pointer h-full"
    >
      {/* Image Container with Warm Glow & Rounded-[5px] */}
      <div
        className={`relative ${
          compact ? 'aspect-[4/3] m-1.5 sm:m-2' : 'aspect-[5/4] sm:aspect-square m-1.5 sm:m-2.5'
        } bg-[#FAF6F0] rounded-xl overflow-hidden`}
      >
        {/* Discount badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col items-start gap-1">
          {hasDiscount && (
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#E07B0C] to-[#F09819] text-white px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8.5px] sm:text-[9.5px] font-extrabold tracking-wider uppercase shadow-sm">
              <span>{discountPercent}% OFF</span>
            </div>
          )}
        </div>

        {/* Wishlist Heart Toggle Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-stone-500 hover:text-[#E07B0C] border border-white/60 shadow-md flex items-center justify-center transition-all duration-200 active:scale-110 cursor-pointer"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 ${
              isWishlisted
                ? 'fill-[#E07B0C] text-[#E07B0C] scale-110'
                : 'text-[#8C766E] hover:text-[#E07B0C]'
            }`}
          />
        </button>

        {/* Featured Product Image */}
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
      <div
        className={`flex flex-col flex-1 ${
          compact ? 'p-2 sm:p-2.5 pt-0.5 sm:pt-1' : 'p-2.5 sm:p-4 pt-0.5 sm:pt-1.5'
        }`}
      >
        {/* Rating / New Badge */}
        <div className={`flex items-center gap-1 mb-0.5 sm:mb-1 ${compact ? 'min-h-[16px]' : 'min-h-[18px] sm:min-h-[22px]'}`}>
          {hasReviews ? (
            <>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{rating!.toFixed(1)}</span>
              </span>
              <span className="text-[10px] text-[#8C766E]">({reviewCount})</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#144D29] border border-[#CFE4D4] text-[9.5px] font-bold">
              <Leaf className="w-2.5 h-2.5 text-[#4E8D42]" />
              <span>Natural</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3
          className={`font-serif ${
            compact ? 'text-xs sm:text-[13.5px]' : 'text-[13px] sm:text-base lg:text-[17px]'
          } font-bold text-[#14361F] group-hover:text-[#E07B0C] transition-colors line-clamp-2 sm:line-clamp-1 leading-snug mb-1.5 sm:mb-0`}
        >
          {name}
        </h3>

        {/* Short Description: a single line, cut with "…" when longer; hidden on phones (title only) */}
        {shortDescription && (
          <p
            title={shortDescription}
            className={`hidden sm:block mt-1 mb-2 truncate text-[#6E5951] leading-relaxed ${
              compact ? 'text-[11px] sm:text-xs' : 'text-xs'
            }`}
          >
            {shortDescription}
          </p>
        )}

        {/* Card Footer: price, then Add-to-cart + Buy Now */}
        <div className={`mt-auto ${compact ? 'pt-2 sm:pt-2.5' : 'pt-2 sm:pt-3.5'} border-t border-dashed border-[#EBDFCC]`}>
          <div className="flex flex-col">
            <span className="text-[8.5px] sm:text-[9.5px] text-[#8C766E] uppercase tracking-wider font-semibold">
              {compact ? 'Price' : 'Starting from'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`${
                  compact ? 'text-sm sm:text-base' : 'text-[15px] sm:text-lg lg:text-xl'
                } font-extrabold text-[#E07B0C]`}
              >
                {minPrice !== null ? `₹${minPrice}` : 'Check'}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-1.5 sm:gap-2 ${compact ? 'mt-2' : 'mt-1.5 sm:mt-3'}`}>
            {/* Add to cart (icon button) */}
            <div className="relative shrink-0">
              {/* Animated floating pop-up badge on success */}
              {addedSuccess === id && (
                <span className="absolute -top-7 left-0 bg-[#14361F] text-[#FAF7F2] border border-[#E07B0C]/40 text-[9px] font-bold py-0.5 px-2 rounded-full shadow-lg animate-bounce pointer-events-none whitespace-nowrap z-30 flex items-center gap-1">
                  ✓ Added!
                </span>
              )}

              {addedSuccess === id && (
                <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!variantId || addingToCart === id || buyingNow}
                aria-label={`Add ${name} to cart`}
                title="Add to cart"
                className={`relative z-20 flex ${
                  compact ? 'h-8 w-8' : 'h-8 w-8 sm:h-10 sm:w-10'
                } items-center justify-center rounded-full border-2 transition-all duration-300 cursor-pointer active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${
                  addedSuccess === id
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-[#144D29] text-[#144D29] bg-white hover:bg-[#144D29] hover:text-white'
                }`}
              >
                {addingToCart === id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : addedSuccess === id ? (
                  <Check className="w-4 h-4 animate-in zoom-in-50 duration-200" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!variantId || buyingNow || addingToCart === id}
              aria-label={`Buy ${name} now`}
              className={`relative z-20 flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07B0C] to-[#F09819] font-bold text-white shadow-md shadow-[#E07B0C]/25 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#E07B0C]/35 hover:brightness-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                compact ? 'h-8 text-[11px]' : 'h-8 text-xs sm:h-10 sm:text-sm'
              }`}
            >
              {buyingNow ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-white" />
              )}
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
