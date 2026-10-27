/**
 * Utility to generate auto-cropped responsive slide URLs for Desktop (16:9) and Mobile (4:5).
 * Works seamlessly with ImageKit, Cloudinary, Unsplash, and local slide assets.
 */

function removeImageKitTransform(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete('tr')
    return urlObj.toString()
  } catch {
    return url.replace(/([?&])tr=[^&]*(&|$)/, '$1').replace(/[?&]$/, '')
  }
}

export function getDesktopSlideUrl(imageUrl?: string): string {
  if (!imageUrl || imageUrl.trim() === '') return ''

  // 1. ImageKit URL transformation (16:9, max width 1600px, smart subject focus)
  if (imageUrl.includes('ik.imagekit.io')) {
    const cleanUrl = removeImageKitTransform(imageUrl)
    const separator = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${separator}tr=w-1600,ar-16-9,fo-auto`
  }

  // 2. Cloudinary URL transformation
  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
    return imageUrl.replace('/upload/', '/upload/c_fill,ar_16:9,g_auto,w_1600/')
  }

  // 3. Unsplash
  if (imageUrl.includes('images.unsplash.com')) {
    const cleanUrl = imageUrl.split('?')[0]
    return `${cleanUrl}?w=1600&h=900&fit=crop&q=80`
  }

  return imageUrl
}

export function getMobileSlideUrl(imageUrl?: string, customMobileUrl?: string): string {
  if (customMobileUrl && customMobileUrl.trim() !== '') {
    return customMobileUrl
  }
  if (!imageUrl || imageUrl.trim() === '') return ''

  // 1. ImageKit URL transformation (4:5 aspect ratio, max width 800px, smart subject focus)
  if (imageUrl.includes('ik.imagekit.io')) {
    const cleanUrl = removeImageKitTransform(imageUrl)
    const separator = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${separator}tr=w-800,ar-4-5,fo-auto`
  }

  // 2. Cloudinary URL transformation (4:5, smart subject focus)
  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
    return imageUrl.replace('/upload/', '/upload/c_fill,ar_4:5,g_auto,w_800/')
  }

  // 3. Local pre-rendered slides mapping
  const localMap: Record<string, string> = {
    'turmeric-slide': '/images/slides-mobile/turmeric-slide.jpeg',
    'chat-masala-slide': '/images/slides-mobile/chat-masala-slide.jpeg',
    'fruit-chat-slide': '/images/slides-mobile/fruit-chat-slide.jpeg',
    'mango-powder-slide': '/images/slides-mobile/mango-powder-slide.jpeg',
    'beetroot-slide': '/images/slides-mobile/beetroot-slide.jpeg',
    'tomato-powder-slide': '/images/slides-mobile/tomato-powder-slide.jpeg',
    'banana-powder-slide': '/images/slides-mobile/banana-powder-slide.jpeg',
  }

  for (const [key, path] of Object.entries(localMap)) {
    if (imageUrl.toLowerCase().includes(key)) {
      return path
    }
  }

  if (imageUrl.includes('/images/slides/')) {
    const filename = imageUrl.split('/').pop()?.replace(/\.(png|jpg|webp)$/i, '.jpeg')
    if (filename) return `/images/slides-mobile/${filename}`
  }

  // 4. Unsplash (4:5 crop)
  if (imageUrl.includes('images.unsplash.com')) {
    const cleanUrl = imageUrl.split('?')[0]
    return `${cleanUrl}?w=800&h=1000&fit=crop&q=80`
  }

  return imageUrl
}
