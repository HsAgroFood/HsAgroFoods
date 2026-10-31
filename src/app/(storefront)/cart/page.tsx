import { getCart } from '@/actions/cart'
import { getShippingConfig } from '@/actions/shipping'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  Leaf,
  FlaskConical,
  Truck,
} from 'lucide-react'
import { CartItemsList } from './_components/CartItemsList'

export const metadata = {
  title: 'Your Shopping Cart | HS AgroFoods',
  description: 'Review your selected spices and dehydrated powders and proceed to secure checkout.',
}

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const [{ items }, shippingConfig] = await Promise.all([
    getCart(),
    getShippingConfig(),
  ])

  const totalPacks = items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] pb-10 relative overflow-x-clip">
      {/* ── Ambient Background Lighting Gradients (Matching Home Page) ── */}
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
          <span className="text-[#14361F] font-bold">Shopping Cart</span>
        </nav>

        {/* ── Modern Hero Header (Home Page Typography & Style) ── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <ShoppingBag className="w-3.5 h-3.5 text-[#144D29]" />
            <span>YOUR SHOPPING CART • FRESH SPICES</span>
          </div>

          {/* Main Serif Headline with Pack Count Pill */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#14361F] leading-[1.2]">
              Shopping <span className="text-[#E07B0C]">Cart</span>
            </h1>
            {items.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-[5px] bg-[#E07B0C] text-white text-xs sm:text-sm font-bold shadow-2xs">
                {totalPacks} {totalPacks === 1 ? 'pack' : 'packs'}
              </span>
            )}
          </div>

          {/* 4 Mini Trust Indicators (Consistent with Home & Shop) */}
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
              <span>FSSAI Certified</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>Free Delivery Above ₹499</span>
            </span>
          </div>
        </div>

        {/* ── Content: Empty State or Cart Items Grid ── */}
        {items.length === 0 ? (
          /* ── Modern Empty Cart Card ── */
          <div className="text-center py-12 sm:py-16 px-6 bg-white rounded-[5px] border border-[#EDE4D9] shadow-xs max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] mx-auto shadow-2xs">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-[#E07B0C] stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">
                Your Cart is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#6E5951] max-w-md mx-auto leading-relaxed">
                Looks like you haven&apos;t added any spices or dehydrated powders yet. Explore our farm-fresh collection and pick your favorite kitchen essentials!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#E07B0C] hover:bg-[#C86A08] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Browse All Spices</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/wishlist"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#FAF3EB] hover:bg-[#F2E8DC] text-[#14361F] border border-[#EDE4D9] px-6 py-3 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>View Saved Wishlist</span>
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
          <CartItemsList initialItems={items} shippingConfig={shippingConfig} />
        )}
      </div>
    </div>
  )
}
