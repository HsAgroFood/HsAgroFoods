'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ImageKitUpload } from '@/components/admin/ImageKitUpload'
import { Plus, Trash2, Star, Loader2, Sparkles } from 'lucide-react'
import { addProductImage, deleteProductImage, setFeaturedImage } from '@/actions/products'
import Image from 'next/image'

type ProductImage = {
  id: string
  product_id: string
  image_url: string
  sort_order: number
}

type Product = {
  id: string
  featured_image_url: string | null
}

export function ProductImagesEditor({
  product,
  images,
}: {
  product: Product
  images: ProductImage[]
}) {
  const [isPending, startTransition] = useTransition()
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const router = useRouter()

  const handleUploadSuccess = (result: { url: string }) => {
    if (result && result.url) {
      setUploadMsg('Image uploaded to ImageKit! Saving...')
      startTransition(async () => {
        const res = await addProductImage(product.id, result.url)
        if (res.error) {
          alert(res.error)
        } else {
          router.refresh()
        }
        setUploadMsg(null)
      })
    }
  }

  const handleDelete = (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      startTransition(async () => {
        const res = await deleteProductImage(imageId, product.id)
        if (res.error) {
          alert(res.error)
        } else {
          router.refresh()
        }
      })
    }
  }

  const handleSetFeatured = (imageUrl: string) => {
    startTransition(async () => {
      const res = await setFeaturedImage(product.id, imageUrl)
      if (res.error) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span>Product Gallery &amp; Card Cover</span>
            <span className="text-xs font-normal text-stone-500">
              ({images.length} uploaded)
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            The image with the <strong>Primary Card Image</strong> badge is displayed on product cards and catalog.
          </p>
        </div>

        <ImageKitUpload
          folder="/products"
          multiple={true}
          maxFiles={10}
          onSuccess={handleUploadSuccess}
        >
          {({ open, isUploading }) => (
            <button
              type="button"
              onClick={open}
              disabled={isUploading || isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isUploading || isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isUploading ? 'Uploading to ImageKit...' : 'Upload More Images'}</span>
            </button>
          )}
        </ImageKitUpload>
      </div>

      {uploadMsg && (
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-800 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
          <span>{uploadMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => {
          const isFeatured = product.featured_image_url === img.image_url
          return (
            <div
              key={img.id}
              className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                isFeatured
                  ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                  : 'border-stone-200 bg-stone-50 hover:border-stone-300 shadow-xs'
              }`}
            >
              <Image
                src={img.image_url}
                alt={`Product angle ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Status Pill Badge */}
              <div className="absolute top-2 left-2 z-10">
                {isFeatured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-orange-600 rounded-full shadow-sm">
                    <Sparkles className="w-3 h-3 fill-current" />
                    Primary Card Image
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-stone-700 bg-white/90 backdrop-blur-xs rounded-full shadow-xs">
                    #{index + 1}
                  </span>
                )}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-20">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={isPending}
                    title="Delete Image"
                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-center">
                  {!isFeatured ? (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(img.image_url)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-white rounded-full shadow-md hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-orange-500" />
                      Set as Card Image
                    </button>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold text-orange-400 bg-stone-900/80 rounded-full flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Card Cover
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {images.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700">No images uploaded yet</p>
            <p className="text-xs text-stone-400 mt-0.5">Click &quot;Upload More Images&quot; to upload to ImageKit</p>
          </div>
        )}
      </div>
    </div>
  )
}

