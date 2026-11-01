'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Search, FolderTree, ImageIcon, X } from 'lucide-react'
import { deleteCategory, toggleCategoryStatus } from '@/actions/categories'
import { ViewToggle, useViewMode } from '@/components/admin/ViewToggle'

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  badge_text?: string | null
  is_active: boolean
  created_at: string
  product_count: number
}

type StatusFilter = 'all' | 'active' | 'inactive'
type ImageFilter = 'all' | 'with' | 'without'
type ProductsFilter = 'all' | 'with' | 'empty'
type SortKey = 'newest' | 'oldest' | 'name' | 'most' | 'fewest'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CategoriesList({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [imageFilter, setImageFilter] = useState<ImageFilter>('all')
  const [productsFilter, setProductsFilter] = useState<ProductsFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({})
  const { view, setView, cardsClass, tableClass } = useViewMode()

  const rows = useMemo(
    () =>
      categories
        .filter((c) => !removedIds.includes(c.id))
        .map((c) => ({ ...c, is_active: activeOverrides[c.id] ?? c.is_active })),
    [categories, removedIds, activeOverrides]
  )

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((c) => c.is_active).length,
      inactive: rows.filter((c) => !c.is_active).length,
      noImage: rows.filter((c) => !c.image_url).length,
      empty: rows.filter((c) => c.product_count === 0).length,
    }),
    [rows]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows.filter((c) => {
      if (status === 'active' && !c.is_active) return false
      if (status === 'inactive' && c.is_active) return false
      if (imageFilter === 'with' && !c.image_url) return false
      if (imageFilter === 'without' && c.image_url) return false
      if (productsFilter === 'with' && c.product_count === 0) return false
      if (productsFilter === 'empty' && c.product_count > 0) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    })

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'most':
          return b.product_count - a.product_count
        case 'fewest':
          return a.product_count - b.product_count
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [rows, query, status, imageFilter, productsFilter, sort])

  const filtersActive = query.trim() !== '' || status !== 'all' || imageFilter !== 'all' || productsFilter !== 'all'
  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setImageFilter('all')
    setProductsFilter('all')
  }

  function handleToggle(category: CategoryItem) {
    const next = !category.is_active
    startTransition(async () => {
      const result = await toggleCategoryStatus(category.id, next)
      if (result.success) {
        setActiveOverrides((o) => ({ ...o, [category.id]: next }))
        router.refresh()
      } else {
        alert(result.error || 'Failed to update category status')
      }
    })
  }

  function handleDelete(category: CategoryItem) {
    const message =
      category.product_count > 0
        ? `"${category.name}" has ${category.product_count} ${category.product_count === 1 ? 'product' : 'products'}. Delete it anyway?`
        : `Delete the category "${category.name}"?`
    if (!confirm(message)) return
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.success) {
        setRemovedIds((ids) => [...ids, category.id])
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete category')
      }
    })
  }

  const thumb = (category: CategoryItem, box: string, sizes: string) => (
    <div className={`relative ${box} shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 flex items-center justify-center`}>
      {category.image_url ? (
        <Image src={category.image_url} alt={category.name} fill sizes={sizes} className="object-cover" />
      ) : (
        <ImageIcon className="h-5 w-5 text-stone-300" />
      )}
    </div>
  )

  const statusChip = (category: CategoryItem) => (
    <button
      type="button"
      disabled={isPending}
      onClick={() => handleToggle(category)}
      title={category.is_active ? 'Click to make inactive' : 'Click to make active'}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${
        category.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
      }`}
    >
      {category.is_active ? 'Active' : 'Inactive'}
    </button>
  )

  const tag = (category: CategoryItem) =>
    category.badge_text ? (
      <span className="ml-2 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-600">
        {category.badge_text}
      </span>
    ) : null

  const productsText = (count: number) => `${count} ${count === 1 ? 'product' : 'products'}`

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200/80 bg-white p-12 text-center">
        <FolderTree className="mx-auto mb-3 h-10 w-10 text-stone-300" />
        <p className="text-sm text-stone-500">No categories yet</p>
        <p className="mt-1 text-xs text-stone-400">Create your first category to get started.</p>
      </div>
    )
  }

  const empty = (
    <div className="p-10 text-center">
      <p className="text-sm text-stone-500">No categories match these filters.</p>
      {filtersActive && (
        <button type="button" onClick={resetFilters} className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700 cursor-pointer">
          Clear filters
        </button>
      )}
    </div>
  )

  const statCards: { label: string; value: number; tone: string; active: boolean; onClick: () => void }[] = [
    { label: 'Total categories', value: stats.total, tone: 'text-stone-900', active: !filtersActive, onClick: resetFilters },
    { label: 'Active', value: stats.active, tone: 'text-emerald-600', active: status === 'active', onClick: () => { resetFilters(); setStatus('active') } },
    { label: 'Inactive', value: stats.inactive, tone: 'text-stone-500', active: status === 'inactive', onClick: () => { resetFilters(); setStatus('inactive') } },
    { label: 'Without image', value: stats.noImage, tone: 'text-amber-600', active: imageFilter === 'without', onClick: () => { resetFilters(); setImageFilter('without') } },
    { label: 'No products', value: stats.empty, tone: 'text-red-600', active: productsFilter === 'empty', onClick: () => { resetFilters(); setProductsFilter('empty') } },
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
            placeholder="Search name, slug or description…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={imageFilter} onChange={(e) => setImageFilter(e.target.value as ImageFilter)} className={selectClass} aria-label="Image">
            <option value="all">Any image</option>
            <option value="with">With image</option>
            <option value="without">Without image</option>
          </select>
          <select value={productsFilter} onChange={(e) => setProductsFilter(e.target.value as ProductsFilter)} className={selectClass} aria-label="Products">
            <option value="all">Any products</option>
            <option value="with">Has products</option>
            <option value="empty">No products</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass} aria-label="Sort by">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="most">Most products</option>
            <option value="fewest">Fewest products</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          Showing {filtered.length} of {stats.total} {stats.total === 1 ? 'category' : 'categories'}
          {filtersActive && (
            <button type="button" onClick={resetFilters} className="ml-2 inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 cursor-pointer">
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Grid view: one card per category */}
      <div className={cardsClass}>
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-stone-200 bg-white">{empty}</div>
        ) : (
          filtered.map((category) => (
            <div key={category.id} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {thumb(category, 'h-14 w-14', '56px')}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {category.name}
                    {tag(category)}
                  </p>
                  <p className="truncate font-mono text-xs text-stone-400">{category.slug}</p>
                </div>
                {statusChip(category)}
              </div>

              {category.description && (
                <p className="line-clamp-2 text-xs text-stone-500">{category.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-stone-500">
                <Link href="/admin/products" className="font-semibold text-stone-700 hover:text-orange-600">
                  {productsText(category.product_count)}
                </Link>
                {!category.image_url && <span className="text-amber-600">No image</span>}
                <span suppressHydrationWarning>Added {formatDate(category.created_at)}</span>
              </div>

              <div className="flex gap-2 border-t border-stone-100 pt-3">
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
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
                {['Category', 'Slug', 'Products', 'Status', 'Created'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>{empty}</td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-stone-50/50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3.5">
                        {thumb(category, 'h-14 w-14', '56px')}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900">
                            {category.name}
                            {tag(category)}
                          </p>
                          {category.description && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-stone-400">{category.description}</p>
                          )}
                          {!category.image_url && <p className="mt-0.5 text-[11px] text-amber-600">No image</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <code className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{category.slug}</code>
                    </td>
                    <td className="px-6 py-3.5">
                      <Link href="/admin/products" className="text-sm font-semibold text-stone-700 hover:text-orange-600" title="View products">
                        {category.product_count}
                        <span className="ml-1 text-xs font-normal text-stone-400">{category.product_count === 1 ? 'product' : 'products'}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">{statusChip(category)}</td>
                    <td className="px-6 py-3.5 text-sm text-stone-500" suppressHydrationWarning>
                      {formatDate(category.created_at)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(category)}
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
