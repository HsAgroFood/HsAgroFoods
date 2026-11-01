'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type TouchEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Leaf } from 'lucide-react'

export type CategoryCardData = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  productCount: number | null
}

const AUTOPLAY_MS = 2000
const SLIDE_MS = 700

// next/image only optimises hosts listed in next.config.ts; anything else is served as-is.
const OPTIMISED_HOSTS = /ik\.imagekit\.io|res\.cloudinary\.com|images\.unsplash\.com/

function CategoryCard({ category, duplicate = false }: { category: CategoryCardData; duplicate?: boolean }) {
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.slug)}`}
      aria-label={`Shop ${category.name}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      // Same card width as the product cards below: 2 per screen on phones, ~4 on desktop.
      className="group mr-2.5 flex w-[calc(50%_-_0.3125rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#EDE4D9] bg-gradient-to-b from-white to-[#FFFBF4] p-1.5 shadow-[0_4px_16px_rgba(20,54,31,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#E07B0C]/50 hover:shadow-[0_20px_44px_rgba(20,54,31,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F09819] sm:mr-4 sm:w-[calc(50%_-_0.5rem)] lg:mr-6 lg:w-[calc(25%_-_1.125rem)]"
    >
      {/* Framed 1:1 photo, nothing drawn over it except the small count chip */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#1A6234] to-[#0F3F22]">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={duplicate ? '' : category.name}
            fill
            unoptimized={!category.imageUrl.startsWith('/') && !OPTIMISED_HOSTS.test(category.imageUrl)}
            quality={90}
            sizes="(max-width: 1024px) 50vw, 300px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <Leaf className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/15" strokeWidth={1.2} />
        )}

        {category.productCount !== null && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#144D29] shadow-md ring-1 ring-black/5 backdrop-blur-md sm:left-2.5 sm:top-2.5 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E07B0C]" />
            {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
          </span>
        )}
      </div>

      {/* Name + call to action below the photo */}
      <div className="flex flex-1 items-center gap-2 px-2 pb-2 pt-3 sm:px-2.5 sm:pb-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[15px] font-extrabold leading-snug text-[#14361F] sm:text-[17px]">
            {category.name}
          </h3>
          <span className="my-1.5 block h-[3px] w-6 rounded-full bg-[#E07B0C] transition-all duration-300 group-hover:w-12" />
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#E07B0C] sm:text-xs">
            Shop now
          </span>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#144D29] text-white shadow-md shadow-[#144D29]/25 transition-all duration-300 group-hover:rotate-45 group-hover:bg-[#E07B0C] group-hover:shadow-[#E07B0C]/30 sm:h-10 sm:w-10">
          <ArrowUpRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </span>
      </div>
    </Link>
  )
}

/**
 * One line of category cards that slides a single card at a time, forever.
 * The list is repeated so a "set" is wider than the screen; when the track has moved one full set,
 * it silently jumps back to the start, so the loop never shows a gap.
 */
export function CategoryCarousel({ categories }: { categories: CategoryCardData[] }) {
  // Repeat until one set comfortably fills a wide screen.
  const set = Array.from({ length: Math.max(1, Math.ceil(8 / categories.length)) }, () => categories).flat()
  const setLength = set.length

  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)

  // Distance between two neighbouring cards (card width + gap) changes with the screen size.
  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track || track.children.length < 2) return
    setStep((track.children[1] as HTMLElement).offsetLeft - (track.children[0] as HTMLElement).offsetLeft)
  }, [])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const next = useCallback(() => setIndex((i) => i + 1), [])
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])

  // Autoplay: one card every few seconds, unless hovered/touched or the visitor prefers reduced motion.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, next])

  // After sliding one full set, jump back to the identical start position without animating.
  const handleTransitionEnd = () => {
    if (index < setLength) return
    setAnimate(false)
    setIndex(index - setLength)
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
  }

  const onTouchStart = (e: TouchEvent) => {
    setPaused(true)
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start !== null) {
      const dx = e.changedTouches[0].clientX - start
      if (dx < -40) next()
      else if (dx > 40) prev()
    }
    setPaused(false)
  }

  return (
    <div
      className="-my-5 overflow-hidden py-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={trackRef}
        onTransitionEnd={(e) => e.target === e.currentTarget && handleTransitionEnd()}
        className="flex w-full"
        style={{
          transform: `translateX(-${index * step}px)`,
          transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.22, 0.8, 0.3, 1)` : 'none',
        }}
      >
        {set.map((category, i) => (
          <CategoryCard key={`a-${category.id}-${i}`} category={category} />
        ))}
        {set.map((category, i) => (
          <CategoryCard key={`b-${category.id}-${i}`} category={category} duplicate />
        ))}
      </div>
    </div>
  )
}
