'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveReview, deleteReview, unapproveReview } from '@/actions/admin/reviews'
import { Star, CheckCircle, Trash2, Clock, Eye, XCircle, X } from 'lucide-react'
import { ViewToggle, useViewMode } from '@/components/admin/ViewToggle'

type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  review_text: string | null
  is_approved: boolean
  created_at: string
  products: { name: string } | null
  profiles: { full_name: string; email: string } | null
}

export function ReviewList({ initialReviews }: { initialReviews: Review[] }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Review | null>(null)

  useEffect(() => {
    if (!viewing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewing(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing])

  const pendingCount = initialReviews.filter((r) => !r.is_approved).length
  const approvedCount = initialReviews.length - pendingCount
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>(pendingCount > 0 ? 'pending' : 'all')
  const { view, setView, cardsClass, tableClass } = useViewMode()

  const reviews = useMemo(() => {
    if (filter === 'pending') return initialReviews.filter((r) => !r.is_approved)
    if (filter === 'approved') return initialReviews.filter((r) => r.is_approved)
    return initialReviews
  }, [filter, initialReviews])

  async function handleApprove(id: string): Promise<boolean> {
    if (!confirm('Approve this review? It will be shown on the product page of the website.')) return false
    
    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)
    
    const result = await approveReview({}, formData)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setIsProcessing(null)
    return !result.error
  }

  async function handleUnapprove(id: string): Promise<boolean> {
    if (!confirm('Hide this review from the website? It will go back to Pending.')) return false

    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)

    const result = await unapproveReview({}, formData)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setIsProcessing(null)
    return !result.error
  }

  async function handleDelete(id: string): Promise<boolean> {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) return false
    
    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)
    
    const result = await deleteReview({}, formData)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setIsProcessing(null)
    return !result.error
  }

  if (initialReviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <p className="text-stone-500">No reviews found.</p>
      </div>
    )
  }

  const tabs: { key: typeof filter; label: string; short: string; count: number }[] = [
    { key: 'pending', label: 'Pending approval', short: 'Pending', count: pendingCount },
    { key: 'approved', label: 'Approved', short: 'Approved', count: approvedCount },
    { key: 'all', label: 'All', short: 'All', count: initialReviews.length },
  ]

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setFilter(tab.key)}
          className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
            filter === tab.key
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="sm:hidden">{tab.short}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              filter === tab.key
                ? 'bg-white/20 text-white'
                : tab.key === 'pending' && tab.count > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-stone-100 text-stone-500'
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-stone-500">
        {pendingCount > 0
          ? 'New customer reviews stay hidden from the website until you approve them.'
          : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
      </p>
      <ViewToggle view={view} onChange={setView} />
    </div>

    {/* Grid view: one card per review */}
    <div className={cardsClass}>
        {reviews.length === 0 && (
          <p className="col-span-full rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            {filter === 'pending' ? 'No reviews waiting for approval.' : 'No reviews in this view.'}
          </p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              {review.is_approved ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              )}
              <span suppressHydrationWarning className="text-xs text-stone-400">
                {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-stone-900">{review.products?.name || 'Unknown Product'}</p>
              <p className="text-xs text-stone-500">
                {review.profiles?.full_name || 'Anonymous'}
                {review.profiles?.email ? ` · ${review.profiles.email}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`}
                />
              ))}
            </div>

            <div>
              <p className="text-sm text-stone-600 whitespace-pre-line break-words line-clamp-3">
                {review.review_text || <span className="italic text-stone-400">No text</span>}
              </p>
              {review.review_text && (review.review_text.length > 110 || review.review_text.split('\n').length > 3) && (
                <button
                  type="button"
                  onClick={() => setViewing(review)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  See full review
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setViewing(review)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              {review.is_approved ? (
                <button
                  type="button"
                  onClick={() => handleUnapprove(review.id)}
                  disabled={isProcessing === review.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Hide
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApprove(review.id)}
                  disabled={isProcessing === review.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                disabled={isProcessing === review.id}
                aria-label="Delete review"
                className="flex items-center justify-center rounded-lg border border-stone-200 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
    </div>

    {/* Table view */}
    <div className={`bg-white rounded-2xl border border-stone-200 overflow-hidden ${tableClass}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Rating</th>
              <th className="p-4 font-semibold">Review</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-sm text-stone-500">
                  {filter === 'pending' ? 'No reviews waiting for approval.' : 'No reviews in this view.'}
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  {review.is_approved ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium text-stone-900">{review.products?.name || 'Unknown Product'}</div>
                  <div className="text-xs text-stone-500">ID: {review.product_id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-stone-900">{review.profiles?.full_name || 'Anonymous'}</div>
                  <div className="text-xs text-stone-500">{review.profiles?.email || ''}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <p className="text-sm text-stone-600 whitespace-pre-line break-words line-clamp-2">
                    {review.review_text || <span className="italic text-stone-400">No text</span>}
                  </p>
                  {review.review_text && (review.review_text.length > 90 || review.review_text.split('\n').length > 2) && (
                    <button
                      type="button"
                      onClick={() => setViewing(review)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      See full review
                    </button>
                  )}
                  <div suppressHydrationWarning className="text-xs text-stone-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setViewing(review)}
                      className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      title="View full review"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!review.is_approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={isProcessing === review.id}
                        className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {review.is_approved && (
                      <button
                        onClick={() => handleUnapprove(review.id)}
                        disabled={isProcessing === review.id}
                        className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Hide from website"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isProcessing === review.id}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {viewing && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        onClick={() => setViewing(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Full review"
      >
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">Customer review</h3>
              <p className="text-sm text-stone-500">{viewing.products?.name || 'Unknown Product'}</p>
            </div>
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{viewing.profiles?.full_name || 'Anonymous'}</p>
                <p className="text-xs text-stone-500">{viewing.profiles?.email || ''}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5 justify-end">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < viewing.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`}
                    />
                  ))}
                </div>
                <p suppressHydrationWarning className="mt-1 text-xs text-stone-400">
                  {new Date(viewing.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                viewing.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {viewing.is_approved ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {viewing.is_approved ? 'Approved - visible on website' : 'Pending - hidden from website'}
            </span>

            <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
              <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap break-words">
                {viewing.review_text || <span className="italic text-stone-400">No text</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-stone-100 p-4">
            {viewing.is_approved ? (
              <button
                type="button"
                disabled={isProcessing === viewing.id}
                onClick={async () => {
                  if (await handleUnapprove(viewing.id)) setViewing(null)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Hide from website
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessing === viewing.id}
                onClick={async () => {
                  if (await handleApprove(viewing.id)) setViewing(null)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}
            <button
              type="button"
              disabled={isProcessing === viewing.id}
              onClick={async () => {
                if (await handleDelete(viewing.id)) setViewing(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
