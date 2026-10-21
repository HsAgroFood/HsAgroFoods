import { getHeroSlides, getHeroConfig } from '@/actions/admin/hero'
import { HeroBackgroundSlider, HeroSlideItem, GlobalHeroText } from '@/components/storefront/HeroBackgroundSlider'

export const dynamic = 'force-dynamic'

const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'default-turmeric',
    image_url: '/images/turmeric-powder.jpeg',
    tag: '✦ 100% Pure Salem Turmeric',
    title: 'Golden Purity. Natural Healing. Rich Curcumin.',
    subtitle: 'Handpicked Salem & Alleppey turmeric roots, cold-ground to preserve natural essential oils and authentic golden warmth.',
    button_text: 'Shop Turmeric Powder',
    button_link: '/product/turmeric-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-red-chilly',
    image_url: '/images/red-chilly-powder.jpeg',
    tag: '✦ Vibrant Kashmiri & Guntur Blend',
    title: 'Authentic Fiery Aroma & Rich Natural Color',
    subtitle: 'Sun-dried whole red chillies ground without artificial colors or seed fillers for appetizing heat and vibrant color.',
    button_text: 'Shop Red Chilly',
    button_link: '/product/red-chilly-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-garam-masala',
    image_url: '/images/garam-masala.jpeg',
    tag: '✦ Master Royal Heritage Blend',
    title: 'Master Crafted Royal Garam Masala',
    subtitle: 'An heirloom recipe of slow-roasted whole spices formulated to transform everyday curries into royal culinary feasts.',
    button_text: 'Shop Garam Masala',
    button_link: '/product/garam-masala',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-coriander',
    image_url: '/images/coriander-powder.jpeg',
    tag: '✦ Plump Green Rajasthan Seeds',
    title: 'Freshly Ground Coriander (Dhaniya)',
    subtitle: 'Selected roasted whole coriander seeds gently ground to lock in fresh citrusy aroma and natural essential oils.',
    button_text: 'Shop Coriander',
    button_link: '/product/coriander-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-cumin',
    image_url: '/images/cumin-powder.jpeg',
    tag: '✦ Gujarat Sun-Dried Cumin',
    title: 'Aromatic Cumin (Jeera) Powder',
    subtitle: 'Premium Gujarat cumin seeds sun-dried and perfectly roasted for rich warm earthy aroma in every single pinch.',
    button_text: 'Shop Cumin',
    button_link: '/product/cumin-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
]

export async function HeroSection() {
  let activeSlides: HeroSlideItem[] = []
  let textMode: 'global' | 'per_slide' = 'per_slide'
  let globalText: GlobalHeroText = {
    title: 'Pure Spice. Real Taste. Trusted Every Time.',
    subtitle: "Jaandaar Masle brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor.",
    button_text: 'Shop Now',
    button_link: '/shop',
  }

  try {
    const [slides, heroConfig] = await Promise.all([getHeroSlides(), getHeroConfig()])

    textMode = heroConfig.text_mode
    globalText = heroConfig.global_text

    if (slides && slides.length > 0) {
      const filtered = slides.filter((s: any) => s.is_active)
      if (filtered.length > 0) {
        activeSlides = filtered
      }
    }
  } catch (error) {
    console.error('Error fetching hero slides, falling back to defaults:', error instanceof Error ? error.message : error)
  }

  // If no active slides from database, use rich default curated slides
  if (activeSlides.length === 0) {
    activeSlides = DEFAULT_HERO_SLIDES
    textMode = 'per_slide'
  }

  return (
    <HeroBackgroundSlider
      slides={activeSlides}
      textMode={textMode}
      globalText={globalText}
    />
  )
}
