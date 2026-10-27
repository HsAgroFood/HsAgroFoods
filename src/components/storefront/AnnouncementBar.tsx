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

  return (
    <div className="bg-gradient-to-r from-[#FCE8CE] via-[#FDF1E0] to-[#FCE8CE] text-[#9A4406] py-2 px-2 sm:px-4 text-center border-b border-[#F0D5B4] overflow-hidden">
      {/* Mobile: Seamless Continuous Infinite Marquee */}
      <AnnouncementMobileSlider slides={mobileSlides} />

      {/* Tablet & Desktop: Full Centered Announcement */}
      <p className="hidden sm:block text-xs sm:text-sm font-semibold tracking-wide">
        {announcement.message}
      </p>
    </div>
  )
}
