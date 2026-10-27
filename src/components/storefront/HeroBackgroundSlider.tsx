'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react'

export type HeroSlideItem = {
  id: string
  image_url: string
  tag?: string
  title?: string
  subtitle?: string
  button_text?: string
  button_link?: string
  text_mode?: 'global' | 'per_slide'
  is_active?: boolean
}

export type GlobalHeroText = {
  title: string
  subtitle: string
  button_text: string
  button_link: string
}

function normalizeBrandText(text: string): string {
  return text
    .replace(/jaandaar\s*masal[ae]?/gi, 'HS AgroFoods')
    .replace(/jaandaar/gi, 'HS AgroFoods')
}

export function HeroBackgroundSlider({
  slides,
  textMode = 'per_slide',
  globalText,
}: {
  slides: HeroSlideItem[]
  textMode?: 'global' | 'per_slide'
  globalText?: GlobalHeroText
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slideCount = slides.length

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return
    setCurrentIndex((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  // Auto-advance slides every 5 seconds (paused on hover)
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [slideCount, isPaused, nextSlide])

  if (slideCount === 0) return null

  const currentSlide = slides[currentIndex] || slides[0]

  const rawTitle =
    textMode === 'per_slide'
      ? currentSlide.title || globalText?.title || 'Pure Spice. Real Taste. Trusted Every Time.'
      : globalText?.title || currentSlide.title || 'Pure Spice. Real Taste. Trusted Every Time.'

  const rawSubtitle =
    textMode === 'per_slide'
      ? currentSlide.subtitle ||
        globalText?.subtitle ||
        "HS AgroFoods brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor."
      : globalText?.subtitle ||
        currentSlide.subtitle ||
        "HS AgroFoods brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor."

  const title = normalizeBrandText(rawTitle)
  const subtitle = normalizeBrandText(rawSubtitle)

  const buttonText =
    textMode === 'per_slide'
      ? currentSlide.button_text || globalText?.button_text || 'Shop Now'
      : globalText?.button_text || currentSlide.button_text || 'Shop Now'

  const buttonLink =
    textMode === 'per_slide'
      ? currentSlide.button_link || globalText?.button_link || '/shop'
      : globalText?.button_link || currentSlide.button_link || '/shop'

  return (
    <section
      className="relative overflow-hidden min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex items-center select-none bg-[#2D1409]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 🖼️ BACKGROUND IMAGES SLIDER (No white gradient overlay) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image_url}
                alt={slide.title || 'HS AgroFoods'}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-right md:object-center"
              />
            </div>
          )
        })}
        {/* Subtle dark backdrop on left to make pure white text pop with high contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent z-10 pointer-events-none" />
      </div>

      {/* 📝 OVERLAID TEXT CONTENT (Pure White for Maximum Legibility) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full py-16 sm:py-20 lg:py-28 pb-28 sm:pb-36 lg:pb-44">
        <div className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-8 text-left">
          
          {/* Animated Headline in Crisp White */}
          <div
            key={`title-${currentIndex}`}
            className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
          >
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
          </div>

          {/* Animated Subtitle in White */}
          <div
            key={`sub-${currentIndex}`}
            className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-3"
          >
            <p className="text-sm sm:text-base lg:text-lg text-white/95 max-w-lg leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {subtitle}
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div
            key={`cta-${currentIndex}`}
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E07B0C] hover:bg-[#2D1409] px-7 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg border border-[#F09819]/40 hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center cursor-pointer"
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4 text-[#F09819]" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full bg-white hover:bg-[#F3F8F4] text-[#14361F] px-7 sm:px-8 py-3.5 text-sm sm:text-base font-bold transition-all text-center cursor-pointer shadow-md hover:shadow-lg"
            >
              Our Story
            </Link>
          </div>

          {/* 3 Trust Badges in Crisp White */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-4 border-t border-white/30">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-white/20 text-[#86EFAC] backdrop-blur-xs border border-white/20 shadow-xs">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">100% Natural</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-white/20 text-[#F09819] backdrop-blur-xs border border-white/20 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">No Preservatives</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-white/20 text-[#F09819] backdrop-blur-xs border border-white/20 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Premium Quality</span>
            </div>
          </div>

        </div>
      </div>

      {/* 🔘 SLIDE CONTROLS (Moved higher up with comfortable bottom margin) */}
      {slideCount > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 right-4 sm:right-8 lg:right-12 z-30 flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#DCE8DF] shadow-md">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex ? 'w-6 bg-[#431D0D]' : 'w-2 bg-[#14361F]/30 hover:bg-[#14361F]/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-1 ml-2 border-l border-[#DCE8DF] pl-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="p-1 rounded-full text-[#14361F] hover:text-[#E07B0C] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Slide"
              className="p-1 rounded-full text-[#14361F] hover:text-[#E07B0C] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
