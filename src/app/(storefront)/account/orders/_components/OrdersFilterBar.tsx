'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ArrowUpDown } from 'lucide-react'

export const ORDER_STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

export function OrdersFilterBar({ counts }: { counts: Record<string, number> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const status = searchParams.get('status') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const urlQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(urlQuery)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the box in step when the URL changes from elsewhere (e.g. "Clear filters")
  useEffect(() => setQuery(urlQuery), [urlQuery])

  const navigate = (next: { status?: string; sort?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    const apply = (key: string, value: string | undefined, fallback: string) => {
      if (value === undefined) return
      if (!value || value === fallback) params.delete(key)
      else params.set(key, value)
    }
    apply('status', next.status, 'all')
    apply('sort', next.sort, 'newest')
    apply('q', next.q?.trim(), '')

    const queryString = params.toString()
    startTransition(() => router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false }))
  }

  const onSearchChange = (value: string) => {
    setQuery(value)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => navigate({ q: value }), 350)
  }

  const hasFilters = status !== 'all' || sort !== 'newest' || !!urlQuery

  return (
    <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-3.5 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7567] pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order number or product"
            className="w-full pl-9 pr-9 py-2.5 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-sm text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                navigate({ q: '' })
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8C7567] hover:text-[#14361F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative sm:w-48">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7567] pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value })}
            aria-label="Sort orders"
            className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-sm font-semibold text-[#14361F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount_high">Amount: high to low</option>
            <option value="amount_low">Amount: low to high</option>
          </select>
        </div>
      </div>

      {/* Status chips with counts */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-0.5 px-0.5 pb-0.5" role="tablist" aria-label="Filter by status">
        {ORDER_STATUS_FILTERS.map(({ key, label }) => {
          const active = status === key
          const count = counts[key] ?? 0
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigate({ status: key })}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? 'border-[#E07B0C] bg-[#E07B0C] text-white'
                  : 'border-[#E8DFD5] bg-white text-[#5A433B] hover:border-[#E07B0C] hover:text-[#E07B0C]'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                  active ? 'bg-white/25 text-white' : 'bg-[#F5EEE6] text-[#8C7567]'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {(hasFilters || isPending) && (
        <div className="flex items-center justify-between text-xs text-[#8C7567]">
          <span>{isPending ? 'Updating...' : 'Filters applied'}</span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                startTransition(() => router.replace(pathname, { scroll: false }))
              }}
              className="font-bold text-[#E07B0C] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
