'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { ProductCard, type ProductCardProps } from '@/components/storefront/ProductCard'

export function RelatedProductsCarousel({ products }: { products: ProductCardProps[] }) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 8)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8)
  }

  useEffect(() => {
    checkScroll()
    const container = carouselRef.current
    if (!container) return

    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const firstItem = container.firstElementChild as HTMLElement
    const cardWidth = firstItem ? firstItem.offsetWidth + 12 : 240
    // Scroll 1 card on mobile, 2 cards on tablet/desktop
    const scrollStep = typeof window !== 'undefined' && window.innerWidth < 640 ? cardWidth : cardWidth * 2

    container.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    })
  }

  if (!products || products.length === 0) return null

  return (
    <div className="mt-10 sm:mt-12 border-t border-[#EDE4D9] pt-6 sm:pt-8 pb-6">
      {/* ── Carousel Header with Title, View All & Navigation Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E07B0C] mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Recommended for You</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F] leading-tight">
            You May Also Like
          </h3>
        </div>

        {/* Right side: View All + Carousel Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-[#E07B0C] hover:text-[#C86A08] hover:underline transition-colors"
          >
            View All Spices →
          </Link>

          {/* Carousel Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] bg-white border border-[#EDE4D9] hover:bg-[#FAF3EB] text-[#14361F] hover:text-[#E07B0C] hover:border-[#E07B0C]/40 flex items-center justify-center transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-current" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next products"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] bg-white border border-[#EDE4D9] hover:bg-[#FAF3EB] text-[#14361F] hover:text-[#E07B0C] hover:border-[#E07B0C]/40 flex items-center justify-center transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-current" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Carousel Track: Exactly 5 items in 1 row on xl screens, with compact height ── */}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-0.5"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 snap-start w-[calc(50%-5px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9.5px)] xl:w-[calc(20%-10px)]"
          >
            <ProductCard {...product} compact={true} />
          </div>
        ))}
      </div>
    </div>
  )
}

