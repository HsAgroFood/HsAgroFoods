'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Sparkles,
  Lock,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { removeFromCart, updateCartQuantity } from '@/actions/cart'
import { useCart } from '@/contexts/CartContext'
import type { ShippingConfig } from '@/actions/shipping'

type CartItem = {
  id: string
  quantity: number
  variant_id: string
  product_variants: {
    id: string
    variant_name: string
    price: number
    original_price: number | null
    stock_quantity: number
    is_active: boolean
    product_id: string
    products: {
      id: string
      name: string
      slug: string
      featured_image_url: string | null
    }
  }
}

export function CartItemsList({
  initialItems,
  shippingConfig = { free_shipping_threshold: 499, standard_shipping_cost: 90 },
}: {
  initialItems: any[]
  shippingConfig?: ShippingConfig
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems as CartItem[])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const { refreshCart } = useCart()

  // Keep local state in sync when the server sends fresh cart data
  useEffect(() => {
    setItems(initialItems as CartItem[])
  }, [initialItems])

  const FREE_SHIPPING_THRESHOLD = shippingConfig.free_shipping_threshold
  const SHIPPING_COST = shippingConfig.standard_shipping_cost

  const handleRemove = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await removeFromCart(id)
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        refreshCart()
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleQuantityChange = async (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(id)
      return
    }
    setLoadingId(id)
    try {
      const result = await updateCartQuantity(id, newQty)
      if (result.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
        )
        refreshCart()
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    const code = couponCode.trim().toUpperCase()
    if (code === 'PURE10' || code === 'WELCOME10') {
      setCouponMessage({ text: 'Coupon applied! 10% discount added at checkout.', isError: false })
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try WELCOME10 or PURE10.', isError: true })
    }
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product_variants.price * item.quantity)
  }, 0)

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shipping = isFreeShipping ? 0 : SHIPPING_COST
  const total = subtotal + shipping
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10">
      
      {/* ── Left Column: Cart Items (7 cols) ── */}
      <section className="lg:col-span-7 space-y-5">
        
        {/* ── Free Delivery Progress Banner ── */}
        <div className="bg-white rounded-[5px] p-4 sm:p-5 border border-[#EDE4D9] shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs sm:text-sm font-bold text-[#14361F]">
              {isFreeShipping ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600/30" />
                  <span>Congratulations! You qualify for <strong>FREE Delivery!</strong></span>
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#E07B0C]">₹{remainingForFreeShipping.toFixed(0)}</strong> more to unlock <strong>FREE Delivery!</strong>
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-[#7A6458]">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-[#FAF3EB] rounded-[5px] h-2.5 overflow-hidden border border-[#EDE4D9]/80">
            <div 
              className="bg-gradient-to-r from-[#F09819] to-[#E07B0C] h-full rounded-[5px] transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Cart Items List ── */}
        <div className="space-y-3.5">
          {items.map((item) => {
            const variant = item.product_variants
            const product = variant.products
            const isLoading = loadingId === item.id
            const itemTotal = variant.price * item.quantity
            const originalPrice = variant.original_price
            const hasDiscount = originalPrice && originalPrice > variant.price

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-[5px] border border-[#EDE4D9] hover:border-[#E07B0C]/40 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex gap-3.5 sm:gap-5 items-center relative ${
                  isLoading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {/* Product Thumbnail */}
                <Link href={`/product/${product.slug}`} className="shrink-0 group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[5px] overflow-hidden bg-[#FAF6F0] relative border border-[#EDE4D9] group-hover:scale-105 transition-transform duration-300">
                    {product.featured_image_url ? (
                      <Image
                        src={product.featured_image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 bg-[#FAF6F0]">
                        <ShoppingBag className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info & Quantity Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#14361F] truncate hover:text-[#E07B0C] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] text-[10px] sm:text-[11px] font-bold text-[#7A6458] shrink-0">
                          {variant.variant_name}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                          <span>In Stock</span>
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={isLoading}
                      className="p-1.5 sm:p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-[5px] border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0 group/del"
                      title="Remove item"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover/del:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Pricing and Stepper Row */}
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#F0E6DA]">
                    
                    {/* Quantity Pill Stepper */}
                    <div className="inline-flex items-center rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-[4px] bg-white text-[#14361F] hover:bg-[#E07B0C] hover:text-white transition-colors disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="w-8 sm:w-10 text-center font-extrabold text-[#14361F] text-xs sm:text-sm">
                        {item.quantity}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= variant.stock_quantity}
                        aria-label="Increase quantity"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-[4px] bg-white text-[#14361F] hover:bg-[#E07B0C] hover:text-white transition-colors disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price Calculation */}
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-base sm:text-lg lg:text-xl font-extrabold text-[#E07B0C]">
                          ₹{itemTotal.toFixed(0)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{(originalPrice * item.quantity).toFixed(0)}
                          </span>
                        )}
                      </div>
                      {item.quantity > 1 && (
                        <p className="text-[10.5px] text-[#7A6458]">
                          ₹{variant.price} each
                        </p>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* Back Link to Shop */}
        <div className="pt-2">
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E07B0C] hover:text-[#14361F] transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Add more freshly ground spices &amp; powders</span>
          </Link>
        </div>
      </section>

      {/* ── Right Column: Order Summary (5 cols, Sticky on Desktop) ── */}
      <section className="mt-8 lg:mt-0 lg:col-span-5 relative">
        <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-5 sm:p-7 shadow-xs sticky top-24 z-20 space-y-5">
          
          {/* Header */}
          <div className="border-b border-[#EDE4D9] pb-3.5">
            <h2 className="font-serif text-lg sm:text-xl font-extrabold text-[#14361F]">
              Order Summary
            </h2>
            <p className="text-xs text-[#7A6458] mt-0.5">
              Review your cart before secure checkout
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-[#5A433B]">
              <span>Items Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} packs)</span>
              <span className="font-bold text-[#14361F]">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-[#5A433B]">
              <span className="flex items-center gap-1">
                <span>Delivery Charges</span>
                <Truck className="w-3.5 h-3.5 text-[#7A6458]" />
              </span>
              {isFreeShipping ? (
                <span className="px-2 py-0.5 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[11px] font-extrabold text-[#144D29] uppercase tracking-wide">
                  FREE
                </span>
              ) : (
                <span className="font-bold text-[#14361F]">₹{shipping.toFixed(2)}</span>
              )}
            </div>

            {/* Promo Code Box */}
            <div className="pt-2 border-t border-[#F0E6DA]">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. PURE10)"
                    className="w-full rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] px-3 py-2 text-xs text-[#14361F] placeholder:text-[#9C8A7F] focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-[#9C8A7F] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="rounded-[5px] bg-[#FAF3EB] hover:bg-[#E07B0C] text-[#E07B0C] hover:text-white border border-[#EDE4D9] hover:border-[#E07B0C] px-3.5 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <p
                  className={`mt-1.5 text-[11px] font-semibold ${
                    couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Grand Total */}
            <div className="border-t border-[#EDE4D9] pt-4 flex justify-between items-baseline">
              <div>
                <span className="font-serif text-base sm:text-lg font-extrabold text-[#14361F] block">
                  Grand Total
                </span>
                <span className="text-[10px] text-[#7A6458]">Inclusive of all GST &amp; taxes</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E07B0C]">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout CTA Button */}
          <Link 
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-xs hover:shadow-md transition-all active:scale-95 text-center text-sm sm:text-base cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* 4 Trust Badges in Cart */}
          <div className="pt-3 border-t border-[#F0E6DA] grid grid-cols-2 gap-2 text-[11px] text-[#5A433B]">
            <div className="flex items-center gap-2 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]">
              <Lock className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span className="font-semibold leading-tight">100% Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]">
              <ShieldCheck className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span className="font-semibold leading-tight">FSSAI Certified</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]">
              <Truck className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span className="font-semibold leading-tight">Pan-India Dispatch</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9]">
              <RotateCcw className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span className="font-semibold leading-tight">Fresh Aroma Lock</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
