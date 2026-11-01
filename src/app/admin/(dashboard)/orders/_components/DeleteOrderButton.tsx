'use client'

import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react'
import { deleteOrder, getOrderDeleteInfo, type OrderDeleteInfo } from '@/actions/admin/orders'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function DeleteOrderButton({
  orderId,
  orderNumber,
  variant = 'icon',
  redirectTo,
}: {
  orderId: string
  orderNumber: string
  variant?: 'icon' | 'button'
  /** Where to go after deleting (used on the order's own page). Without it the list just refreshes. */
  redirectTo?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [info, setInfo] = useState<OrderDeleteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [restoreStock, setRestoreStock] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isPending])

  async function openModal() {
    setOpen(true)
    setInfo(null)
    setError(null)
    setLoadingInfo(true)
    const res = await getOrderDeleteInfo(orderId)
    if (res.success) {
      setInfo(res.info)
      setRestoreStock(res.info.stockDeducted)
    } else {
      setError(res.error)
    }
    setLoadingInfo(false)
  }

  function confirmDelete() {
    setError(null)
    startTransition(async () => {
      const res = await deleteOrder(orderId, restoreStock)
      if (!res.success) {
        setError(res.error || 'Could not delete this order.')
        return
      }
      if (res.warning) alert(res.warning)
      setOpen(false)
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }

  const trigger =
    variant === 'icon' ? (
      <button
        type="button"
        onClick={openModal}
        title="Delete order"
        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    ) : (
      <button
        type="button"
        onClick={openModal}
        aria-label="Delete order"
        title="Delete order"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white p-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer sm:px-4 sm:py-2"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete order</span>
      </button>
    )

  return (
    <>
      {trigger}

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 text-left"
          onClick={() => !isPending && setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Delete order ${orderNumber}`}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-stone-900">Delete order {orderNumber}?</h3>
                  <p className="text-sm text-stone-500">This permanently removes the order. It cannot be undone.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {loadingInfo && (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking the order…
                </div>
              )}

              {info && (
                <>
                  <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-stone-50 text-sm">
                    {[
                      ['Customer', info.customerName],
                      ['Total', inr(info.total)],
                      ['Items', `${info.units} pack${info.units === 1 ? '' : 's'}`],
                      ['Order status', info.orderStatus],
                      ['Payment', `${info.paymentMethod || '-'} · ${info.paymentStatus}`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                        <span className="shrink-0 text-stone-500">{label}</span>
                        <span className="min-w-0 break-words text-right font-medium capitalize text-stone-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  {info.blockedReason && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
                      {info.blockedReason}
                    </p>
                  )}

                  {!info.blockedReason && info.paidOnline && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
                      This order was <strong>paid online</strong>. Deleting it does <strong>not</strong> refund the customer:
                      refund it from Razorpay first if needed.
                    </p>
                  )}

                  {!info.blockedReason && info.stockDeducted && (
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200 p-3 text-left text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={restoreStock}
                        onChange={(e) => setRestoreStock(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>
                        <span className="font-medium">
                          Add {info.units} pack{info.units === 1 ? '' : 's'} back to stock
                        </span>
                        <span className="block text-xs text-stone-500">
                          These packs were taken out of stock when the order was placed or paid.
                        </span>
                      </span>
                    </label>
                  )}
                </>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending || loadingInfo || !info || !!info.blockedReason}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isPending ? 'Deleting…' : 'Yes, delete order'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
