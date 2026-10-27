import { getHeroSlides, getHeroConfig } from '@/actions/admin/hero'
import { HeroBackgroundSlider, HeroSlideItem, GlobalHeroText } from '@/components/storefront/HeroBackgroundSlider'
import { SPICE_ASSETS } from '@/constants/assets'

export const dynamic = 'force-dynamic'

const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'default-turmeric',
    image_url: SPICE_ASSETS.slides.turmeric,
    tag: '✦ 100% Pure Salem Turmeric',
    title: 'Golden Purity. Natural Healing. Rich Curcumin.',
    subtitle: 'Handpicked Salem & Alleppey turmeric roots, cold-ground to preserve natural essential oils and authentic golden warmth.',
    button_text: 'Shop Turmeric Powder',
    button_link: '/product/turmeric-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-chat-masala',
    image_url: SPICE_ASSETS.slides.chatMasala,
    tag: '✦ Authentic Street-Style Zest',
    title: 'Tangy Chaat Masala — Bursting With Chatpata Flavor',
    subtitle: 'Crafted from sun-dried raw mango, roasted Gujarat cumin, black rock salt, and mint for irresistible everyday snacks and salads.',
    button_text: 'Shop Chaat Masala',
    button_link: '/product/chat-masala',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-fruit-chat',
    image_url: SPICE_ASSETS.slides.fruitChat,
    tag: '✦ Sweet & Zesty Fruit Seasoning',
    title: 'Special Fruit Chaat Masala for Fresh Bowls',
    subtitle: 'A delicate blend of pink Himalayan salt, mild amchur, and cooling herbs that elevates every fresh fruit salad and juice.',
    button_text: 'Shop Fruit Chaat Masala',
    button_link: '/product/fruit-chat-masala',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-mango-powder',
    image_url: SPICE_ASSETS.slides.mangoPowder,
    tag: '✦ Sun-Cured Raw Green Mangoes',
    title: 'Pure Dry Mango Powder (Amchur)',
    subtitle: '100% natural, chemical-free unripe green mango slices finely ground for bright, fruity tang in curries, dals, and chutneys.',
    button_text: 'Shop Amchur Powder',
    button_link: '/product/mango-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-beetroot',
    image_url: SPICE_ASSETS.slides.beetroot,
    tag: '✦ Nutrient-Rich Dehydrated Superfood',
    title: '100% Pure Dehydrated Beetroot Powder',
    subtitle: 'Low-temperature dehydrated farm beetroots packed with iron, antioxidants, and vibrant natural color for smoothies, rotis, and wellness.',
    button_text: 'Shop Beetroot Powder',
    button_link: '/product/beetroot-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-tomato',
    image_url: SPICE_ASSETS.slides.tomatoPowder,
    tag: '✦ Vine-Ripened Tang & Lycopene',
    title: 'Instant Dehydrated Tomato Powder',
    subtitle: 'Rich, sun-ripened tomatoes gently dehydrated into an instant tangy base for gravies, soups, pasta sauces, and snack seasonings.',
    button_text: 'Shop Tomato Powder',
    button_link: '/product/tomato-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
  {
    id: 'default-banana',
    image_url: SPICE_ASSETS.slides.bananaPowder,
    tag: '✦ Wholesome Prebiotic Nutrition',
    title: 'Pure Dehydrated Raw Banana Powder',
    subtitle: 'Naturally gluten-free raw green banana powder rich in potassium and resistant starch — ideal for healthy porridge, shakes, and baking.',
    button_text: 'Shop Banana Powder',
    button_link: '/product/banana-powder',
    text_mode: 'per_slide',
    is_active: true,
  },
]

export async function HeroSection() {
  let activeSlides: HeroSlideItem[] = []
  let textMode: 'global' | 'per_slide' = 'per_slide'
  let globalText: GlobalHeroText = {
    title: 'Pure Spices & Natural Dehydrated Powders.',
    subtitle: "HS AgroFoods brings India's finest cold-ground spices and nutrient-rich dehydrated fruit & vegetable powders straight to your kitchen.",
    button_text: 'Shop All Products',
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
