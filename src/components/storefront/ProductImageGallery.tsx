'use client'

import Image from 'next/image'
import { Leaf, Award, Crown, Sparkles } from 'lucide-react'

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
  const displayImage =
    featuredImage ||
    (images && images.length > 0 ? images[0].image_url : null)

  return (
    <div className="w-full">
      {/* ── Main Showcase Image (No thumbnails, exact reference styling) ── */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[5px] overflow-hidden bg-gradient-to-b from-[#FDF9F3] to-[#F4ECE2] border border-[#EDE4D9] shadow-sm group">
        
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
            src={displayImage}
            alt={productName}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6F0]">
            <span className="text-stone-400 font-medium text-sm">No Image Available</span>
          </div>
        )}

        {/* Subtle Vignette on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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
    </div>
  )
}
