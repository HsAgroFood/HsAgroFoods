'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type ShowcaseSlide = { src: string; alt: string; caption: string }

const AUTOPLAY_MS = 5000

/** Crossfading image slider with arrows, dots, swipe and autoplay (pauses on hover and for reduced motion). */
export function ShowcaseSlider({ slides, className = '' }: { slides: ShowcaseSlide[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const count = slides.length

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count])

  useEffect(() => {
    if (count <= 1 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [count, paused, go, index])

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const distance = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(distance) > 45) go(distance > 0 ? 1 : -1)
    touchStartX.current = null
  }

  if (count === 0) return null

  const arrow =
    'absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-[#14361F] shadow-lg transition-all hover:scale-105 hover:bg-[#E07B0C] hover:text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F09819]'

  return (
    <div
      className={`group relative overflow-hidden bg-[#0C2315] ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="HS AgroFoods highlights"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-transform duration-[6000ms] ease-out ${
              i === index ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      ))}

      {/* Soft fade at the bottom so the caption and dots stay readable */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/55 to-transparent" />

      <span
        key={index}
        className="absolute bottom-11 left-4 z-20 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500 sm:left-6 sm:text-sm"
      >
        {slides[index].caption}
      </span>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${arrow} left-3 sm:left-5`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${arrow} right-3 sm:right-5`}>
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 cursor-pointer rounded-full border border-white transition-all duration-300 ${
                  i === index ? 'w-7 bg-white' : 'w-2.5 bg-transparent hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
