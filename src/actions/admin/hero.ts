'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'

export type HeroTextMode = 'global' | 'per_slide'

export type HeroGlobalText = {
  title: string
  subtitle: string
  button_text: string
  button_link: string
}

export type HeroConfig = {
  text_mode: HeroTextMode
  global_text: HeroGlobalText
}

const HERO_CONFIG_SLUG = '__system_hero_config__'

function sanitizeBrandName(text: string): string {
  return text
    .replace(/jaandaar\s*masal[ae]?/gi, 'HS AgroFoods')
    .replace(/jaandaar/gi, 'HS AgroFoods')
}

const DEFAULT_GLOBAL_TEXT: HeroGlobalText = {
  title: 'Pure Spices & Natural Dehydrated Powders.',
  subtitle: "HS AgroFoods brings India's finest cold-ground spices and nutrient-rich dehydrated fruit & vegetable powders straight to your kitchen.",
  button_text: 'Shop Now',
  button_link: '/shop',
}

const DEFAULT_HERO_CONFIG: HeroConfig = {
  text_mode: 'per_slide',
  global_text: DEFAULT_GLOBAL_TEXT,
}

async function readHeroConfig(
  adminClient: ReturnType<typeof createAdminClient>
): Promise<HeroConfig> {
  const { data } = await adminClient
    .from('categories')
    .select('description')
    .eq('slug', HERO_CONFIG_SLUG)
    .maybeSingle()

  if (!data?.description) return DEFAULT_HERO_CONFIG

  try {
    const parsed = JSON.parse(data.description)
    const text = parsed?.global_text || {}

    return {
      text_mode: parsed?.text_mode === 'global' ? 'global' : 'per_slide',
      global_text: {
        title: typeof text.title === 'string' ? sanitizeBrandName(text.title) : DEFAULT_GLOBAL_TEXT.title,
        subtitle: typeof text.subtitle === 'string' ? sanitizeBrandName(text.subtitle) : DEFAULT_GLOBAL_TEXT.subtitle,
        button_text: typeof text.button_text === 'string' ? text.button_text : DEFAULT_GLOBAL_TEXT.button_text,
        button_link: typeof text.button_link === 'string' ? text.button_link : DEFAULT_GLOBAL_TEXT.button_link,
      },
    }
  } catch {
    return DEFAULT_HERO_CONFIG
  }
}

export async function getHeroConfig(): Promise<HeroConfig> {
  try {
    const adminClient = createAdminClient()
    return await readHeroConfig(adminClient)
  } catch {
    return DEFAULT_HERO_CONFIG
  }
}

async function saveHeroConfig(
  patch: Partial<HeroConfig>
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  try {
    const adminClient = createAdminClient()
    const current = await readHeroConfig(adminClient)
    const next: HeroConfig = {
      text_mode: patch.text_mode ?? current.text_mode,
      global_text: patch.global_text ?? current.global_text,
    }

    const { error } = await adminClient.from('categories').upsert(
      {
        slug: HERO_CONFIG_SLUG,
        name: 'System Hero Config',
        description: JSON.stringify(next),
        is_active: false,
      },
      { onConflict: 'slug' }
    )

    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/hero-slides')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save hero settings.' }
  }
}

// Global Text
export async function updateGlobalHeroText(data: {
  title: string
  subtitle: string
  button_text: string
  button_link: string
}) {
  return saveHeroConfig({
    global_text: {
      title: data.title || '',
      subtitle: data.subtitle || '',
      button_text: data.button_text || '',
      button_link: data.button_link || '',
    },
  })
}

export async function updateHeroTextMode(mode: 'global' | 'per_slide'): Promise<{ success: boolean; error?: string }> {
  if (mode !== 'global' && mode !== 'per_slide') {
    return { success: false, error: 'Invalid hero text mode.' }
  }
  return saveHeroConfig({ text_mode: mode })
}

export async function updateHeroSlideText(id: string, data: {
  title: string
  subtitle: string
  button_text: string
  button_link: string
}) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('hero_slides')
    .update({
      title: data.title,
      subtitle: data.subtitle,
      button_text: data.button_text,
      button_link: data.button_link,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

const DEFAULT_HERO_DATA = [
  {
    image_url: '/images/slides/turmeric-slide.png',
    title: 'Golden Purity. Natural Healing. Rich Curcumin.',
    subtitle: 'Handpicked Salem & Alleppey turmeric roots, cold-ground to preserve natural essential oils and authentic golden warmth.',
    button_text: 'Shop Turmeric Powder',
    button_link: '/product/turmeric-powder',
    is_active: true,
    display_order: 0,
  },
  {
    image_url: '/images/slides/chat-masala-slide.png',
    title: 'Tangy Chaat Masala — Bursting With Chatpata Flavor',
    subtitle: 'Crafted from sun-dried raw mango, roasted Gujarat cumin, black rock salt, and mint for irresistible everyday snacks and salads.',
    button_text: 'Shop Chaat Masala',
    button_link: '/product/chat-masala',
    is_active: true,
    display_order: 1,
  },
  {
    image_url: '/images/slides/fruit-chat-slide.png',
    title: 'Special Fruit Chaat Masala for Fresh Bowls',
    subtitle: 'A delicate blend of pink Himalayan salt, mild amchur, and cooling herbs that elevates every fresh fruit salad and juice.',
    button_text: 'Shop Fruit Chaat Masala',
    button_link: '/product/fruit-chat-masala',
    is_active: true,
    display_order: 2,
  },
  {
    image_url: '/images/slides/mango-powder-slide.png',
    title: 'Pure Dry Mango Powder (Amchur)',
    subtitle: '100% natural, chemical-free unripe green mango slices finely ground for bright, fruity tang in curries, dals, and chutneys.',
    button_text: 'Shop Amchur Powder',
    button_link: '/product/mango-powder',
    is_active: true,
    display_order: 3,
  },
  {
    image_url: '/images/slides/beetroot-slide.png',
    title: '100% Pure Dehydrated Beetroot Powder',
    subtitle: 'Low-temperature dehydrated farm beetroots packed with iron, antioxidants, and vibrant natural color for smoothies, rotis, and wellness.',
    button_text: 'Shop Beetroot Powder',
    button_link: '/product/beetroot-powder',
    is_active: true,
    display_order: 4,
  },
  {
    image_url: '/images/slides/tomato-powder-slide.png',
    title: 'Instant Dehydrated Tomato Powder',
    subtitle: 'Rich, sun-ripened tomatoes gently dehydrated into an instant tangy base for gravies, soups, pasta sauces, and snack seasonings.',
    button_text: 'Shop Tomato Powder',
    button_link: '/product/tomato-powder',
    is_active: true,
    display_order: 5,
  },
  {
    image_url: '/images/slides/banana-powder-slide.png',
    title: 'Pure Dehydrated Raw Banana Powder',
    subtitle: 'Naturally gluten-free raw green banana powder rich in potassium and resistant starch — ideal for healthy porridge, shakes, and baking.',
    button_text: 'Shop Banana Powder',
    button_link: '/product/banana-powder',
    is_active: true,
    display_order: 6,
  },
]

export async function getHeroSlides() {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return []
  }

  // If table is empty, auto-seed the standard slides so they appear in admin and DB
  if (!data || data.length === 0) {
    try {
      const { data: inserted } = await adminClient
        .from('hero_slides')
        .insert(DEFAULT_HERO_DATA)
        .select('*')
      if (inserted && inserted.length > 0) {
        return inserted
      }
    } catch (e) {
      console.warn('Auto-seed hero slides failed:', e)
    }
  }

  return (data || []).map((slide: any) => ({
    ...slide,
    title: typeof slide.title === 'string' ? sanitizeBrandName(slide.title) : slide.title,
    subtitle: typeof slide.subtitle === 'string' ? sanitizeBrandName(slide.subtitle) : slide.subtitle,
  }))
}

export async function saveHeroSlide(slide: {
  id?: string
  image_url: string
  title: string
  subtitle: string
  button_text: string
  button_link: string
  is_active?: boolean
}) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()

  if (slide.id) {
    // Update existing slide
    const { error } = await adminClient
      .from('hero_slides')
      .update({
        image_url: slide.image_url,
        title: slide.title,
        subtitle: slide.subtitle,
        button_text: slide.button_text,
        button_link: slide.button_link,
        is_active: slide.is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', slide.id)

    if (error) return { success: false, error: error.message }
  } else {
    // Create new slide
    const { count } = await adminClient
      .from('hero_slides')
      .select('*', { count: 'exact', head: true })

    const { error } = await adminClient
      .from('hero_slides')
      .insert([{
        image_url: slide.image_url,
        title: slide.title,
        subtitle: slide.subtitle,
        button_text: slide.button_text,
        button_link: slide.button_link,
        is_active: true,
        display_order: count || 0
      }])

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function createHeroSlide(imageUrl: string, slideData?: any) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()
  const { count } = await adminClient
    .from('hero_slides')
    .select('*', { count: 'exact', head: true })

  if (count && count >= 8) {
    return { success: false, error: 'Maximum 8 slides allowed.' }
  }

  const { error } = await adminClient
    .from('hero_slides')
    .insert([{
      image_url: imageUrl,
      title: slideData?.title || 'Pure Spice. Real Taste. Trusted Every Time.',
      subtitle: slideData?.subtitle || "HS AgroFoods brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor.",
      button_text: slideData?.button_text || 'Shop Now',
      button_link: slideData?.button_link || '/shop',
      is_active: true,
      display_order: count || 0
    }])

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function deleteHeroSlide(id: string) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('hero_slides')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function toggleHeroSlideStatus(id: string, isActive: boolean) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('hero_slides')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}
