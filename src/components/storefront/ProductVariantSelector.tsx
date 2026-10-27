'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { addToCart } from '@/actions/cart'
import { useCart } from '@/contexts/CartContext'

type Variant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
  is_active: boolean
}

export function ProductVariantSelector({ variants }: { variants: Variant[] }) {
  // Deduplicate by variant_name to ensure clean UI
  const uniqueMap = new Map<string, Variant>()
  variants
    .filter(v => v.is_active && v.stock_quantity > 0)
    .forEach(v => {
      if (!uniqueMap.has(v.variant_name)) {
        uniqueMap.set(v.variant_name, v)
      }
    })

  const activeVariants = Array.from(uniqueMap.values())
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(activeVariants.length > 0 ? activeVariants[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const router = useRouter()
  const { refreshCart } = useCart()

  if (activeVariants.length === 0) {
    return (
      <div className="py-4">
        <span className="text-xl font-bold text-gray-500">Out of Stock</span>
        <button disabled className="mt-6 w-full rounded-full bg-gray-300 py-3.5 px-8 text-white font-bold cursor-not-allowed">
          Sold Out
        </button>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setIsAdding(true)
    
    const result = await addToCart(selectedVariant.id, quantity)
    
    if (result.success) {
      setAddedSuccess(true)
      refreshCart()
      setTimeout(() => setAddedSuccess(false), 2000)
    } else {
      alert(result.error || 'Failed to add to cart')
    }
    
    setIsAdding(false)
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) return
    setIsBuying(true)
    
    const result = await addToCart(selectedVariant.id, quantity)
    
    if (result.success) {
      refreshCart()
      router.push('/checkout')
    } else {
      alert(result.error || 'Failed to add to cart')
      setIsBuying(false)
    }
  }

  return (
    <div className="mt-2.5 sm:mt-6">
      {/* Price & Savings Display (Compact on mobile) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 sm:mb-5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FDF9F3] border border-[#E8DFD5]">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl xs:text-3xl sm:text-4xl font-black text-[#E07B0C]">₹{selectedVariant?.price}</span>
          {selectedVariant?.original_price && selectedVariant.original_price > selectedVariant.price && (
            <span className="text-sm sm:text-lg text-stone-400 line-through">₹{selectedVariant.original_price}</span>
          )}
        </div>

        {selectedVariant?.original_price && selectedVariant.original_price > selectedVariant.price && (
          <span className="px-2 py-0.5 rounded-full bg-[#F09819]/20 border border-[#F09819]/40 text-[10px] sm:text-xs font-bold text-[#8A5A12] uppercase tracking-wide">
            Save ₹{selectedVariant.original_price - selectedVariant.price} ({Math.round(((selectedVariant.original_price - selectedVariant.price) / selectedVariant.original_price) * 100)}% OFF)
          </span>
        )}
        <span className="text-[11px] sm:text-xs text-stone-500 w-full sm:w-auto font-medium">Inclusive of all taxes</span>
      </div>

      {/* Variant Selection (Packet Sizes - Compact Quick Pills) */}
      {activeVariants.length > 1 && (
        <div className="mb-2.5 sm:mb-5">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#8C7567]">Select Pack Size</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#E07B0C]">Selected: {selectedVariant?.variant_name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {activeVariants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  type="button"
                  className={`py-1.5 px-2 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#E07B0C] bg-[#E07B0C]/5 ring-1.5 sm:ring-2 ring-[#E07B0C]/20 shadow-xs'
                      : 'border-[#E8DFD5] bg-white hover:border-[#F09819] text-[#14361F]'
                  }`}
                >
                  <p className={`text-[11px] sm:text-sm font-bold truncate ${isSelected ? 'text-[#E07B0C]' : 'text-[#14361F]'}`}>
                    {variant.variant_name}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-[#8C7567] mt-0.5">
                    ₹{variant.price}
                  </p>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#E07B0C] text-white flex items-center justify-center">
                      <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity & High-Conversion Action Buttons */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex gap-2 sm:gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-[#E8DFD5] rounded-full bg-white h-10 sm:h-12 shrink-0 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 sm:px-4 text-[#5A433B] hover:text-[#E07B0C] transition-colors h-full rounded-l-full cursor-pointer font-bold text-sm sm:text-base active:scale-95"
            >
              -
            </button>
            <span className="w-7 sm:w-8 text-center font-bold text-xs sm:text-sm text-[#14361F]">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}
              className="px-3 sm:px-4 text-[#5A433B] hover:text-[#E07B0C] transition-colors h-full rounded-r-full cursor-pointer font-bold text-sm sm:text-base active:scale-95"
            >
              +
            </button>
          </div>
          
          {/* Add To Cart */}
          <button 
            onClick={handleAddToCart}
            disabled={isAdding || isBuying || addedSuccess}
            className={`flex-1 font-bold rounded-full h-10 sm:h-12 text-xs sm:text-base transition-all duration-200 inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs border-2 ${
              addedSuccess
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-900/20'
                : 'bg-white border-[#E07B0C] text-[#E07B0C] hover:bg-[#E07B0C]/5 active:scale-[0.98]'
            }`}
          >
            {isAdding ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#E07B0C]/30 border-t-[#E07B0C] rounded-full animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Added to Cart!
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        {/* Instant Buy Now Button */}
        <button 
          onClick={handleBuyNow}
          disabled={isAdding || isBuying || addedSuccess}
          className="w-full font-bold rounded-full h-11 sm:h-13 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] text-white hover:from-[#2D1409] hover:to-[#E07B0C] shadow-md shadow-[#E07B0C]/20 active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-base"
        >
          {isBuying ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Buy Now'
          )}
        </button>
      </div>

      {/* Stock Low Indicator */}
      {selectedVariant?.stock_quantity && selectedVariant.stock_quantity < 15 && (
        <p className="mt-3 text-xs font-semibold text-amber-700 text-center flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Only {selectedVariant.stock_quantity} packs left in current batch!
        </p>
      )}
    </div>
  )
}
