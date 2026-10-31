'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      if (maxScroll > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((currentScroll / maxScroll) * 100)))
        setScrollProgress(progress)
      }

      if (currentScroll > 250) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Circle radius 20 => Circumference = 2 * PI * 20 = 125.66
  const circumference = 125.66
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <div
      className={`fixed z-30 transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      } bottom-[136px] lg:bottom-[88px] right-4 lg:right-6`}
    >
      <button
        onClick={scrollToTop}
        type="button"
        title="Scroll to top"
        aria-label="Scroll to top"
        className="relative group w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#14361F] hover:bg-[#E07B0C] text-white shadow-lg shadow-[#14361F]/30 hover:shadow-xl hover:shadow-[#E07B0C]/40 flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
      >
        {/* Modern Circular SVG Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
          viewBox="0 0 48 48"
        >
          {/* Background Track Circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2.8"
          />
          {/* Animated Active Progress Circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#E07B0C"
            strokeWidth="2.8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out group-hover:stroke-white"
          />
        </svg>

        {/* Centered Arrow Icon */}
        <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-1 transition-transform duration-200 z-10" />
      </button>
    </div>
  )
}
