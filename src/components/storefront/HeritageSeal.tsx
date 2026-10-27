'use client'

import Image from 'next/image'
import { SPICE_ASSETS } from '@/constants/assets'

interface HeritageSealProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTagline?: boolean
}

export function HeritageSeal({
  size = 'md',
  className = '',
  showTagline = false,
}: HeritageSealProps) {
  // Dimension maps
  const dimensions = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80',
  }

  // Inner logo size maps
  const logoDimensions = {
    sm: 'w-12 h-12 sm:w-14 sm:h-14',
    md: 'w-18 h-18 sm:w-22 sm:h-22',
    lg: 'w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40',
  }

  const textPathId = `heritage-text-path-${size}`

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      title="HS AgroFoods — 100% Pure & Authentic Heritage Seal"
    >
      {/* Outer ambient golden aura glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#F09819]/20 via-[#E07B0C]/10 to-[#F09819]/25 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-80 group-hover:opacity-100" />

      {/* Main Container */}
      <div
        className={`relative ${dimensions[size]} rounded-full flex items-center justify-center p-1.5 transition-transform duration-500 ease-out group-hover:scale-105`}
      >
        {/* Scalloped / Vintage Outer Rim Border */}
        <div className="absolute inset-0 rounded-full border border-[#F09819]/40 shadow-xl bg-gradient-to-b from-[#FFFDFB] to-[#F7EFE8]" />

        {/* Secondary inner delicate ring */}
        <div className="absolute inset-[5px] sm:inset-[7px] rounded-full border border-dashed border-[#E07B0C]/30" />

        {/* Rotating SVG Circular Typography */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full animate-spin-slow group-hover:[animation-duration:12s] transition-all"
        >
          <defs>
            <path
              id={textPathId}
              d="M 100, 100 m -73, 0 a 73,73 0 1,1 146,0 a 73,73 0 1,1 -146,0"
            />
          </defs>

          {/* Curved Circular Text */}
          <text
            className="text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-[0.24em] fill-[#431D0D]"
            style={{ letterSpacing: '0.24em' }}
          >
            <textPath href={`#${textPathId}`} startOffset="0%">
              ★ HS AgroFoods ★ 100% PURE & NATURAL ★ TRADITIONAL TASTE ★
            </textPath>
          </text>
        </svg>

        {/* Centerpiece: Circular Brand Logo with Double Gold Borders */}
        <div
          className={`relative ${logoDimensions[size]} rounded-full overflow-hidden shadow-md ring-2 ring-[#F09819] ring-offset-2 ring-offset-[#F7EFE8] bg-white transform transition-transform duration-500 group-hover:rotate-6`}
        >
          <Image
            src={SPICE_ASSETS.logo}
            alt="HS AgroFoods Authentic Seal"
            fill
            sizes="(max-width: 768px) 120px, 200px"
            className="object-cover"
            priority={size === 'lg'}
          />

          {/* Subtle glossy glass shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60 pointer-events-none" />
        </div>
      </div>

      {/* Optional micro tagline pill below seal */}
      {showTagline && (
        <div className="absolute -bottom-2 bg-[#E07B0C] text-[#FFF4E8] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md border border-[#F09819]/40 whitespace-nowrap">
          Heritage Seal
        </div>
      )}
    </div>
  )
}
