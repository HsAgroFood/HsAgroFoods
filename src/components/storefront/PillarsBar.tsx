import { ChefHat, FlaskConical, PackageCheck, Sprout, type LucideIcon } from 'lucide-react'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'
import { resolveHomeIcon } from '@/lib/homeIcons'

/** Colour tone stays fixed per position; text and icon come from the admin (Home Customization). */
const PILLAR_STYLES: { Icon: LucideIcon; tone: 'green' | 'saffron' }[] = [
  { Icon: Sprout, tone: 'green' },
  { Icon: ChefHat, tone: 'saffron' },
  { Icon: PackageCheck, tone: 'green' },
  { Icon: FlaskConical, tone: 'saffron' },
]

const TONES = {
  green: {
    badge:
      'from-[#EEF7F0] to-[#D6EBDB] text-[#144D29] ring-[#C6E0CC] shadow-[#144D29]/10 group-hover:from-[#1A6234] group-hover:to-[#0F3F22] group-hover:text-white group-hover:ring-[#144D29] group-hover:shadow-[#144D29]/30',
    halo: 'bg-[#4E8D42]/15',
    dash: 'bg-[#4E8D42]',
  },
  saffron: {
    badge:
      'from-[#FFF5E6] to-[#FCE0B6] text-[#B45309] ring-[#F6D6A8] shadow-[#E07B0C]/10 group-hover:from-[#F09819] group-hover:to-[#E07B0C] group-hover:text-white group-hover:ring-[#E07B0C] group-hover:shadow-[#E07B0C]/30',
    halo: 'bg-[#F09819]/15',
    dash: 'bg-[#E07B0C]',
  },
}

export function PillarsBar({ content = HOME_DEFAULTS.pillars }: { content?: HomeContent['pillars'] }) {
  const pillars = content.items.map((item, index) => {
    const style = PILLAR_STYLES[index % PILLAR_STYLES.length]
    return { ...item, tone: style.tone, Icon: resolveHomeIcon(item.icon, style.Icon), id: `pillar-${index}` }
  })

  return (
    <section className="relative z-30 w-full py-8 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[1330px] px-2.5 sm:px-6 lg:px-8">
        {/* Main floating card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EFE7DC] bg-white shadow-[0_18px_50px_rgba(45,20,9,0.08)]">
          <div className="grid grid-cols-2 gap-y-2 p-3 sm:p-4 lg:grid-cols-4 lg:p-5">
            {pillars.map((item, index) => {
              const tone = TONES[item.tone]

              return (
                <div
                  key={item.id}
                  className="group relative flex cursor-default flex-col items-center rounded-2xl px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-[#FFFBF4] hover:to-[#FAF4EA] hover:shadow-lg hover:shadow-[#2D1409]/5 sm:px-4 sm:py-6 lg:px-5"
                >
                  {/* Soft divider between columns (desktop) */}
                  {index > 0 && (
                    <span className="pointer-events-none absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-[#E8DCC8] to-transparent lg:block" />
                  )}

                  {/* Icon badge with soft halo */}
                  <div className="relative">
                    <span
                      className={`absolute -inset-2 rounded-[22px] blur-md transition-opacity duration-300 group-hover:opacity-0 ${tone.halo}`}
                    />
                    <div
                      className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-1 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 sm:h-[68px] sm:w-[68px] ${tone.badge}`}
                    >
                      <item.Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                    </div>
                  </div>

                  {/* Two-tone serif headline */}
                  <h3 className="mt-4 font-serif text-[15px] font-bold leading-snug tracking-tight text-[#144D29] sm:text-base lg:text-[19px]">
                    {item.titleFirst && <span>{item.titleFirst} </span>}
                    <span className="text-[#E07B0C]">{item.titleHighlight}</span>
                  </h3>

                  {/* Accent dash grows on hover */}
                  <span
                    className={`my-2.5 block h-[3px] w-8 rounded-full transition-all duration-300 group-hover:w-14 ${tone.dash}`}
                  />

                  <p className="mx-auto max-w-[220px] text-[13px] leading-relaxed text-[#6E5951] sm:text-sm lg:text-[15px]">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
