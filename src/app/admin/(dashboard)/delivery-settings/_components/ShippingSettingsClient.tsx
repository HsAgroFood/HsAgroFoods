'use client'

import React, { useState, useTransition } from 'react'
import {
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Info,
  Eye,
  Calculator,
} from 'lucide-react'
import { updateShippingConfig, type ShippingConfig } from '@/actions/shipping'
import { shippingCopy } from '@/lib/shippingText'

const THRESHOLD_PRESETS: { label: string; value: number }[] = [
  { label: 'Free on all orders', value: 0 },
  { label: '₹299', value: 299 },
  { label: '₹499', value: 499 },
  { label: '₹999', value: 999 },
]

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

function toAmount(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

export function ShippingSettingsClient({
  initialConfig,
}: {
  initialConfig: ShippingConfig
}) {
  const [saved, setSaved] = useState<ShippingConfig>(initialConfig)
  const [threshold, setThreshold] = useState(String(initialConfig.free_shipping_threshold))
  const [shippingCost, setShippingCost] = useState(String(initialConfig.standard_shipping_cost))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const thresholdValue = toAmount(threshold)
  const costValue = toAmount(shippingCost)
  const isValid = thresholdValue !== null && costValue !== null

  const draft: ShippingConfig = {
    free_shipping_threshold: thresholdValue ?? saved.free_shipping_threshold,
    standard_shipping_cost: costValue ?? saved.standard_shipping_cost,
  }
  const dirty =
    draft.free_shipping_threshold !== saved.free_shipping_threshold ||
    draft.standard_shipping_cost !== saved.standard_shipping_cost
  const copy = shippingCopy(draft)

  // Sample orders to show exactly what a customer would pay
  const sampleSubtotals = copy.freeForAll
    ? [200, 500, 1000]
    : Array.from(
        new Set([
          Math.max(1, Math.round(draft.free_shipping_threshold / 2)),
          Math.max(1, draft.free_shipping_threshold - 1),
          draft.free_shipping_threshold,
        ])
      )

  const handleReset = () => {
    setThreshold(String(saved.free_shipping_threshold))
    setShippingCost(String(saved.standard_shipping_cost))
    setMessage(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !dirty) return
    setMessage(null)

    startTransition(async () => {
      const res = await updateShippingConfig(thresholdValue, costValue)
      if (res.success) {
        setSaved({ free_shipping_threshold: thresholdValue, standard_shipping_cost: costValue })
        setMessage({
          type: 'success',
          text: `Saved. Storefront now shows: "${copy.deliveryAbove}".`,
        })
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Failed to save settings.',
        })
      }
    })
  }

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 rounded-xl border bg-stone-50/50 text-stone-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-mono'

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Delivery &amp; Shipping Settings</h1>
          <p className="text-sm text-stone-500 mt-1">
            Set the free delivery threshold and standard shipping fee. Changes apply instantly across
            the navbar, footer, product pages, cart, checkout and emails.
          </p>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          role="status"
          className={`p-4 rounded-xl flex items-center gap-3 border text-sm animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Settings Form Card */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-3 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Free Shipping Minimum Threshold */}
          <div>
            <label htmlFor="threshold" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Free Delivery Above (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">₹</span>
              <input
                type="number"
                id="threshold"
                min="0"
                step="1"
                inputMode="numeric"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
                className={`${inputClass} ${thresholdValue === null ? 'border-red-300' : 'border-stone-200'}`}
                placeholder="499"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {THRESHOLD_PRESETS.map((p) => {
                const active = thresholdValue === p.value
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setThreshold(String(p.value))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Orders with a subtotal at or above this amount get free delivery. Set <strong>0</strong> to
              make delivery free on every order.
            </p>
          </div>

          {/* Standard Delivery Fee */}
          <div>
            <label htmlFor="cost" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Standard Shipping Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">₹</span>
              <input
                type="number"
                id="cost"
                min="0"
                step="1"
                inputMode="numeric"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                required
                className={`${inputClass} ${costValue === null ? 'border-red-300' : 'border-stone-200'}`}
                placeholder="90"
              />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Charged when the order is below the free delivery amount.
            </p>
          </div>

          {copy.freeForAll && isValid && (
            <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                {draft.free_shipping_threshold <= 0
                  ? 'Free delivery threshold is ₹0, so every order ships free and the standard fee is never charged.'
                  : 'Standard shipping fee is ₹0, so every order ships free whatever the threshold is.'}
              </p>
            </div>
          )}

          {!isValid && (
            <p className="text-xs font-medium text-red-600">Enter a valid amount (0 or more) in both fields.</p>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-500">
              {dirty ? (
                <span className="font-semibold text-amber-600">Unsaved changes</span>
              ) : (
                <>
                  Live: free above <strong>{inr(saved.free_shipping_threshold)}</strong>, fee{' '}
                  <strong>{inr(saved.standard_shipping_cost)}</strong>
                </>
              )}
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={!dirty || isPending}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                disabled={isPending || !dirty || !isValid}
                className="flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
              >
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Preview column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storefront preview */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-stone-400" />
              <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Storefront preview
              </h2>
              {dirty && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Not saved
                </span>
              )}
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg bg-[#FAF7F2] border border-[#EDE4D9] px-3 py-2 text-[#14361F] font-semibold">
                🚚 {copy.acrossIndia}
              </div>
              <div className="rounded-lg bg-[#FAF7F2] border border-[#EDE4D9] px-3 py-2">
                <p className="font-bold text-[#14361F]">{copy.deliveryShort}</p>
                <p className="text-[#7A6458]">Safe pan-India dispatch</p>
              </div>
              <div className="rounded-lg bg-[#FAF7F2] border border-[#EDE4D9] px-3 py-2">
                <p className="font-bold text-[#14361F]">Free Shipping</p>
                <p className="text-[#7A6458]">{copy.ordersAbove}</p>
              </div>
            </div>
          </div>

          {/* Sample orders */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-stone-400" />
              <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                What customers pay
              </h2>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-stone-400">
                  <th className="pb-2 font-medium">Cart subtotal</th>
                  <th className="pb-2 font-medium">Delivery</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sampleSubtotals.map((subtotal) => {
                  const free = subtotal >= draft.free_shipping_threshold
                  const fee = free ? 0 : draft.standard_shipping_cost
                  return (
                    <tr key={subtotal}>
                      <td className="py-2 font-mono text-stone-700">{inr(subtotal)}</td>
                      <td className={`py-2 font-semibold ${fee === 0 ? 'text-emerald-600' : 'text-stone-700'}`}>
                        {fee === 0 ? 'Free' : inr(fee)}
                      </td>
                      <td className="py-2 font-mono font-bold text-stone-900 text-right">{inr(subtotal + fee)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
