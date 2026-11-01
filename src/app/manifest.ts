import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HS AgroFoods — Pure Spices & Dehydrated Powders',
    short_name: 'HS AgroFoods',
    description: 'Pure cold-ground Indian spices and natural dehydrated vegetable and fruit powders.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#14361F',
    lang: 'en-IN',
    icons: [
      { src: '/images/logo.png', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/icon.png', sizes: 'any', type: 'image/png' },
    ],
  }
}
