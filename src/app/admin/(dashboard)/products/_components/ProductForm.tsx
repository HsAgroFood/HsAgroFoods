'use client'

import { useState, useActionState } from 'react'
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from '@/actions/products'
import Link from 'next/link'
import { Save, ArrowLeft, IndianRupee } from 'lucide-react'
import { ImageKitUpload } from '@/components/admin/ImageKitUpload'
import type { Category, Product } from '@/types/database'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  initialGalleryImages?: string[]
}

export default function ProductForm({ product, categories, initialGalleryImages = [] }: ProductFormProps) {
  const isEditing = !!product
  const action = isEditing ? updateProduct : createProduct

  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
    {}
  )

  const [featuredImage, setFeaturedImage] = useState(product?.featured_image_url || '')
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages)
  const [sellingPrice, setSellingPrice] = useState('')
  const [mrpPrice, setMrpPrice] = useState('')

  const discountInfo = (() => {
    const sp = parseFloat(sellingPrice)
    const mrp = parseFloat(mrpPrice)
    if (!isNaN(sp) && !isNaN(mrp) && mrp > sp && sp > 0) {
      const diff = Math.round((mrp - sp) * 100) / 100
      const percent = Math.round((diff / mrp) * 100)
      return { diff, percent }
    }
    return null
  })()

  return (
    <form action={formAction} className="space-y-6">
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      {/* Error */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 sm:p-6 space-y-5">
        <h2 className="text-base font-semibold text-stone-900">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              required
              maxLength={255}
              defaultValue={product?.name || ''}
              placeholder="e.g. Turmeric Powder"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
            />
            <p className="text-xs text-stone-400 mt-1.5">
              Slug will be auto-generated from the name.
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="product-category"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Category
            </label>
            <select
              id="product-category"
              name="category_id"
              required
              defaultValue={product?.category_id || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label
            htmlFor="product-short-desc"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Short Description
          </label>
          <input
            id="product-short-desc"
            name="short_description"
            type="text"
            maxLength={500}
            defaultValue={product?.short_description || ''}
            placeholder="Brief one-liner about the product"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="product-description"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Full Description
          </label>
          <textarea
            id="product-description"
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={product?.description || ''}
            placeholder="Detailed product description..."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            id="product-active"
            name="is_active"
            type="checkbox"
            defaultChecked={product?.is_active ?? true}
            className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
          />
          <label
            htmlFor="product-active"
            className="text-sm font-medium text-stone-700"
          >
            Active — visible in the store
          </label>
        </div>

        {/* Featured Status */}
        <div className="flex items-center gap-3">
          <input
            id="product-featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={product?.is_featured ?? false}
            className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
          />
          <label
            htmlFor="product-featured"
            className="text-sm font-medium text-stone-700"
          >
            Featured — highlight on homepage
          </label>
        </div>
      </div>

      {/* Product Images (ImageKit) */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Product Images
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload product photos to ImageKit. The first image will be used as the primary card cover.
          </p>
        </div>

        {/* Primary / Card Image */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                1. Primary / Card Cover Image
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                Main image displayed on product cards, category lists, and search results.
              </p>
            </div>
            {featuredImage && (
              <button
                type="button"
                onClick={() => setFeaturedImage('')}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>

          <input type="hidden" name="featured_image_url" value={featuredImage} />

          {featuredImage ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-500 bg-white shadow-sm group">
              <img
                src={featuredImage}
                alt="Primary product preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">Cover Image</span>
              </div>
            </div>
          ) : (
            <ImageKitUpload
              folder="/products"
              multiple={false}
              buttonLabel="Upload Card Image (ImageKit)"
              onSuccess={(res) => {
                if (res?.url) {
                  setFeaturedImage(res.url)
                }
              }}
            />
          )}
        </div>

        {/* Additional Gallery Images */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Additional Product Images (Gallery)
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                Add multiple angle shots, packaging info, ingredients, or lifestyle photos.
              </p>
            </div>
          </div>

          <input type="hidden" name="gallery_images" value={JSON.stringify(galleryImages)} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs group"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                  title="Remove Image"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-medium">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <ImageKitUpload
              folder="/products"
              multiple={true}
              maxFiles={10}
              buttonLabel="Upload More Images (ImageKit)"
              onSuccess={(res) => {
                if (res?.url) {
                  setGalleryImages((prev) => [...prev, res.url])
                  if (!featuredImage) {
                    setFeaturedImage(res.url)
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Pricing & Initial Variant (Only when creating a new product) */}
      {!isEditing ? (
        <div className="bg-white rounded-xl border border-stone-200/80 p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-orange-600" />
              <span>Pricing & Pack Details</span>
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60">
              Initial Pack
            </span>
          </div>
          <p className="text-xs text-stone-500 -mt-2">
            Set the selling price and actual price (MRP) directly here. More pack sizes can be added on the edit page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Selling Price */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 99"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Customer selling price (बिक्री मूल्य)
              </p>
            </div>

            {/* Actual / Original Price (MRP) */}
            <div>
              <label
                htmlFor="product-original-price"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Actual / MRP Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="product-original-price"
                  name="original_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 149 (optional)"
                  value={mrpPrice}
                  onChange={(e) => setMrpPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Original MRP for strikethrough discount (वास्तविक मूल्य)
              </p>
            </div>
          </div>

          {/* Live Discount Calculator Preview */}
          {discountInfo && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Customer saves ₹{discountInfo.diff} ({discountInfo.percent}% OFF)
              </span>
              <span className="text-stone-600">
                Display: <span className="line-through text-stone-400">₹{mrpPrice}</span>{' '}
                <span className="font-bold text-stone-900">₹{sellingPrice}</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-stone-100">
            {/* Pack Size / Variant Name */}
            <div>
              <label
                htmlFor="product-variant-name"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Pack Size / Variant Name
              </label>
              <input
                id="product-variant-name"
                name="variant_name"
                type="text"
                defaultValue="Standard Pack"
                placeholder="e.g. 100g, 250g, Standard Pack"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
              />
              <p className="text-xs text-stone-400 mt-1.5">
                Default pack size label (e.g. 100g, 250g, Standard Pack)
              </p>
            </div>

            {/* Stock Quantity */}
            <div>
              <label
                htmlFor="product-stock"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Initial Stock Quantity
              </label>
              <input
                id="product-stock"
                name="stock_quantity"
                type="number"
                min="0"
                defaultValue={100}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
              />
              <p className="text-xs text-stone-400 mt-1.5">
                Available stock for this pack size
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 rounded-xl border border-stone-200/80 p-4 text-xs text-stone-500 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-stone-400 shrink-0" />
          <span>
            Pricing, MRP, and pack sizes for this product are managed in the <strong>Product Variants</strong> section below.
          </span>
        </div>
      )}

      {/* SEO */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 sm:p-6 space-y-5">
        <h2 className="text-base font-semibold text-stone-900">SEO</h2>

        <div>
          <label
            htmlFor="seo-title"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            SEO Title
          </label>
          <input
            id="seo-title"
            name="seo_title"
            type="text"
            maxLength={60}
            defaultValue={product?.seo_title || ''}
            placeholder="Custom title for search engines"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="seo-description"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            SEO Description
          </label>
          <textarea
            id="seo-description"
            name="seo_description"
            rows={2}
            maxLength={160}
            defaultValue={product?.seo_description || ''}
            placeholder="Meta description for search results"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {pending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
