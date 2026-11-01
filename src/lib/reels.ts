export const MAX_REELS = 10
export const MAX_CAPTION_LENGTH = 120
/** Hard limit enforced in the uploader. Videos go browser -> ImageKit directly, so Vercel's 4.5MB request limit never applies. */
export const MAX_VIDEO_MB = 50

export type Reel = {
  id: string
  video_url: string
  caption: string
  is_active: boolean
  display_order: number
}

/** ImageKit can render a still frame of any video, so no separate poster upload is needed. */
export function getReelPoster(videoUrl: string): string | undefined {
  if (!videoUrl.includes('ik.imagekit.io')) return undefined
  const [path, query] = videoUrl.split('?')
  return `${path.replace(/\/+$/, '')}/ik-thumbnail.jpg${query ? `?${query}` : ''}`
}
