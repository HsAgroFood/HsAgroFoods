import { getAnnouncement } from '@/actions/admin/announcements'
import { AnnouncementMobileSlider } from './AnnouncementMobileSlider'

interface AnnouncementRecord {
  id?: string
  message: string
  is_active: boolean
  [key: string]: unknown
}

export async function AnnouncementBar() {
  const announcement = (await getAnnouncement()) as AnnouncementRecord | null

  if (!announcement || !announcement.is_active || !announcement.message) {
    return null
  }

  // Split message by '•' or '|' for mobile step-by-step horizontal slides
  const rawParts: string[] = announcement.message
    .split(/[•|]/)
    .map((part: string) => part.trim())
    .filter(Boolean)

  const mobileSlides: string[] =
    rawParts.length > 1
      ? rawParts.map((part: string) => {
          const compact = part.replace(
            'Natural Dehydrated Veg & Fruit Powders',
            'Dehydrated Powders'
          )
          if (/^free shipping/i.test(compact)) {
            return `🚚 ${compact}`
          }
          return compact
        })
      : [announcement.message]

  // Desktop: the same parts, shown as a centred row with sparkle separators
  const desktopParts: string[] = rawParts.length > 1 ? rawParts : [announcement.message]

  return (
    <div className="relative z-40 overflow-hidden border-b border-[#F09819]/40 bg-gradient-to-r from-[#0C3A1D] via-[#144D29] to-[#0C3A1D] px-2 py-2 text-center text-[#FBE7C6] sm:px-4">
      {/* Gold hairline + slow shimmer sweep */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F6C177] to-transparent" />
      <div className="announcement-shimmer pointer-events-none absolute inset-0" />

      {/* Mobile: Seamless Continuous Infinite Marquee */}
      <AnnouncementMobileSlider slides={mobileSlides} />

      {/* Tablet & Desktop: centred row */}
      <div className="relative hidden items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold tracking-wide sm:flex sm:text-sm">
        {desktopParts.map((part, i) => {
          const isShipping = /free shipping/i.test(part)
          return (
            <span key={`${part}-${i}`} className="inline-flex items-center gap-4">
              {i > 0 && <span className="text-[10px] text-[#F09819]">✦</span>}
              <span className={isShipping ? 'text-[#F6C177]' : ''}>
                {isShipping ? `🚚 ${part}` : part}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
