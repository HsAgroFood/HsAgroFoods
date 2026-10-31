'use client'

import Image from 'next/image'

interface PageLoadingSpinnerProps {
  message?: string
  className?: string
}

export function PageLoadingSpinner({
  message = '100% Pure & Natural Spices',
  className = '',
}: PageLoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* ── Center Logo & Outside Small Rotating Circle ── */}
      <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
        
        {/* Outside Rotating Circle (Small, Modern Gradient Arc) */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '1.2s' }}
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Faint Background Track Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#EDE4D9"
            strokeWidth="2.5"
          />
          {/* Active Gradient Spinning Arc */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#pageLoaderSpiceGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="75 200"
          />
          <defs>
            <linearGradient id="pageLoaderSpiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E07B0C" />
              <stop offset="100%" stopColor="#144D29" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Brand Logo Box (Rounded 5px) */}
        <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16  p-1.5 flex items-center justify-center  transition-transform duration-300">
          <Image
            src="/images/logo.png"
            alt="HS AgroFoods"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* ── Brand Typography Beneath Logo ── */}
      <div className="mt-4 sm:mt-5 space-y-1">
        <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#14361F] tracking-tight">
          HS <span className="text-[#E07B0C]">AgroFoods</span>
        </h3>
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#7A6458]">
          {message}
        </p>

        {/* 3 Animated Micro-Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07B0C] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#144D29] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07B0C] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

