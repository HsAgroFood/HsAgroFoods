'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Ticket, X, Sparkles, Copy, Check } from 'lucide-react'
import {
  createCoupon,
  updateCoupon,
  setCouponActive,
  deleteCoupon,
  type CouponInput,
} from '@/actions/coupons'
import { describeCoupon, type CouponType } from '@/lib/coupons'

export type CouponListItem = {
  id: string
  code: string
  discount_type: CouponType
  discount_value: number
  min_order_amount: number
  usage_limit: number | null
  per_customer_limit: number | null
  is_public: boolean
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  used: number
  discountGiven: number
}

type FormState = {
  code: string
  discount_type: CouponType
  discount_value: string
  min_order_amount: string
  usage_limit: string
  per_customer_limit: string
  is_public: boolean
  starts_at: string
  expires_at: string
  is_active: boolean
}

const emptyForm: FormState = {
  code: '',
  discount_type: 'percent',
  discount_value: '10',
  min_order_amount: '0',
  usage_limit: '',
  per_customer_limit: '1',
  is_public: true,
  starts_at: '',
  expires_at: '',
  is_active: true,
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

// <input type="datetime-local"> works in local time without a timezone
const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const toIso = (local: string) => (local ? new Date(local).toISOString() : null)
const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v))

function randomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 2; i++) code += digits[Math.floor(Math.random() * digits.length)]
  return code
}

function couponStatus(c: CouponListItem, now: number) {
  if (!c.is_active) return { label: 'Off', cls: 'bg-stone-100 text-stone-500' }
  if (c.expires_at && new Date(c.expires_at).getTime() < now) return { label: 'Expired', cls: 'bg-red-50 text-red-700' }
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700' }
  if (c.usage_limit != null && c.used >= c.usage_limit) return { label: 'Used up', cls: 'bg-amber-50 text-amber-700' }
  return { label: 'Live', cls: 'bg-emerald-50 text-emerald-700' }
}

const fieldClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500'
const labelClass = 'block text-xs font-bold text-stone-700 mb-1'

export function CouponsManager({ initialCoupons }: { initialCoupons: CouponListItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const coupons = initialCoupons
  const liveCount = coupons.filter((c) => couponStatus(c, now).label === 'Live').length
  const totalUses = coupons.reduce((s, c) => s + c.used, 0)
  const totalGiven = coupons.reduce((s, c) => s + c.discountGiven, 0)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  function openNew() {
    setForm({ ...emptyForm, code: randomCode() })
    setEditingId('new')
    setError(null)
  }

  function openEdit(c: CouponListItem) {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount),
      usage_limit: c.usage_limit == null ? '' : String(c.usage_limit),
      per_customer_limit: c.per_customer_limit == null ? '' : String(c.per_customer_limit),
      is_public: c.is_public,
      starts_at: toLocalInput(c.starts_at),
      expires_at: toLocalInput(c.expires_at),
      is_active: c.is_active,
    })
    setEditingId(c.id)
    setError(null)
  }

  function flash(text: string) {
    setNotice(text)
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 3500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input: CouponInput = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount || 0),
      usage_limit: numOrNull(form.usage_limit),
      per_customer_limit: numOrNull(form.per_customer_limit),
      is_public: form.is_public,
      starts_at: toIso(form.starts_at),
      expires_at: toIso(form.expires_at),
      is_active: form.is_active,
    }

    startTransition(async () => {
      const res = editingId === 'new' ? await createCoupon(input) : await updateCoupon(editingId as string, input)
      if (!res.success) {
        setError(res.error || 'Could not save the coupon.')
        return
      }
      flash(editingId === 'new' ? `Coupon ${form.code.toUpperCase()} created.` : 'Coupon updated.')
      setEditingId(null)
      router.refresh()
    })
  }

  function handleToggle(c: CouponListItem) {
    startTransition(async () => {
      const res = await setCouponActive(c.id, !c.is_active)
      if (!res.success) return flash(res.error || 'Could not update the coupon.')
      router.refresh()
    })
  }

  function handleDelete(c: CouponListItem) {
    const warn =
      c.used > 0
        ? `\n\nIt was used on ${c.used} order${c.used === 1 ? '' : 's'}. Those orders keep their discount.`
        : ''
    if (!confirm(`Delete coupon ${c.code}?${warn}`)) return
    startTransition(async () => {
      const res = await deleteCoupon(c.id)
      if (!res.success) return flash(res.error || 'Could not delete the coupon.')
      flash(`Coupon ${c.code} deleted.`)
      router.refresh()
    })
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  const previewDescription = (() => {
    const value = Number(form.discount_value)
    if (!Number.isFinite(value) || value <= 0) return null
    return describeCoupon({
      code: form.code,
      discount_type: form.discount_type,
      discount_value: value,
      min_order_amount: Number(form.min_order_amount || 0),
    })
  })()

  return (
    <div className="space-y-6">
      {/* Summary + add */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-3 flex-1 min-w-[280px] max-w-xl">
          {[
            { label: 'Live coupons', value: String(liveCount) },
            { label: 'Times used', value: String(totalUses) },
            { label: 'Discount given', value: inr(totalGiven) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-stone-200/80 bg-white px-4 py-3">
              <p className="text-xs text-stone-500">{s.label}</p>
              <p className="text-xl font-bold text-stone-900">{s.value}</p>
            </div>
          ))}
        </div>
        {editingId === null && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 cursor-pointer sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            New coupon
          </button>
        )}
      </div>

      {notice && (
        <div role="status" className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          {notice}
        </div>
      )}

      {/* Form */}
      {editingId !== null && (
        <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
              <Ticket className="w-4 h-4 text-orange-600" />
              {editingId === 'new' ? 'Create coupon' : `Edit ${form.code}`}
            </h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-white hover:text-stone-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">{error}</p>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="c-code">Coupon code</label>
              <div className="flex gap-2">
                <input
                  id="c-code"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
                  maxLength={24}
                  placeholder="WELCOME10"
                  required
                  className={`${fieldClass} font-mono font-bold tracking-wide uppercase`}
                />
                <button
                  type="button"
                  onClick={() => set('code', randomCode())}
                  title="Generate a code"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Discount type</label>
              <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-stone-200">
                {(['percent', 'flat'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('discount_type', t)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold cursor-pointer ${
                      form.discount_type === t ? 'bg-orange-500 text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t === 'percent' ? 'Percentage (%)' : 'Flat amount (₹)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="c-value">
                  {form.discount_type === 'percent' ? 'Percent off' : 'Rupees off'}
                </label>
                <input
                  id="c-value"
                  type="number"
                  min="0"
                  step="any"
                  value={form.discount_value}
                  onChange={(e) => set('discount_value', e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="c-min">Minimum order (₹)</label>
              <input
                id="c-min"
                type="number"
                min="0"
                step="any"
                value={form.min_order_amount}
                onChange={(e) => set('min_order_amount', e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="c-limit">Total uses</label>
                <input
                  id="c-limit"
                  type="number"
                  min="1"
                  step="1"
                  value={form.usage_limit}
                  onChange={(e) => set('usage_limit', e.target.value)}
                  placeholder="Unlimited"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="c-per">Uses per customer</label>
                <input
                  id="c-per"
                  type="number"
                  min="1"
                  step="1"
                  value={form.per_customer_limit}
                  onChange={(e) => set('per_customer_limit', e.target.value)}
                  placeholder="Unlimited"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="c-start">Starts (optional)</label>
              <input
                id="c-start"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => set('starts_at', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="c-end">Expires (optional)</label>
              <input
                id="c-end"
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => set('expires_at', e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            Active (customers can use it)
          </label>

          <label className="flex items-start gap-2 text-sm font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => set('is_public', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <span>
              Suggest this coupon in the cart
              <span className="block text-xs font-normal text-stone-500">
                When a customer&apos;s cart qualifies, the code is shown under the coupon box so they can tap to apply it.
                Turn this off for secret codes you share only with specific people.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4">
            <p className="text-xs text-stone-500">
              {previewDescription ? (
                <>
                  Customers will see: <strong className="text-stone-800">{form.code || 'CODE'}</strong> · {previewDescription}
                  {Number(form.min_order_amount) > 0 && <> on orders of {inr(Number(form.min_order_amount))}+</>}
                </>
              ) : (
                'Enter a discount value to preview.'
              )}
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 sm:flex-none rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
              >
                {isPending ? 'Saving...' : editingId === 'new' ? 'Create coupon' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">No coupons yet</p>
            <p className="mt-1 text-xs text-stone-400">Click &quot;New coupon&quot; to create your first discount code.</p>
          </div>
        ) : (
          <>
            {/* Phones: one card per coupon (the wide table is for tablets and up) */}
            <div className="divide-y divide-stone-100 md:hidden">
              {coupons.map((c) => {
                const status = couponStatus(c, now)
                return (
                  <div key={c.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <code className="rounded bg-stone-100 px-2 py-0.5 font-mono text-sm font-bold text-stone-800">{c.code}</code>
                        <button
                          type="button"
                          onClick={() => copyCode(c.code)}
                          title="Copy code"
                          className="text-stone-400 hover:text-orange-600 cursor-pointer"
                        >
                          {copied === c.code ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        {!c.is_public && (
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">Hidden</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(c)}
                        disabled={isPending}
                        title={c.is_active ? 'Tap to switch off' : 'Tap to switch on'}
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer ${status.cls}`}
                      >
                        {status.label}
                      </button>
                    </div>

                    <p className="text-base font-bold text-stone-900">{describeCoupon(c)}</p>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <dt className="text-stone-400">Min order</dt>
                        <dd className="font-medium text-stone-700">{c.min_order_amount > 0 ? inr(c.min_order_amount) : 'None'}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Per customer</dt>
                        <dd className="font-medium text-stone-700">{c.per_customer_limit ?? 'Unlimited'}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Used</dt>
                        <dd className="font-medium text-stone-700">
                          {c.used}
                          {c.usage_limit != null && <span className="text-stone-400"> / {c.usage_limit}</span>}
                          {c.discountGiven > 0 && <span className="text-stone-400"> · {inr(c.discountGiven)} saved</span>}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Validity</dt>
                        <dd className="font-medium text-stone-700" suppressHydrationWarning>
                          {c.expires_at
                            ? `Until ${new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'No expiry'}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={isPending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-stone-50/60 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Rules</th>
                  <th className="px-5 py-3">Used</th>
                  <th className="px-5 py-3">Validity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map((c) => {
                  const status = couponStatus(c, now)
                  return (
                    <tr key={c.id} className="hover:bg-stone-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-stone-100 px-2 py-0.5 font-mono text-sm font-bold text-stone-800">{c.code}</code>
                          {!c.is_public && (
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500" title="Not suggested in the cart">
                              Hidden
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => copyCode(c.code)}
                            title="Copy code"
                            className="text-stone-400 hover:text-orange-600 cursor-pointer"
                          >
                            {copied === c.code ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-stone-800">
                        {describeCoupon(c)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-500">
                        <p>{c.min_order_amount > 0 ? `Min order ${inr(c.min_order_amount)}` : 'No minimum'}</p>
                        <p>{c.per_customer_limit ? `${c.per_customer_limit} per customer` : 'Unlimited per customer'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-700">
                        <span className="font-semibold">{c.used}</span>
                        {c.usage_limit != null && <span className="text-stone-400"> / {c.usage_limit}</span>}
                        {c.discountGiven > 0 && <p className="text-xs text-stone-400">{inr(c.discountGiven)} saved</p>}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-500">
                        <p suppressHydrationWarning>
                          {c.starts_at ? `From ${new Date(c.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Starts now'}
                        </p>
                        <p suppressHydrationWarning>
                          {c.expires_at
                            ? `Until ${new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'No expiry'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(c)}
                          disabled={isPending}
                          title={c.is_active ? 'Click to switch off' : 'Click to switch on'}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer ${status.cls}`}
                        >
                          {status.label}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-2 text-stone-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            disabled={isPending}
                            className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
