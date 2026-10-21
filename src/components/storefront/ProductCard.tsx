'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Sparkles, Star, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { addToCart } from '@/actions/cart'

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
}: ProductCardProps) {
  const { refreshCart } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null)

  const hasDiscount = originalPrice && minPrice && originalPrice > minPrice
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - minPrice) / originalPrice) * 100)
    : null

  const hasReviews = Boolean(reviewCount && reviewCount > 0 && rating && rating > 0)

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
        setTimeout(() => setAddedSuccess(null), 2000)
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
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#E8DFD5] hover:border-[#C89B65]/70 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* 100% Pure Ribbon Badge */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#520C12]/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-[#E5AD58] uppercase shadow-sm">
        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span>100% Pure</span>
      </div>

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 inline-flex items-center rounded-full bg-emerald-600 text-white px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
          <span>{discountPercent}% OFF</span>
        </div>
      )}

      {/* Image Container with Warm Glow */}
      <div className="relative aspect-square bg-[#FAF6F2] overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6F2]">
            <span className="text-stone-400 text-xs font-medium">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-5">
        
        {/* Rating / New Badge */}
        <div className="flex items-center gap-1.5 mb-1.5 min-h-[22px]">
          {hasReviews ? (
            <>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{rating!.toFixed(1)}</span>
              </span>
              <span className="text-[11px] text-[#8C766E]">
                ({reviewCount})
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-50 text-stone-600 border border-stone-200 text-[11px] font-medium">
              <Star className="w-3 h-3 text-stone-400" />
              <span>New</span>
            </span>
          )}
        </div>

        <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-[#2A1612] group-hover:text-[#7B111A] transition-colors line-clamp-1">
          {name}
        </h3>

        {shortDescription && (
          <p className="mt-1 text-xs text-[#6E5951] line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t border-[#F2ECE6]">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-[#8C766E] uppercase tracking-wider font-semibold">
              Starting from
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#7B111A]">
                {minPrice !== null ? `₹${minPrice}` : 'Check options'}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action Button with Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!variantId || addingToCart === id}
            aria-label={`Add ${name} to cart`}
            className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#FAF3EB] text-[#7B111A] border border-[#C89B65]/30 hover:bg-[#7B111A] hover:text-white hover:scale-105 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {addingToCart === id ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : addedSuccess === id ? (
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
