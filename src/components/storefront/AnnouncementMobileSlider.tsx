'use client'

export function AnnouncementMobileSlider({ slides }: { slides: string[] }) {
  if (slides.length === 0) return null

  // Ensure enough items so there is no gap on wider mobile screens
  const repeatCount = Math.max(2, Math.ceil(4 / slides.length))
  const items = Array.from({ length: repeatCount }, () => slides).flat()

  return (
    <div className="sm:hidden relative w-full overflow-hidden flex select-none py-0.5">
      {/* Subtle fade edges for ultra-smooth edge transitions */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#FCE8CE] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#FCE8CE] to-transparent z-10" />

      {/* Primary Track */}
      <div className="flex animate-marquee shrink-0 items-center gap-6 whitespace-nowrap pl-4">
        {items.map((slide, idx) => (
          <span
            key={`slide-1-${idx}`}
            className="inline-flex items-center gap-6 text-[11.5px] font-semibold tracking-wide text-[#9A4406]"
          >
            <span>{slide}</span>
            <span className="text-[#D97706]/60 text-[9px]">✦</span>
          </span>
        ))}
      </div>

      {/* Duplicate Track for seamless infinite loop */}
      <div
        className="flex animate-marquee shrink-0 items-center gap-6 whitespace-nowrap pl-4"
        aria-hidden="true"
      >
        {items.map((slide, idx) => (
          <span
            key={`slide-2-${idx}`}
            className="inline-flex items-center gap-6 text-[11.5px] font-semibold tracking-wide text-[#9A4406]"
          >
            <span>{slide}</span>
            <span className="text-[#D97706]/60 text-[9px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
