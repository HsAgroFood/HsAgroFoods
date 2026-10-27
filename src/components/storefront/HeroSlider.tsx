'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMobileSlideUrl } from './HeroBackgroundSlider'

export function HeroSlider({ 
  slides, 
  globalText, 
  textMode 
}: { 
  slides: any[], 
  globalText: any, 
  textMode: 'global' | 'per_slide' 
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

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return

    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [slideCount, isPaused, nextSlide])

  if (slideCount === 0) return null

  return (
    <div 
      className="relative h-[500px] sm:h-[600px] lg:h-[700px] bg-stone-900 flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Background Images & Per-Slide Text */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex
        
        return (
          <div 
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-50' : 'opacity-0'}`}>
              <div className="relative w-full h-full block md:hidden">
                <Image
                  src={getMobileSlideUrl(slide.image_url, slide.image_mobile_url)}
                  alt={`Hero Mobile Background ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
              <div className="relative w-full h-full hidden md:block">
                <Image
                  src={slide.image_url}
                  alt={`Hero Background ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            </div>

            {/* Per-Slide Text (only shown in per_slide mode) */}
            {textMode === 'per_slide' && (
              <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {slide.title && (
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                    {slide.title}
                  </h1>
                )}
                
                {slide.subtitle && (
                  <p className="text-lg sm:text-xl lg:text-2xl text-stone-100 mb-10 max-w-2xl mx-auto drop-shadow-md">
                    {slide.subtitle}
                  </p>
                )}
                
                {slide.button_text && slide.button_link && (
                  <Link 
                    href={slide.button_link}
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-md hover:bg-primary-light hover:scale-105 transition-all text-lg shadow-lg hover:shadow-primary/30"
                  >
                    {slide.button_text}
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Static Global Overlay Text (only shown in global mode) */}
      {textMode === 'global' && (
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          {globalText?.title && (
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
              {globalText.title}
            </h1>
          )}
          
          {globalText?.subtitle && (
            <p className="text-lg sm:text-xl lg:text-2xl text-stone-100 mb-10 max-w-2xl mx-auto drop-shadow-md">
              {globalText.subtitle}
            </p>
          )}
          
          {globalText?.button_text && globalText?.button_link && (
            <Link 
              href={globalText.button_link}
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-md hover:bg-primary-light hover:scale-105 transition-all text-lg shadow-lg hover:shadow-primary/30"
            >
              {globalText.button_text}
            </Link>
          )}
        </div>
      )}

      {/* Next & Previous Arrows */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide indicators (dots) at the bottom */}
      {slideCount > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2.5 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
