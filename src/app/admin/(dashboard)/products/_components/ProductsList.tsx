'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Search, Package, X } from 'lucide-react'
import { deleteProduct } from '@/actions/products'
import { ViewToggle, useViewMode } from '@/components/admin/ViewToggle'

export interface ProductWithCategory {
  id: string
  name: string
  slug: string
  short_description: string | null
  featured_image_url: string | null
  is_active: boolean
  created_at: string
  categories: { name: string } | null
  product_variants?: { price: number | string; stock_quantity: number; is_active: boolean }[] | null
}

const LOW_STOCK_LIMIT = 10

type StatusFilter = 'all' | 'active' | 'inactive'
type StockFilter = 'all' | 'in' | 'low' | 'out'
type SortKey = 'newest' | 'oldest' | 'name' | 'price_asc' | 'price_desc' | 'stock_asc'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

// Everything the list needs from a product's variants
function summarise(product: ProductWithCategory) {
  const variants = product.product_variants || []
  const prices = variants.map((v) => Number(v.price) || 0)
  const stocks = variants.map((v) => Number(v.stock_quantity) || 0)
  const totalStock = stocks.reduce((a, b) => a + b, 0)
  // Sold-out variants switch themselves off, so judge stock from every variant, not only the active ones
  const stockState: 'out' | 'low' | 'in' =
    variants.length === 0 || totalStock <= 0 ? 'out' : Math.min(...stocks) <= LOW_STOCK_LIMIT ? 'low' : 'in'

  return {
    variantCount: variants.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    totalStock,
    stockState,
  }
}

export default function ProductsList({ products }: { products: ProductWithCategory[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState('all')
  const [stock, setStock] = useState<StockFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const { view, setView, cardsClass, tableClass } = useViewMode()

  const rows = useMemo(
    () => products.filter((p) => !removedIds.includes(p.id)).map((p) => ({ product: p, info: summarise(p) })),
    [products, removedIds]
  )

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.product.is_active).length,
      inactive: rows.filter((r) => !r.product.is_active).length,
      low: rows.filter((r) => r.info.stockState === 'low').length,
      out: rows.filter((r) => r.info.stockState === 'out').length,
    }),
    [rows]
  )

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.product.categories?.name).filter(Boolean) as string[])].sort(),
    [rows]
  )
  const hasUncategorized = rows.some((r) => !r.product.categories)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows.filter(({ product, info }) => {
      if (status === 'active' && !product.is_active) return false
      if (status === 'inactive' && product.is_active) return false
      if (category === '__none__' ? !!product.categories : category !== 'all' && product.categories?.name !== category) return false
      if (stock !== 'all' && info.stockState !== stock) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        (product.categories?.name || '').toLowerCase().includes(q)
      )
    })

    const byPrice = (a: (typeof list)[number]) => a.info.minPrice ?? Number.POSITIVE_INFINITY
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.product.created_at).getTime() - new Date(b.product.created_at).getTime()
        case 'name':
          return a.product.name.localeCompare(b.product.name)
        case 'price_asc':
          return byPrice(a) - byPrice(b)
        case 'price_desc':
          return (b.info.minPrice ?? -1) - (a.info.minPrice ?? -1)
        case 'stock_asc':
          return a.info.totalStock - b.info.totalStock
        default:
          return new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime()
      }
    })
  }, [rows, query, status, category, stock, sort])

  const filtersActive = query.trim() !== '' || status !== 'all' || category !== 'all' || stock !== 'all'
  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setCategory('all')
    setStock('all')
  }

  function handleDelete(product: ProductWithCategory) {
    if (!confirm(`Delete "${product.name}"? This will also delete all its variants, images, and FAQs.`)) return
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) {
        setRemovedIds((ids) => [...ids, product.id])
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete product')
      }
    })
  }

  const thumb = (product: ProductWithCategory, size: string) =>
    product.featured_image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.featured_image_url}
        alt={product.name}
        className={`${size} shrink-0 rounded-lg object-cover bg-stone-100`}
      />
    ) : (
      <div className={`${size} shrink-0 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium`}>
        IMG
      </div>
    )

  const statusBadge = (active: boolean) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )

  const stockBadge = (info: ReturnType<typeof summarise>) => {
    if (info.stockState === 'out') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          {info.variantCount === 0 ? 'No variants' : 'Out of stock'}
        </span>
      )
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          info.stockState === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
        }`}
      >
        {info.stockState === 'low' ? 'Low · ' : ''}
        {info.totalStock} in stock
      </span>
    )
  }

  const priceText = (info: ReturnType<typeof summarise>) =>
    info.minPrice == null
      ? '-'
      : info.minPrice === info.maxPrice
        ? inr(info.minPrice)
        : `${inr(info.minPrice)} – ${inr(info.maxPrice as number)}`

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200/80 bg-white p-12 text-center">
        <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500 text-sm">No products yet</p>
        <p className="text-stone-400 text-xs mt-1">Create your first product to get started.</p>
      </div>
    )
  }

  const empty = (
    <div className="p-10 text-center">
      <p className="text-sm text-stone-500">No products match these filters.</p>
      {filtersActive && (
        <button type="button" onClick={resetFilters} className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700 cursor-pointer">
          Clear filters
        </button>
      )}
    </div>
  )

  const statCards: { label: string; value: number; tone: string; active: boolean; onClick: () => void }[] = [
    { label: 'Total products', value: stats.total, tone: 'text-stone-900', active: !filtersActive, onClick: resetFilters },
    { label: 'Active', value: stats.active, tone: 'text-emerald-600', active: status === 'active', onClick: () => { resetFilters(); setStatus('active') } },
    { label: 'Inactive', value: stats.inactive, tone: 'text-stone-500', active: status === 'inactive', onClick: () => { resetFilters(); setStatus('inactive') } },
    { label: 'Low stock', value: stats.low, tone: 'text-amber-600', active: stock === 'low', onClick: () => { resetFilters(); setStock('low') } },
    { label: 'Out of stock', value: stats.out, tone: 'text-red-600', active: stock === 'out', onClick: () => { resetFilters(); setStock('out') } },
  ]

  const selectClass =
    'w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500'

  return (
    <div className="space-y-4">
      {/* Stats (tap one to filter) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            aria-pressed={card.active}
            className={`rounded-xl border bg-white px-4 py-3 text-left transition-colors cursor-pointer ${
              card.active ? 'border-orange-400 ring-1 ring-orange-200' : 'border-stone-200/80 hover:border-stone-300'
            }`}
          >
            <p className="text-xs text-stone-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, slug or category…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass} aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            {hasUncategorized && <option value="__none__">Uncategorized</option>}
          </select>
          <select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)} className={selectClass} aria-label="Stock">
            <option value="all">Any stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock (≤ {LOW_STOCK_LIMIT})</option>
            <option value="out">Out of stock</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass} aria-label="Sort by">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="stock_asc">Stock: lowest first</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          Showing {filtered.length} of {stats.total} {stats.total === 1 ? 'product' : 'products'}
          {filtersActive && (
            <button type="button" onClick={resetFilters} className="ml-2 inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 cursor-pointer">
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Grid view: one card per product */}
      <div className={cardsClass}>
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-stone-200 bg-white">{empty}</div>
        ) : (
          filtered.map(({ product, info }) => (
            <div key={product.id} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {thumb(product, 'h-14 w-14')}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">{product.name}</p>
                  <p className="truncate text-xs text-stone-400">/{product.slug}</p>
                </div>
                {statusBadge(product.is_active)}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {stockBadge(info)}
                <span className="text-sm font-bold text-stone-900">{priceText(info)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                {product.categories ? (
                  <span className="font-medium text-stone-600">{product.categories.name}</span>
                ) : (
                  <span className="italic text-stone-400">Uncategorized</span>
                )}
                <span suppressHydrationWarning>Added {formatDate(product.created_at)}</span>
              </div>

              <div className="flex gap-2 border-t border-stone-100 pt-3">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table view */}
      <div className={`overflow-hidden rounded-xl border border-stone-200/80 bg-white ${tableClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-stone-50/50">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>{empty}</td>
                </tr>
              ) : (
                filtered.map(({ product, info }) => (
                  <tr key={product.id} className="transition-colors hover:bg-stone-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {thumb(product, 'h-10 w-10')}
                        <div>
                          <p className="text-sm font-medium text-stone-900">{product.name}</p>
                          <p className="mt-0.5 text-xs text-stone-400">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {product.categories ? (
                        <span className="text-sm text-stone-600">{product.categories.name}</span>
                      ) : (
                        <span className="text-xs italic text-stone-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-stone-800">
                      {priceText(info)}
                      {info.variantCount > 1 && (
                        <span className="block text-xs font-normal text-stone-400">{info.variantCount} variants</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">{stockBadge(info)}</td>
                    <td className="px-5 py-3.5">{statusBadge(product.is_active)}</td>
                    <td className="px-5 py-3.5 text-sm text-stone-500" suppressHydrationWarning>
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(product)}
                          title="Delete"
                          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
