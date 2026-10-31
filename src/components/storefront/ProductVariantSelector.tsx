'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  ShoppingCart,
  Zap,
  Truck,
  Package,
  RotateCcw,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Sprout,
  Loader2,
} from 'lucide-react'
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
    .filter((v) => v.is_active && v.stock_quantity > 0)
    .forEach((v) => {
      if (!uniqueMap.has(v.variant_name)) {
        uniqueMap.set(v.variant_name, v)
      }
    })

  const activeVariants = Array.from(uniqueMap.values())
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    activeVariants.length > 0 ? activeVariants[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const router = useRouter()
  const { refreshCart } = useCart()

  if (activeVariants.length === 0) {
    return (
      <div className="py-6">
        <span className="text-xl font-bold text-gray-500">Out of Stock</span>
        <button
          disabled
          className="mt-4 w-full rounded-full bg-gray-300 py-3.5 px-8 text-white font-bold cursor-not-allowed"
        >
          Currently Unavailable
        </button>
      </div>
    )
  }

  const hasDiscount =
    selectedVariant?.original_price &&
    selectedVariant.original_price > selectedVariant.price
  const discountSavings = hasDiscount
    ? selectedVariant!.original_price! - selectedVariant!.price
    : 0
  const discountPercent = hasDiscount
    ? Math.round((discountSavings / selectedVariant!.original_price!) * 100)
    : 0

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setIsAdding(true)

    const result = await addToCart(selectedVariant.id, quantity)

    if (result.success) {
      setAddedSuccess(true)
      refreshCart()
      setTimeout(() => setAddedSuccess(false), 2200)
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
    <div className="space-y-4 mt-2">
      
      {/* ── 4 Mini Benefit Badges in a Row (Exact Reference Image) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-1">
        {/* 1. 100% Pure Natural */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#EAF5ED] text-[#227B44] flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 fill-[#227B44]/20" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-[#14361F] leading-tight">100% Pure</p>
            <p className="text-[10px] text-[#6E5951]">Natural</p>
          </div>
        </div>

        {/* 2. No Preservatives */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-[5px]  bg-[#FAF7F2] border border-[#EDE4D9]/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#FDF0E6] text-[#D96B1C] flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-[#14361F] leading-tight">No</p>
            <p className="text-[10px] text-[#6E5951]">Preservatives</p>
          </div>
        </div>

        {/* 3. Farm Origin */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#EAF5ED] text-[#227B44] flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-[#14361F] leading-tight">Farm</p>
            <p className="text-[10px] text-[#6E5951]">Origin</p>
          </div>
        </div>

        {/* 4. FSSAI Tested */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#B87024] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#B87024]" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-[#14361F] leading-tight">FSSAI</p>
            <p className="text-[10px] text-[#6E5951]">Tested</p>
          </div>
        </div>
      </div>

      {/* ── Price & Savings Bar (Exact Reference Image Styling) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[5px] bg-[#FFFDF9] border border-[#EDE4D9] shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#E07B0C]">
            ₹{selectedVariant?.price}
          </span>
          {hasDiscount && (
            <span className="text-base sm:text-[20px] text-stone-400 line-through">
              ₹{selectedVariant?.original_price}
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-[5px] bg-[#FDF0E6] border border-[#F09819]/40 text-[11px] font-bold text-[#D96B1C] uppercase tracking-wide">
              SAVE ₹{discountSavings} ({discountPercent}% OFF)
            </span>
          )}
        </div>

        <span className="text-xs text-[#8C766E] font-medium">
          Inclusive of all taxes
        </span>
      </div>

      {/* ── Pack Size Selector Cards (Exact Reference Image 3-Column Layout) ── */}
      {activeVariants.length > 0 && (
        <div className="space-y-4 pt-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold uppercase tracking-wider text-[#14361F]">
              SELECT PACK SIZE
            </span>
            <span className="font-bold text-[#E07B0C]">
              Selected: {selectedVariant?.variant_name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {activeVariants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  type="button"
                  className={`py-3 px-3 rounded-[5px] border text-center transition-all duration-200 cursor-pointer relative shadow-xs active:scale-[0.98] ${
                    isSelected
                      ? 'border-2 border-[#E07B0C] bg-[#FFF8F2] ring-2 ring-[#E07B0C]/15'
                      : 'border-[#EDE4D9] bg-white hover:border-[#E07B0C]/50 hover:bg-[#FAF7F2] text-[#14361F]'
                  }`}
                >
                  <p
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isSelected ? 'text-[#14361F]' : 'text-[#14361F]'
                    }`}
                  >
                    {variant.variant_name}
                  </p>
                  <p className="text-[16px] font-semibold text-[#8C7567] mt-[6px]">
                    ₹{variant.price}
                  </p>

                  {/* Top-Right Circular Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E07B0C] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quantity Stepper & Action Buttons ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between sm:justify-start border border-[#EDE4D9] rounded-[5px] bg-white h-11 sm:h-12 px-1 shrink-0 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              type="button"
              className="w-9 h-9 flex items-center justify-center text-[#5A433B] hover:text-[#E07B0C] transition-colors rounded-full cursor-pointer font-bold text-base active:scale-90"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-extrabold text-sm text-[#14361F]">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))
              }
              type="button"
              className="w-9 h-9 flex items-center justify-center text-[#5A433B] hover:text-[#E07B0C] transition-colors rounded-[5px] cursor-pointer font-bold text-base active:scale-90"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            type="button"
            disabled={isAdding || isBuying || addedSuccess}
            className={`flex-1 font-bold rounded-[5px] h-11 sm:h-12 px-6 text-xs sm:text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs border-2 active:scale-[0.98] ${
              addedSuccess
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-900/20'
                : 'bg-white border-[#E07B0C] text-[#E07B0C] hover:bg-[#FAF3EB]'
            }`}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#E07B0C]" />
            ) : addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            type="button"
            disabled={isAdding || isBuying || addedSuccess}
            className="flex-1 font-bold rounded-[5px] h-11 sm:h-12 px-6 bg-gradient-to-r from-[#E07B0C] to-[#C86A08] text-white hover:opacity-95 shadow-md shadow-[#E07B0C]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            {isBuying ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* ── 3 Trust Highlights below Action Buttons (Exact Reference Image) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-[#EDE4D9] justify-items-center text-center">
        {/* 1. Free Shipping */}
        <div className="flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-[#E07B0C] shrink-0" />
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-[#14361F]">Free Shipping</p>
            <p className="text-[11px] text-[#6E5951]">on orders above ₹499</p>
          </div>
        </div>

        {/* 2. Secure Packaging */}
        <div className="flex items-center gap-2.5">
          <Package className="w-5 h-5 text-[#E07B0C] shrink-0" />
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-[#14361F]">Secure Packaging</p>
            <p className="text-[11px] text-[#6E5951]">Keep spices fresh</p>
          </div>
        </div>

        {/* 3. Easy Returns */}
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-5 h-5 text-[#E07B0C] shrink-0" />
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-[#14361F]">Easy Returns</p>
            <p className="text-[11px] text-[#6E5951]">7-day policy</p>
          </div>
        </div>
      </div>

    </div>
  )
}
