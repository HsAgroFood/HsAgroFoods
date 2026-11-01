import Link from 'next/link'
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { ShowcaseSlider } from './ShowcaseSlider'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'
import { resolveHomeIcon } from '@/lib/homeIcons'

const HIGHLIGHT_ICONS = [Leaf, Sparkles, ShieldCheck]

export function ShowcaseSection({ content = HOME_DEFAULTS.showcase }: { content?: HomeContent['showcase'] }) {
  const slides = content.slides.filter((slide) => slide.src)
  const highlights = content.highlights.map((item, index) => ({
    ...item,
    Icon: resolveHomeIcon(item.icon, HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]),
  }))

  return (
    <section id="showcase" className="bg-[#0F3A22]">
      <div className={`grid grid-cols-1 ${slides.length > 0 ? 'lg:grid-cols-2' : ''}`}>
        {/* Image slider */}
        {slides.length > 0 && (
          <ShowcaseSlider slides={slides} className="h-[300px] sm:h-auto sm:min-h-[460px] lg:min-h-[620px]" />
        )}

        {/* Text panel */}
        <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#175C31] via-[#144D29] to-[#0B2B19] px-5 pb-16 pt-12 sm:px-12 sm:py-16 lg:px-16">
          {/* Saffron glows + fine dot texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 100% 0%, rgba(240, 152, 25, 0.30) 0%, transparent 42%),
                radial-gradient(circle at 0% 100%, rgba(240, 152, 25, 0.14) 0%, transparent 42%),
                radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)
              `,
              backgroundSize: 'auto, auto, 22px 22px',
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="relative z-10 mx-auto max-w-xl text-center text-white">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[#F6C177]/30 bg-[#F6C177]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#F6C177] sm:text-xs">
              <Leaf className="h-3.5 w-3.5" />
              {content.eyebrow}
            </span>

            <h2 className="mt-6 text-balance font-serif text-[1.85rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[3.25rem]">
              {content.titleFirst} <span className="text-[#F09819]">{content.titleHighlight}</span>
            </h2>

            <div className="mx-auto mt-5 flex items-center justify-center gap-2" aria-hidden="true">
              <span className="h-1 w-3 rounded-full bg-[#F09819]/50" />
              <span className="h-1 w-14 rounded-full bg-[#F09819]" />
              <span className="h-1 w-3 rounded-full bg-[#F09819]/50" />
            </div>

            <p className="mx-auto mt-5 max-w-lg text-pretty text-[15px] font-medium leading-[1.75] text-white/75 sm:text-base lg:text-[17px]">
              {content.paragraph}
            </p>

            {/* Phones: compact pills */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:hidden">
              {highlights.map(({ Icon, title }, index) => (
                <li
                  key={`${title}-${index}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm"
                >
                  <Icon className="h-3 w-3 text-[#F09819]" />
                  {title}
                </li>
              ))}
            </ul>

            {/* Tablet and up: feature cards */}
            <ul className="mt-8 hidden grid-cols-3 gap-3 sm:grid">
              {highlights.map(({ Icon, title, detail }, index) => (
                <li
                  key={`${title}-${index}`}
                  className="group rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F09819]/50 hover:bg-white/[0.12]"
                >
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F09819]/15 text-[#F09819] ring-1 ring-[#F09819]/30 transition-colors group-hover:bg-[#F09819] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-snug text-white/60">{detail}</p>
                </li>
              ))}
            </ul>

            {(content.primaryText || content.secondaryText) && (
              <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-3 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center">
                {content.primaryText && content.primaryLink && (
                  <Link
                    href={content.primaryLink}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F09819] to-[#E07B0C] px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:from-[#E07B0C] hover:to-[#C96B06] hover:shadow-[#F09819]/25 sm:px-8 sm:text-base"
                  >
                    {content.primaryText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                {content.secondaryText && content.secondaryLink && (
                  <Link
                    href={content.secondaryLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/35 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white hover:text-[#144D29] sm:px-8 sm:text-base"
                  >
                    {content.secondaryText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
