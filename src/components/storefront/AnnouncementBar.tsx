import { getAnnouncement } from '@/actions/admin/announcements'

export async function AnnouncementBar() {
  const announcement = await getAnnouncement()

  if (!announcement || !announcement.is_active || !announcement.message) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#FCE8CE] via-[#FDF1E0] to-[#FCE8CE] text-[#9A4406] text-xs sm:text-sm font-semibold tracking-wide py-2 px-4 text-center border-b border-[#F0D5B4]">
      <p>{announcement.message}</p>
    </div>
  )
}
