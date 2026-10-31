'use client'

import { useEffect, useState, useTransition } from 'react'
import { Route, X, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { trackOrderShipmentAction } from '@/actions/shipments'
import ShipmentTimeline from '@/components/shipping/ShipmentTimeline'
import type { ShipmentTracking } from '@/lib/ithink'
import { ithinkTrackingUrl } from '@/lib/trackingLinks'

function TrackingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading tracking">
      <div className="rounded-2xl border border-stone-200/80 p-5 space-y-4">
        <div className="h-3 w-24 rounded bg-stone-200" />
        <div className="h-7 w-36 rounded-full bg-stone-200" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-14 rounded-xl bg-stone-100" />
          <div className="h-14 rounded-xl bg-stone-100" />
        </div>
        <div className="flex justify-between pt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-stone-200" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-stone-200" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-2/3 rounded bg-stone-200" />
              <div className="h-3 w-1/3 rounded bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Same tracking view for the customer ("Track Shipment") and the admin ("Track Parcel").
export default function TrackShipmentModal({
  orderId,
  awb,
  variant = 'customer',
}: {
  orderId: string
  awb: string
  variant?: 'customer' | 'admin'
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = () => {
    setError(null)
    startTransition(async () => {
      const result = await trackOrderShipmentAction(orderId)
      if ('error' in result) {
        setTracking(null)
        setError(result.error)
      } else {
        setTracking(result.tracking)
      }
    })
  }

  const openModal = () => {
    setOpen(true)
    setTracking(null)
    load()
  }

  // Close on Escape and stop the page behind from scrolling while the sheet is open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const copyAwb = () => {
    navigator.clipboard.writeText(awb)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  // Two equal-height buttons: a filled primary "Track" and an outlined "Open on iThink"
  const base =
    'inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] px-4 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]'
  const primaryClass =
    variant === 'admin'
      ? `${base} bg-orange-600 text-white hover:bg-orange-700 shadow-xs`
      : `${base} bg-[#E07B0C] text-white hover:bg-[#C86A08] shadow-xs`
  const secondaryClass =
    variant === 'admin'
      ? `${base} border border-stone-200 bg-white text-stone-700 hover:bg-stone-50`
      : `${base} border border-[#E8DFD5] bg-white text-[#14361F] hover:border-[#E07B0C] hover:text-[#E07B0C]`

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={openModal} className={primaryClass}>
          <Route className="h-3.5 w-3.5" />
          {variant === 'admin' ? 'Track Parcel' : 'Track Shipment'}
        </button>
        <a href={ithinkTrackingUrl(awb)} target="_blank" rel="noopener noreferrer" className={secondaryClass}>
          <ExternalLink className="h-3.5 w-3.5" />
          Open on iThink
        </a>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-stone-900/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Shipment tracking"
        >
          <div
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-stone-50 shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 bg-white px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-stone-900">Shipment Tracking</h3>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">AWB</span>
                  <span className="font-mono text-xs font-semibold text-stone-700">{awb}</span>
                  <button
                    type="button"
                    onClick={copyAwb}
                    title={copied ? 'Copied' : 'Copy AWB number'}
                    aria-label="Copy AWB number"
                    className="rounded p-0.5 text-stone-400 transition-colors hover:text-stone-700 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body: thin, quiet scrollbar */}
            <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-color:#E2D8CB_transparent] [scrollbar-width:thin]">
              {pending && !tracking && <TrackingSkeleton />}

              {error && !pending && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                  <p className="mt-2 text-sm font-semibold text-red-800">Could not load tracking</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={load}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              )}

              {tracking && (
                <div className={pending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                  <ShipmentTimeline tracking={tracking} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-stone-200/80 bg-white px-5 py-3">
              <button
                type="button"
                onClick={load}
                disabled={pending}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 transition-colors hover:text-orange-600 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${pending ? 'animate-spin' : ''}`} />
                {pending ? 'Refreshing...' : 'Refresh'}
              </button>
              <a
                href={ithinkTrackingUrl(awb)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 transition-colors hover:text-orange-600"
              >
                Open on iThink
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
