import { getCart } from '@/actions/cart'
import { getShippingConfig } from '@/actions/shipping'
import Link from 'next/link'
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { CartItemsList } from './_components/CartItemsList'

export const metadata = {
  title: 'Your Shopping Cart | HS AgroFoods',
  description: 'Review your selected spices and proceed to checkout.',
}

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const [{ items }, shippingConfig] = await Promise.all([
    getCart(),
    getShippingConfig(),
  ])

  return (
    <div className="bg-[#FBF5EE] min-h-screen pt-8 pb-28 sm:py-12 text-[#14361F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cart Page Title & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#14361F]">
              Shopping Cart
            </h1>
            {items.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#E07B0C] text-white text-xs font-bold shadow-xs">
                {items.reduce((sum: number, item: any) => sum + item.quantity, 0)} {items.length === 1 ? 'pack' : 'packs'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#8C7567] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#E07B0C]" />
            <span>100% Secure Checkout & Fresh Spice Guarantee</span>
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-24 px-4 bg-white rounded-3xl border border-[#E8DFD5] shadow-xs max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#FDF9F3] border border-[#E8DFD5] text-[#E07B0C] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag className="w-10 h-10 opacity-70" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F]">
              Your Cart is Empty
            </h3>
            <p className="text-sm text-[#8C7567] max-w-md mx-auto mt-2 mb-8 leading-relaxed font-normal">
              Looks like you haven&rsquo;t added any spices to your cart yet. Explore our freshly ground powders and aromatic whole spices!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E07B0C] text-white text-sm font-bold rounded-full hover:bg-[#2D1409] shadow-md shadow-[#E07B0C]/20 transition-all active:scale-95"
              >
                <span>Browse All Spices</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=whole-spices"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FDF9F3] text-[#E07B0C] border border-[#E8DFD5] text-sm font-bold rounded-full hover:bg-[#F2E8DC] transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#F09819]" />
                <span>Explore Whole Spices</span>
              </Link>
            </div>
          </div>
        ) : (
          <CartItemsList initialItems={items} shippingConfig={shippingConfig} />
        )}
      </div>
    </div>
  )
}
