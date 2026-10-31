'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { createProductVariant, updateProductVariant, deleteProductVariant } from '@/actions/products'
import { defaultParcelFor } from '@/lib/shippingDefaults'

type Variant = {
  id: string
  product_id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
  is_active: boolean
  weight_kg?: number | string | null
  length_cm?: number | string | null
  width_cm?: number | string | null
  height_cm?: number | string | null
}

// The project has no Tailwind forms plugin, so inputs need an explicit border and padding
const LABEL = 'mb-1 block text-xs font-medium text-gray-600'
const INPUT =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
const PREFIX = 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400'
export function ProductVariantsEditor({
  productId,
  variants,
}: {
  productId: string
  variants: Variant[]
}) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState({
    variant_name: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    is_active: true,
    weight_kg: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
  })

  const resetForm = () => {
    setFormData({
      variant_name: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      is_active: true,
      weight_kg: '',
      length_cm: '',
      width_cm: '',
      height_cm: '',
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (variant: Variant) => {
    setFormData({
      variant_name: variant.variant_name,
      price: variant.price.toString(),
      original_price: variant.original_price ? variant.original_price.toString() : '',
      stock_quantity: variant.stock_quantity.toString(),
      is_active: variant.is_active,
      weight_kg: variant.weight_kg != null ? String(variant.weight_kg) : '',
      length_cm: variant.length_cm != null ? String(variant.length_cm) : '',
      width_cm: variant.width_cm != null ? String(variant.width_cm) : '',
      height_cm: variant.height_cm != null ? String(variant.height_cm) : '',
    })
    setEditingId(variant.id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      startTransition(async () => {
        const result = await deleteProductVariant(id, productId)
        if (result.error) {
          alert(result.error)
          return
        }
        router.refresh()
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const fd = new FormData()
      fd.append('product_id', productId)
      fd.append('variant_name', formData.variant_name)
      fd.append('price', formData.price)
      if (formData.original_price) fd.append('original_price', formData.original_price)
      fd.append('stock_quantity', formData.stock_quantity)
      fd.append('weight_kg', formData.weight_kg)
      fd.append('length_cm', formData.length_cm)
      fd.append('width_cm', formData.width_cm)
      fd.append('height_cm', formData.height_cm)
      if (formData.is_active) fd.append('is_active', 'on')
      if (editingId) fd.append('id', editingId)

      const result = editingId
        ? await updateProductVariant({}, fd)
        : await createProductVariant({}, fd)

      if (result.error) {
        alert(result.error)
        return
      }

      resetForm()
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <h4 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit variant' : 'New variant'}</h4>
            <span className="text-xs text-gray-400">Fields marked * are required</span>
          </div>

          <div className="space-y-6 px-5 py-5">
            {/* Pricing & stock */}
            <section>
              <h5 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Pricing &amp; stock</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={LABEL}>Variant name *</label>
                  <input
                    required
                    type="text"
                    maxLength={100}
                    value={formData.variant_name}
                    onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                    placeholder="e.g. 100g Pouch"
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className={LABEL}>Price *</label>
                  <div className="relative">
                    <span className={PREFIX}>₹</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max="300000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`${INPUT} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Original price</label>
                  <div className="relative">
                    <span className={PREFIX}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="300000"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="Optional"
                      className={`${INPUT} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Stock quantity *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className={INPUT}
                  />
                </div>
              </div>
            </section>

            {/* Shipping parcel */}
            <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Shipping parcel</h5>
                <span className="text-xs text-gray-400">Used for courier booking. Leave blank to auto-fill from the pack size.</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {([
                  ['weight_kg', 'Weight', 'kg'],
                  ['length_cm', 'Length', 'cm'],
                  ['width_cm', 'Width', 'cm'],
                  ['height_cm', 'Height', 'cm'],
                ] as const).map(([key, label, unit]) => (
                  <div key={key}>
                    <label className={LABEL}>{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={formData[key]}
                        placeholder={String(defaultParcelFor(formData.variant_name)[key])}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className={`${INPUT} pr-10`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active (visible in the shop)</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save variant
              </button>
            </div>
          </div>
        </form>
      )}

      {variants.length > 0 ? (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Parcel</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {variants.map((variant) => (
                <tr key={variant.id} className={editingId === variant.id ? 'bg-indigo-50' : ''}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {variant.variant_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>₹{variant.price}</span>
                      {variant.original_price && (
                        <span className="text-xs text-gray-400 line-through">₹{variant.original_price}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {variant.stock_quantity}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {variant.weight_kg != null
                      ? `${Number(variant.weight_kg)} kg · ${Number(variant.length_cm)}×${Number(variant.width_cm)}×${Number(variant.height_cm)} cm`
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {variant.is_active ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(variant)}
                        disabled={isPending}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">No variants added yet.</p>
          <p className="text-xs text-gray-400 mt-1">Add variants like "100g", "250g" to this product.</p>
        </div>
      )}
    </div>
  )
}
