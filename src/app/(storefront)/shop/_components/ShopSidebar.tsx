'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, ChevronDown, ShieldCheck, Search, X, Check, SlidersHorizontal, LayoutGrid, Flame, Carrot, Sprout, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Category = {
  id: string
  name: string
  slug: string
}

/** A friendly icon per category, guessed from its name (falls back to a sprout). */
function categoryIcon(name: string, slug: string): LucideIcon {
  const text = `${name} ${slug}`.toLowerCase()
  if (/blend|masala|masale/.test(text)) return Sparkles
  if (/veg|fruit|dehydrat/.test(text)) return Carrot
  if (/ground|spice|powder/.test(text)) return Flame
  return Sprout
}

function CategoryRow({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  Icon: LucideIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        className={`group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all active:scale-[0.99] ${
          active
            ? 'bg-gradient-to-r from-[#E07B0C] to-[#D1491B] text-white shadow-md shadow-[#E07B0C]/25'
            : 'text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#14361F]'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            active ? 'bg-white/20 text-white' : 'bg-[#FAF3EB] text-[#E07B0C] group-hover:bg-white'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className={`flex-1 text-sm leading-snug ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
        {active && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
            <Check className="h-3 w-3 text-white" />
          </span>
        )}
      </Link>
    </li>
  )
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
  const filterRef = useRef<HTMLDivElement>(null)
  const activeName = categories.find((cat) => cat.slug === categoryFilter)?.name ?? 'All Products'

  // Mobile: the category list floats over the products; close it on an outside tap or Escape
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

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
    <div className="relative z-20 w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-24 space-y-5">
      
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
      <div ref={filterRef} className="relative rounded-2xl border border-[#EDE4D9] bg-white shadow-sm lg:overflow-hidden">
        {/* Mobile toggle: shows what is selected right now */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-expanded={isOpen}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-r from-[#14361F] to-[#1F5A33] p-3.5 text-left text-white lg:hidden"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <SlidersHorizontal className="h-[18px] w-[18px] text-[#F09819]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold uppercase tracking-wider">Filter by Category</span>
            <span className="mt-0.5 block truncate text-xs text-white/70">Showing: {activeName}</span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {/* Desktop header */}
        <div className="hidden items-center justify-between bg-gradient-to-r from-[#14361F] to-[#1F5A33] px-4 py-3.5 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <SlidersHorizontal className="h-4 w-4 text-[#F09819]" />
            </span>
            <h3 className="font-serif text-sm font-bold tracking-wide text-white">Categories</h3>
          </div>
          {categoryFilter && (
            <Link
              href={`/shop${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
              className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/25"
            >
              Reset
            </Link>
          )}
        </div>

        {/* Categories list: floats over the products on phones, sits in the sidebar on desktop */}
        <div
          className={`${
            isOpen ? 'block' : 'hidden'
          } absolute inset-x-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-[#EDE4D9] bg-white shadow-2xl shadow-[#14361F]/15 animate-in fade-in slide-in-from-top-2 duration-200 lg:static lg:mt-0 lg:block lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0 lg:shadow-none lg:animate-none`}
        >
          <ul className="space-y-1 p-2.5">
            <CategoryRow
              href={`/shop${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
              label="All Products"
              Icon={LayoutGrid}
              active={!categoryFilter}
              onClick={() => setIsOpen(false)}
            />

            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                href={`/shop?category=${cat.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                label={cat.name}
                Icon={categoryIcon(cat.name, cat.slug)}
                active={categoryFilter === cat.slug}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </ul>
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
