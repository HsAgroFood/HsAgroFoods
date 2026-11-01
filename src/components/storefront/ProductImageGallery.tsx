'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Leaf, Crown, ChevronLeft, ChevronRight } from 'lucide-react'

type ProductImageGalleryProps = {
  images: { id: string; image_url: string; sort_order: number }[]
  featuredImage: string | null
  productName?: string
}

export function ProductImageGallery({
  images,
  featuredImage,
  productName = 'Product Showcase',
}: ProductImageGalleryProps) {
  // Every image saved for the product: the featured one first, then the rest in admin order, no duplicates
  const gallery = useMemo(() => {
    const urls: string[] = []
    const add = (url?: string | null) => {
      const clean = url?.trim()
      if (clean && !urls.includes(clean)) urls.push(clean)
    }
    add(featuredImage)
    ;[...(images || [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .forEach((img) => add(img.image_url))
    return urls
  }, [images, featuredImage])

  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const count = gallery.length
  const current = Math.min(active, Math.max(count - 1, 0))
  const displayImage = gallery[current] ?? null

  const go = (index: number) => {
    if (count < 2) return
    setActive((index + count) % count)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > 40) go(current + (delta < 0 ? 1 : -1))
  }

  return (
    <div className="w-full space-y-3">
      {/* ── Main Showcase Image ── */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[5px] overflow-hidden bg-gradient-to-b from-[#FDF9F3] to-[#F4ECE2] border border-[#EDE4D9] shadow-sm group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top-Left: 100% PURE Pill Badge */}
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-white/95 backdrop-blur-md text-xs font-bold text-[#144D29] border border-[#CFE3D3] shadow-xs uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-[#144D29] fill-[#144D29]/20" />
            <span>100% Pure</span>
          </div>
        </div>

        {/* Center: Main Product Image */}
        {displayImage ? (
          <Image
            key={displayImage}
            src={displayImage}
            alt={`${productName} - image ${current + 1} of ${count}`}
            fill
            priority={current === 0}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out animate-in fade-in duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6F0]">
            <span className="text-stone-400 font-medium text-sm">No Image Available</span>
          </div>
        )}

        {/* Subtle Vignette on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Prev / Next + counter (only when there is more than one image) */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(current - 1)}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#14361F] shadow-md border border-[#EDE4D9] flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(current + 1)}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#14361F] shadow-md border border-[#EDE4D9] flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 rounded-[5px] bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm select-none">
              {current + 1} / {count}
            </span>
          </>
        )}

        {/* Bottom-Right: Circular Vintage "PREMIUM QUALITY" Heritage Stamp */}
        <div className="absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 z-10 pointer-events-none select-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF4EB]/95 border-2 border-[#D97706]/40 shadow-lg p-1.5 flex flex-col items-center justify-center text-center backdrop-blur-xs transform transition-transform group-hover:rotate-6">
            <div className="w-full h-full rounded-full border border-dashed border-[#E07B0C]/40 flex flex-col items-center justify-center p-1">
              <Crown className="w-4 h-4 text-[#E07B0C]" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#14361F] leading-tight mt-0.5">
                Premium
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-widest text-[#E07B0C] leading-none">
                Quality
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnails: every image of the product ── */}
      {count > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Product images">
          {gallery.map((url, index) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActive(index)}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[5px] overflow-hidden bg-[#FAF6F0] border-2 transition-all cursor-pointer ${
                index === current
                  ? 'border-[#E07B0C] shadow-md'
                  : 'border-[#EDE4D9] opacity-75 hover:opacity-100 hover:border-[#E07B0C]/50'
              }`}
            >
              <Image src={url} alt={`${productName} thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
