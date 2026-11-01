'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  Award,
  Play,
  Pause,
} from 'lucide-react'
import { getDesktopSlideUrl, getMobileSlideUrl } from '@/lib/imageUtils'
import { DEFAULT_BANNER_VISIBILITY, getHeroOverlays } from '@/lib/heroBanner'

export type HeroSlideItem = {
  id: string
  image_url: string
  image_mobile_url?: string
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
  showText = true,
  bannerVisibility = DEFAULT_BANNER_VISIBILITY,
}: {
  slides: HeroSlideItem[]
  textMode?: 'global' | 'per_slide'
  globalText?: GlobalHeroText
  /** Admin switch: false = image-only hero (no text, buttons, badges or dark text scrims). */
  showText?: boolean
  /** Admin slider 0-100: higher = lighter dark overlay, so the banner image is more visible behind the text. */
  bannerVisibility?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // The slide that is sliding out, and which way the slides are moving (next = new one enters from the right)
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const indexRef = useRef(0)
  const progressRef = useRef(0)

  // Touch gesture support for mobile devices
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)

  const slideCount = slides.length
  const SLIDE_DURATION = 5500 // 5.5 seconds per slide

  const goTo = useCallback((target: number, dir: 'next' | 'prev') => {
    if (target === indexRef.current) return
    setLeavingIndex(indexRef.current)
    setDirection(dir)
    indexRef.current = target
    setCurrentIndex(target)
    progressRef.current = 0
    setProgress(0)
  }, [])

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return
    goTo((indexRef.current + 1) % slideCount, 'next')
  }, [slideCount, goTo])

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return
    goTo((indexRef.current - 1 + slideCount) % slideCount, 'prev')
  }, [slideCount, goTo])

  const goToSlide = useCallback(
    (index: number) => goTo(index, index > indexRef.current ? 'next' : 'prev'),
    [goTo]
  )

  // Auto-advance with smooth progress bar
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return

    const stepMs = 50
    const increment = (stepMs / SLIDE_DURATION) * 100

    const timer = setInterval(() => {
      progressRef.current += increment
      if (progressRef.current >= 100) {
        nextSlide()
      } else {
        setProgress(progressRef.current)
      }
    }, stepMs)

    return () => clearInterval(timer)
  }, [slideCount, isPaused, nextSlide, SLIDE_DURATION])

  // Touch / Swipe handler
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndXRef.current = null
    touchStartXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return
    const distance = touchStartXRef.current - touchEndXRef.current
    const minSwipeDistance = 45
    if (distance > minSwipeDistance) {
      nextSlide()
    } else if (distance < -minSwipeDistance) {
      prevSlide()
    }
  }

  if (slideCount === 0) return null

  const currentSlide = slides[currentIndex] || slides[0]

  const rawTitle =
    textMode === 'per_slide'
      ? currentSlide.title || globalText?.title || 'Pure Spices & Natural Dehydrated Powders.'
      : globalText?.title || currentSlide.title || 'Pure Spices & Natural Dehydrated Powders.'

  const rawSubtitle =
    textMode === 'per_slide'
      ? currentSlide.subtitle ||
        globalText?.subtitle ||
        "HS AgroFoods brings India's finest cold-ground spices and nutrient-rich dehydrated vegetable & fruit powders straight to your kitchen."
      : globalText?.subtitle ||
        currentSlide.subtitle ||
        "HS AgroFoods brings India's finest cold-ground spices and nutrient-rich dehydrated vegetable & fruit powders straight to your kitchen."

  const title = normalizeBrandText(rawTitle)
  const subtitle = normalizeBrandText(rawSubtitle)

  const buttonText =
    textMode === 'per_slide'
      ? currentSlide.button_text || globalText?.button_text || 'Explore Collection'
      : globalText?.button_text || currentSlide.button_text || 'Explore Collection'

  const buttonLink =
    textMode === 'per_slide'
      ? currentSlide.button_link || globalText?.button_link || '/shop'
      : globalText?.button_link || currentSlide.button_link || '/shop'

  // Image-only mode: the slide's own link (set in admin) makes the whole image clickable
  const imageLink = currentSlide.button_link?.trim() || ''

  const overlays = getHeroOverlays(bannerVisibility)

  const slideTag =
    currentSlide.tag || '✦ Single-Origin Indian Spices & Superfoods'

  return (
    <section
      aria-label="HS AgroFoods Corporate Hero Carousel"
      className="relative overflow-hidden aspect-[4/5] md:aspect-[16/7] md:min-h-[440px] lg:min-h-[480px] lg:max-h-[900px] flex flex-col justify-between select-none bg-[#160A04]"
      onMouseEnter={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🖼️ BACKGROUND IMAGES SLIDER (each banner slides in from the right, no zoom) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex
          const isLeaving = !isActive && index === leavingIndex
          const motion = isActive
            ? leavingIndex === null
              ? ''
              : `hero-slide-in-${direction}`
            : isLeaving
              ? `hero-slide-out-${direction}`
              : ''
          const mobileUrl = getMobileSlideUrl(slide.image_url, slide.image_mobile_url)

          return (
            <div
              key={slide.id || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full ${motion} ${
                isActive ? 'z-10' : isLeaving ? 'z-[9] pointer-events-none' : 'invisible z-0 pointer-events-none'
              }`}
            >
              {/* 📱 Mobile Portrait 4:5 Slide Image */}
              <div className="relative w-full h-full block md:hidden">
                <Image
                  src={mobileUrl}
                  alt={slide.title || 'HS AgroFoods'}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* 💻 Desktop Landscape 16:7 Slide Image */}
              <div className="relative w-full h-full hidden md:block">
                <Image
                  src={getDesktopSlideUrl(slide.image_url)}
                  alt={slide.title || 'HS AgroFoods'}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`object-cover ${showText ? 'object-center lg:object-right' : 'object-center'}`}
                />
              </div>
            </div>
          )
        })}

        {/* Dark overlays exist only to keep the text readable. In image-only mode the banner is shown untouched. */}
        {showText && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Mobile bottom-to-top gradient scrim for crisp text readability */}
            <div className="absolute inset-0 md:hidden" style={{ backgroundImage: overlays.mobile }} />

            {/* Desktop cinematic left-to-right gradient for corporate banner typography */}
            <div className="hidden md:block absolute inset-0" style={{ backgroundImage: overlays.desktop }} />

            {/* Compact bottom vignette to blend softly into the next section */}
            <div className="absolute inset-x-0 bottom-0 h-16 lg:h-10 bg-gradient-to-t from-[#140A05] via-[#140A05]/80 to-transparent" />

            {/* Subtle top edge shadow for smooth navbar integration */}
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent" />
          </div>
        )}
      </div>

      {showText ? (
        // Corporate content grid: headline, badges, CTAs and trust badges
        <div className="relative z-20 mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-8 w-full pt-10 sm:pt-14 lg:pt-12 pb-5 sm:pb-6 lg:pb-4 lg:flex-1 lg:flex lg:items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
          
            {/* 🏷️ LEFT CONTENT: CORPORATE HEADLINE, BADGES & CTAs */}
            <div className="lg:col-span-9 xl:col-span-8 space-y-4 sm:space-y-6 lg:space-y-5 text-left">
            
              {/* Live Status Corporate Pill Badge */}
              <div
                key={`tag-${currentIndex}`}
                className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-md animate-in fade-in slide-in-from-top-2 duration-500"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="truncate max-w-[280px] sm:max-w-md drop-shadow-xs">
                  {slideTag}
                </span>
              </div>

              {/* Authoritative Corporate Headline */}
              <div
                key={`title-${currentIndex}`}
                className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
              >
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-[48px] xl:text-[56px] font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                  {title}
                </h1>
              </div>

              {/* Subtitle with High Readability */}
              <div
                key={`sub-${currentIndex}`}
                className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-3"
              >
                <p className="text-sm sm:text-base lg:text-base text-stone-200/95 max-w-xl leading-relaxed font-normal sm:font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {subtitle}
                </p>
              </div>

              {/* Dual CTA Action Cluster */}
              <div
                key={`cta-${currentIndex}`}
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              >
                <Link
                  href={buttonLink}
                  className="inline-flex items-center justify-center gap-2.5 rounded-[5px] bg-gradient-to-r from-[#F09819] via-[#E07B0C] to-[#C96B06] hover:from-[#E07B0C] hover:to-[#B45309] text-white px-4 py-4 text-sm sm:text-base font-bold shadow-xl shadow-amber-950/40 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-white" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 hover:border-white/40 px-4 py-4 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Corporate &amp; Bulk Orders</span>
                </Link>
              </div>

              {/* 4 Corporate Trust Micro-Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-5 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-white/15 text-emerald-300 backdrop-blur-xs border border-white/20 shadow-xs shrink-0">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    100% Farm-Direct
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-white/15 text-amber-300 backdrop-blur-xs border border-white/20 shadow-xs shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    Cryo-Ground &lt;40°C
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-white/15 text-blue-300 backdrop-blur-xs border border-white/20 shadow-xs shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    NABL Lab Tested
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-white/15 text-amber-300 backdrop-blur-xs border border-white/20 shadow-xs shrink-0">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    Export Grade Purity
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        // Image-only hero: keep the controls pinned to the bottom and the headline available to screen readers/SEO
        <div className="relative z-20 flex-1">
          <h1 className="sr-only">{title}</h1>
        </div>
      )}

      {!showText && imageLink && (
        <Link
          href={imageLink}
          aria-label={`Open: ${title}`}
          className="absolute inset-0 z-20 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-amber-400"
        />
      )}

      {/* 🔘 MODERN CORPORATE SLIDE CONTROL BAR */}
      {slideCount > 1 && (
        <div className="relative z-30 mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-8 pb-3 sm:pb-3.5 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between md:justify-end gap-2 pt-2 border-t border-white/10">
            
            {/* Slide Navigation + Counter + Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
              
              {/* Slide Counter (e.g. 01 / 07) */}
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold text-white/90 ${showText ? 'bg-white/10' : 'bg-black/45'} backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15`}>
                <span className="text-amber-400">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-white/40">/</span>
                <span>{String(slideCount).padStart(2, '0')}</span>
              </div>

              {/* Minimalist Slide Dots (Mobile Only) */}
              <div className="flex sm:hidden items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Action Arrows + Play/Pause Toggle */}
              <div className={`flex items-center gap-1 ${showText ? 'bg-white/10' : 'bg-black/45'} backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/15`}>
                {/* Pause / Play Toggle */}
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
                  className="p-1 rounded-full text-white/80 hover:text-amber-400 transition-colors cursor-pointer"
                  title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
                >
                  {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                </button>

                <div className="w-[1px] h-3 bg-white/20" />

                {/* Prev Arrow */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="p-1 rounded-full text-white/80 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Next Arrow */}
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="p-1 rounded-full text-white/80 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ⏱️ LINEAR PROGRESS BAR AT BOTTOM */}
      {slideCount > 1 && (
        <div className="absolute bottom-0 inset-x-0 z-30 h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  )
}
