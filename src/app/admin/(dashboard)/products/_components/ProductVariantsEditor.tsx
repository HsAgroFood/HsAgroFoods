'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { createProductVariant, updateProductVariant, deleteProductVariant } from '@/actions/products'

type Variant = {
  id: string
  product_id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
  is_active: boolean
}

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
  })

  const resetForm = () => {
    setFormData({
      variant_name: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      is_active: true,
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
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Variant Name (e.g. 100g, Large)</label>
              <input
                required
                type="text"
                maxLength={100}
                value={formData.variant_name}
                onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                max="300000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Original Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="300000"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Qty</label>
              <input
                required
                type="number"
                min="0"
                max="1000"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-5 flex items-center justify-between mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isPending}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Variant
                </button>
              </div>
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
