import { getAnnouncement } from '@/actions/admin/announcements'

export async function AnnouncementBar() {
  const announcement = await getAnnouncement()

  if (!announcement || !announcement.is_active || !announcement.message) {
    return null
  }

  // Create a crisp single-line mobile version while keeping admin edits dynamic
  const mobileMessage = announcement.message
    .replace('Natural Dehydrated Veg & Fruit Powders', 'Dehydrated Powders')
    .replace('on Orders Above', 'Above')

  return (
    <div className="bg-gradient-to-r from-[#FCE8CE] via-[#FDF1E0] to-[#FCE8CE] text-[#9A4406] py-1.5 sm:py-2 px-3 sm:px-4 text-center border-b border-[#F0D5B4]">
      {/* Mobile: Crisp Single-Line Compact Text */}
      <p className="sm:hidden text-[11px] font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
        {mobileMessage}
      </p>
      {/* Tablet & Desktop: Full Announcement Message */}
      <p className="hidden sm:block text-xs sm:text-sm font-semibold tracking-wide">
        {announcement.message}
      </p>
    </div>
  )
}
