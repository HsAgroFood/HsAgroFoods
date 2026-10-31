'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, ChevronDown, ShieldCheck, Truck, RotateCcw, Search, X, Check, Filter } from 'lucide-react'
import { useState } from 'react'

type Category = {
  id: string
  name: string
  slug: string
}

// Category visual icon lookup
const CATEGORY_ICONS: Record<string, string> = {
  'all': '✨',
  'ground-spices': '🌶️',
  'pure-ground-spices': '🌶️',
  'blended-spices': '🥣',
  'blended-masalas': '🥣',
  'dehydrated-powders': '🌿',
  'whole-spices': '🪵',
  'exotic-herbs': '🌿',
}

export function ShopSidebar({
  categories,
  categoryFilter,
  searchQuery,
}: {
  categories: Category[]
  categoryFilter: string | null
  searchQuery: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (localSearch.trim()) {
      params.set('q', localSearch.trim())
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`/shop?${params.toString()}`)
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('q')
    params.set('page', '1')
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-24 space-y-5">
      
      {/* 1. Quick Search Box Widget */}
      <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-3.5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search spices, powders..."
            className="w-full bg-[#FAF7F2] border border-[#E8DFD5] rounded-[5px] pl-9 pr-8 py-2 text-xs sm:text-sm text-[#14361F] placeholder-[#8C766E] focus:outline-none focus:border-[#E07B0C] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-[#8C766E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8C766E] hover:text-[#E07B0C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* 2. Categories Filter Widget */}
      <div className="bg-white rounded-[5px] border border-[#EDE4D9] shadow-xs overflow-hidden">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="w-full lg:hidden flex items-center justify-between p-3.5 bg-[#14361F] text-white font-bold cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#E07B0C]" />
            <span className="text-xs sm:text-sm tracking-wider uppercase">Filter by Category</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-white/80 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between bg-[#14361F] text-white px-4 py-3 border-b border-[#0C2414]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E07B0C]" />
            <h3 className="font-serif text-sm font-bold tracking-wide text-white">Categories</h3>
          </div>
          {categoryFilter && (
            <Link
              href={`/shop${searchQuery ? `?q=${searchQuery}` : ''}`}
              className="text-[11px] text-[#FAF7F2]/80 hover:text-white underline"
            >
              Reset
            </Link>
          )}
        </div>

        {/* Categories List */}
        <div
          className={`grid transition-all duration-300 ease-in-out lg:grid-rows-[1fr] ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="space-y-1 p-2.5 sm:p-3">
              {/* All Products Link */}
              <li>
                <Link
                  href={`/shop${searchQuery ? `?q=${searchQuery}` : ''}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[5px] text-xs sm:text-sm font-semibold transition-all ${
                    !categoryFilter
                      ? 'bg-[#E07B0C] text-white shadow-xs'
                      : 'text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#14361F]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>All Products</span>
                  </span>
                  {!categoryFilter && <Check className="w-3.5 h-3.5 text-white" />}
                </Link>
              </li>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const isActive = categoryFilter === cat.slug
                const icon = CATEGORY_ICONS[cat.slug] || '🌿'

                return (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-[5px] text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#E07B0C] text-white font-bold shadow-xs'
                          : 'text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#14361F]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Trust & Purity Assurance Widget (Desktop) */}
      <div className="hidden lg:block bg-white rounded-[5px] border border-[#EDE4D9] p-4 shadow-xs space-y-3.5">
        <div className="flex items-center gap-1.5 text-[#14361F] font-serif font-bold text-xs uppercase tracking-wider border-b border-[#F0E6DA] pb-2">
          <ShieldCheck className="w-4 h-4 text-[#E07B0C]" />
          <span>Our Purity Guarantee</span>
        </div>

        <div className="space-y-2.5 text-xs text-[#5A433B]">
          <div className="flex items-start gap-2">
            <span className="text-[#E07B0C] font-bold">✓</span>
            <span>100% Pure, Unadulterated Spices</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#E07B0C] font-bold">✓</span>
            <span>Zero Preservatives or Artificial Food Colors</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#E07B0C] font-bold">✓</span>
            <span>Sun-Dried &amp; Slow Cold-Ground</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#E07B0C] font-bold">✓</span>
            <span>Aroma-Lock Fresh Packaging</span>
          </div>
        </div>
      </div>

    </div>
  )
}
