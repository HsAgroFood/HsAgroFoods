'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Sparkles, Star, ShoppingCart, Check, Heart, Loader2 } from 'lucide-react'
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
  const { refreshCart } = useCart()
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

  return (
    <Link
      href={`/product/${slug}`}
      className="group relative flex flex-col bg-white rounded-[5px] shadow-[0_2px_12px_rgba(20,54,31,0.04)] border border-[#EDE4D9] hover:border-[#E07B0C]/60 overflow-hidden hover:shadow-[0_14px_36px_rgba(20,54,31,0.09)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full"
    >
      {/* Image Container with Warm Glow & Rounded-[5px] */}
      <div
        className={`relative ${
          compact ? 'aspect-[4/3] m-1.5 sm:m-2' : 'aspect-square m-2 sm:m-2.5'
        } bg-[#FAF6F0] rounded-[5px] overflow-hidden`}
      >
        {/* 100% Pure Ribbon Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 inline-flex items-center gap-1 rounded-[5px] bg-[#14361F]/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-[#F09819] uppercase shadow-xs">
          <Sparkles className="w-2.5 h-2.5" />
          <span>100% Pure</span>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            className={`absolute ${
              compact ? 'top-6 left-1.5 sm:top-7 sm:left-2' : 'top-8 left-2 sm:top-8.5 sm:left-2'
            } z-10 inline-flex items-center rounded-[5px] bg-[#227B44] text-white px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-extrabold tracking-wider uppercase shadow-xs`}
          >
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Wishlist Heart Toggle Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-[5px] bg-white/95 hover:bg-white text-stone-500 hover:text-[#E07B0C] border border-[#EDE4D9]/80 shadow-xs flex items-center justify-center transition-all duration-200 active:scale-115 cursor-pointer"
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
            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
          compact ? 'p-2 sm:p-2.5 pt-0.5 sm:pt-1' : 'p-3 sm:p-4 pt-1 sm:pt-1.5'
        }`}
      >
        {/* Rating / New Badge */}
        <div className={`flex items-center gap-1 mb-1 ${compact ? 'min-h-[16px]' : 'min-h-[22px]'}`}>
          {hasReviews ? (
            <>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{rating!.toFixed(1)}</span>
              </span>
              <span className="text-[10px] text-[#8C766E]">({reviewCount})</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[5px] bg-stone-50 text-stone-600 border border-stone-200 text-[9.5px] font-medium">
              <Star className="w-2.5 h-2.5 text-stone-400" />
              <span>Natural</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3
          className={`font-serif ${
            compact ? 'text-xs sm:text-[13.5px]' : 'text-sm sm:text-base lg:text-[17px]'
          } font-bold text-[#14361F] group-hover:text-[#E07B0C] transition-colors line-clamp-1 leading-snug`}
        >
          {name}
        </h3>

        {/* Short Description: Exactly 2 lines only */}
        {shortDescription && (
          <p
            className={`mt-1 text-[#6E5951] line-clamp-2 leading-relaxed mb-2 ${
              compact
                ? 'text-[11px] sm:text-xs min-h-[1.85rem]'
                : 'text-xs min-h-[2rem]'
            }`}
          >
            {shortDescription}
          </p>
        )}

        {/* Card Footer: Starting Price & Animated Add-to-Cart Button */}
        <div
          className={`mt-auto ${
            compact ? 'pt-2 sm:pt-2.5' : 'pt-3 sm:pt-3.5'
          } flex items-center justify-between border-t border-[#F0E6DA]`}
        >
          <div className="flex flex-col">
            <span className="text-[8.5px] sm:text-[9.5px] text-[#8C766E] uppercase tracking-wider font-semibold">
              {compact ? 'Price' : 'Starting from'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`${
                  compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg lg:text-xl'
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

          {/* Action Button with Add to Cart + Smooth Morphing Animation */}
          <div className="relative">
            {/* Animated Floating Pop-up Badge on Success */}
            {addedSuccess === id && (
              <span className="absolute -top-7 right-0 bg-[#14361F] text-[#FAF7F2] border border-[#E07B0C]/40 text-[9px] font-bold py-0.5 px-2 rounded-[5px] shadow-lg animate-bounce pointer-events-none whitespace-nowrap z-30 flex items-center gap-1">
                ✓ Added!
              </span>
            )}

            {/* Ripple Pulse on Added */}
            {addedSuccess === id && (
              <span className="absolute inset-0 rounded-[5px] bg-emerald-500/40 animate-ping pointer-events-none" />
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!variantId || addingToCart === id}
              aria-label={`Add ${name} to cart`}
              className={`relative z-20 flex ${
                compact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-9 sm:w-9'
              } items-center justify-center rounded-[5px] transition-all duration-300 shadow-xs cursor-pointer active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${
                addedSuccess === id
                  ? 'bg-emerald-600 text-white border border-emerald-600 scale-105 shadow-md'
                  : 'bg-[#FAF3EB] text-[#E07B0C] border border-[#F09819]/40 hover:bg-[#E07B0C] hover:text-white hover:scale-105'
              }`}
            >
              {addingToCart === id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07B0C]" />
              ) : addedSuccess === id ? (
                <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-200" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
