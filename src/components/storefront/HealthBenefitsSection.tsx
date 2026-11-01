import Link from 'next/link'
import { CornerAccentImage } from '@/components/storefront/CornerAccents'
import Image from 'next/image'
import { ArrowRight, Leaf } from 'lucide-react'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'
import { resolveHomeIcon } from '@/lib/homeIcons'

// Realistic Botanical Leaf SVG for Ambient Decor
function RealisticLeaf({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hbLeafGradDark" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4A8F44" />
          <stop offset="50%" stopColor="#2D6A28" />
          <stop offset="100%" stopColor="#1B4D1A" />
        </linearGradient>
        <linearGradient id="hbLeafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DB85A" />
          <stop offset="100%" stopColor="#387A32" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 C30 30 15 65 18 105 C20 125 35 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#hbLeafGradDark)"
      />
      <path
        d="M50 10 C70 30 85 65 82 105 C80 125 65 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#hbLeafGradLight)"
        opacity="0.95"
      />
      <path
        d="M50 10 Q50 85 50 155"
        stroke="#8FE073"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d="M50 35 Q35 45 28 55" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 40 Q65 50 72 60" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 65 Q32 75 24 90" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 70 Q68 80 76 95" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 95 Q35 108 28 122" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 100 Q65 112 72 125" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 155 Q49 165 46 172" stroke="#2D6A28" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function HealthBenefitsSection({ content = HOME_DEFAULTS.gallery }: { content?: HomeContent['gallery'] }) {
  // Label and icon come from the admin; the icon colour alternates by position
  const benefits = content.benefits.map((benefit, index) => ({
    label: benefit.label,
    Icon: resolveHomeIcon(benefit.icon, Leaf),
    color: index % 2 === 0 ? 'text-[#144D29]' : 'text-[#A6632B]',
  }))

  // Photo gallery: every tile is a 1:1 square; title, tagline and button appear on hover.
  const tiles = content.tiles.map((tile, index) => ({ ...tile, id: `tile-${index}` }))

  return (
    <section id="uses" className="relative overflow-hidden bg-[#FAF4EA] py-12 text-[#14361F] sm:py-16 lg:py-20">
      {/* Soft golden + herbal ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(240, 152, 25, 0.10) 0%, transparent 45%),
            radial-gradient(circle at 90% 85%, rgba(20, 77, 41, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Decorative leaves */}
      <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 select-none mix-blend-multiply sm:h-56 sm:w-56 opacity-100">
        <CornerAccentImage
          kind="leaves"
          alt=""
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 144px, 224px"
        />
      </div>
      <div className="pointer-events-none absolute left-4 top-6 h-12 w-7 rotate-45 opacity-80 sm:left-12 sm:top-10">
        <RealisticLeaf className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute left-[22%] top-8 hidden h-10 w-6 -rotate-25 opacity-75 lg:block">
        <RealisticLeaf className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1330px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE4D4] bg-[#EAF3EC] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#144D29] sm:text-xs">
            <Leaf className="h-3.5 w-3.5 fill-[#144D29]/20 text-[#144D29]" />
            <span>{content.badge}</span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-extrabold leading-[1.15] tracking-tight text-[#14361F] sm:text-4xl lg:text-5xl">
            <span className="block">{content.titleLine1}</span>
            <span className="block">
              {content.titleLine2} <span className="text-[#E07B0C]">{content.titleHighlight}</span>
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm font-medium leading-relaxed text-[#5A453D] sm:text-base lg:text-[17px]">
            {content.subtitle}
          </p>

          {/* Benefit pills: 2x2 on phones, one row from tablet up */}
          <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-2.5 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {benefits.map((b) => (
              <div
                key={b.label}
                className="group flex cursor-default items-center gap-2 rounded-2xl border border-[#DDD1BF] bg-white/70 p-1.5 pr-3 shadow-2xs backdrop-blur-sm transition-colors hover:border-[#E07B0C] hover:bg-[#E07B0C] sm:rounded-full sm:pr-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAE1D3] transition-colors group-hover:bg-white/90">
                  <b.Icon className={`h-[18px] w-[18px] ${b.color}`} strokeWidth={2} />
                </span>
                <span className="text-left text-xs font-bold leading-tight text-[#14361F] transition-colors group-hover:text-white sm:whitespace-nowrap sm:text-[13px]">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo gallery (1:1 tiles) */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {tiles.map((tile) => {
            const hasText = Boolean(tile.title || tile.tag || tile.cta)
            const tileClass =
              'group relative block aspect-square overflow-hidden rounded-2xl bg-[#1D2B1F] shadow-lg shadow-[#14361F]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07B0C]'

            const inner = (
              <>
                <Image
                  src={tile.image}
                  alt={tile.title || 'HS AgroFoods gallery photo'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Hover / keyboard-focus overlay: darkened photo with title, tagline and an outlined button.
                    Photos without any text stay clean. */}
                {hasText && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 px-6 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {tile.title && (
                      <h3 className="translate-y-2 font-serif text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:text-3xl">
                        {tile.title}
                      </h3>
                    )}
                    {tile.tag && (
                      <p className="translate-y-2 text-sm font-semibold text-[#F09819] transition-transform delay-75 duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:text-base">
                        {tile.tag}
                      </p>
                    )}
                    {tile.cta && (
                      <span className="mt-3 inline-flex translate-y-2 items-center gap-2 rounded-full border-2 border-[#E07B0C] px-6 py-2.5 text-sm font-semibold text-white transition-all delay-100 duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 hover:bg-[#E07B0C] sm:text-base">
                        {tile.cta}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                )}
              </>
            )

            // A photo without a link is just a photo (not clickable)
            return tile.href ? (
              <Link
                key={tile.id}
                href={tile.href}
                aria-label={tile.cta ? `${tile.title}: ${tile.cta}` : tile.title || 'Open'}
                className={tileClass}
              >
                {inner}
              </Link>
            ) : (
              <div key={tile.id} className={tileClass}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
