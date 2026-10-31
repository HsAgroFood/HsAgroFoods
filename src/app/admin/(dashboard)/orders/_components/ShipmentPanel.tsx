'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Check, CheckCircle2, AlertCircle, Box, Loader2, RotateCcw, Copy } from 'lucide-react'
import { createShipmentAction } from '@/actions/shipments'
import TrackShipmentModal from '@/components/shipping/TrackShipmentModal'

type Parcel = { weight_kg: number; length_cm: number; width_cm: number; height_cm: number }

type Props = {
  orderId: string
  defaults: Parcel
  shipmentStatus: string | null
  awbNumber: string | null
  courierName: string | null
  shipmentError: string | null
  booked: Parcel | null
  configured: boolean
  blockedReason: string | null
}

const FIELD =
  'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 pr-9 text-sm text-stone-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20'

function DimensionInput({
  label,
  unit,
  value,
  step,
  min,
  onChange,
}: {
  label: string
  unit: string
  value: string
  step: string
  min: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-stone-600">{label}</label>
      <div className="relative">
        <input type="number" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD} />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">{unit}</span>
      </div>
    </div>
  )
}

export function ShipmentPanel({
  orderId,
  defaults,
  shipmentStatus,
  awbNumber,
  courierName,
  shipmentError,
  booked,
  configured,
  blockedReason,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ error?: string; success?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const toFields = (p: Parcel) => ({
    weight: String(p.weight_kg),
    length: String(p.length_cm),
    width: String(p.width_cm),
    height: String(p.height_cm),
  })
  const [dims, setDims] = useState(toFields(defaults))

  const handleCreate = () => {
    setMessage(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('length', dims.length)
      fd.set('width', dims.width)
      fd.set('height', dims.height)
      fd.set('weight', dims.weight)

      const result = await createShipmentAction(orderId, fd)
      if ('error' in result) {
        setMessage({ error: result.error })
      } else {
        setMessage({ success: `Shipment created. AWB ${result.waybill}` })
        router.refresh()
      }
    })
  }

  const copyAwb = () => {
    if (!awbNumber) return
    navigator.clipboard.writeText(awbNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const shell = 'bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6'
  const heading = (
    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
      <Truck className="w-5 h-5 text-stone-400" />
      Shipping &amp; Logistics
    </h3>
  )

  // Already booked: show courier + AWB + tracking
  if (shipmentStatus === 'created' && awbNumber) {
    return (
      <div className={shell}>
        {heading}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Shipment booked
          </div>
          {courierName && (
            <div className="flex justify-between text-stone-600">
              <span>Courier</span>
              <span className="font-medium text-stone-900 capitalize">{courierName}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-stone-600">
            <span>AWB</span>
            <span className="flex items-center gap-1.5 font-mono font-medium text-stone-900">
              {awbNumber}
              <button type="button" onClick={copyAwb} title="Copy AWB" className="text-stone-400 hover:text-stone-700 cursor-pointer">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </span>
          </div>
          {booked && (
            <div className="flex justify-between text-stone-600">
              <span>Parcel</span>
              <span className="font-medium text-stone-900">
                {booked.weight_kg} kg · {booked.length_cm}×{booked.width_cm}×{booked.height_cm} cm
              </span>
            </div>
          )}
          <div className="pt-2">
            <TrackShipmentModal orderId={orderId} awb={awbNumber} variant="admin" />
          </div>
        </div>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className={shell}>
        {heading}
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            iThink Logistics is not configured yet. Add <code>ITHINK_ACCESS_TOKEN</code>, <code>ITHINK_SECRET_KEY</code>{' '}
            and <code>ITHINK_PICKUP_ADDRESS_ID</code> to the environment variables.
          </span>
        </div>
      </div>
    )
  }

  if (blockedReason) {
    return (
      <div className={shell}>
        {heading}
        <div className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
          <span>{blockedReason}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={shell}>
      {heading}

      <div className="space-y-4">
        {shipmentStatus === 'failed' && shipmentError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Last attempt failed: {shipmentError}</span>
          </div>
        )}
        {message?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message.error}</span>
          </div>
        )}
        {message?.success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message.success}</span>
          </div>
        )}

        {/* Parcel weight & dimensions: pre-filled from the products, editable */}
        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Box className="h-3.5 w-3.5" />
              Parcel weight &amp; size
            </span>
            <button
              type="button"
              onClick={() => setDims(toFields(defaults))}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-orange-600 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to product defaults
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DimensionInput label="Weight (kg)" unit="kg" min="0.05" step="0.01" value={dims.weight} onChange={(v) => setDims((d) => ({ ...d, weight: v }))} />
            <DimensionInput label="Length (cm)" unit="cm" min="1" step="0.1" value={dims.length} onChange={(v) => setDims((d) => ({ ...d, length: v }))} />
            <DimensionInput label="Width (cm)" unit="cm" min="1" step="0.1" value={dims.width} onChange={(v) => setDims((d) => ({ ...d, width: v }))} />
            <DimensionInput label="Height (cm)" unit="cm" min="1" step="0.1" value={dims.height} onChange={(v) => setDims((d) => ({ ...d, height: v }))} />
          </div>
          <p className="text-[11px] text-stone-400">
            Auto-filled from this order&apos;s products. Change them if the real packed parcel differs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60 cursor-pointer"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          {pending ? 'Generating AWB...' : shipmentStatus === 'failed' ? 'Retry shipment' : 'Create shipment'}
        </button>
        <p className="text-center text-[11px] text-stone-400">
          The courier is assigned by iThink using the Courier Priority set in your iThink dashboard.
        </p>
      </div>
    </div>
  )
}
