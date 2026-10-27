'use client'

import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'

export function CartCount() {
  const { itemCount } = useCart()

  return (
    <div className="lg:w-24 flex-shrink-0">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8DFD5]">
        <div className="flex items-center justify-between mb-3">
          <ShoppingCart className="w-5 h-5 text-[#E07B0C]" />
          <span className="text-sm font-medium text-[#14361F]">Cart</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#E07B0C]" id="cart-item-count">{itemCount}</span>
          <span className="text-xs text-[#8C766E]">items</span>
        </div>
      </div>
    </div>
  )
}