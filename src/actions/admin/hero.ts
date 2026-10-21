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

const DEFAULT_GLOBAL_TEXT: HeroGlobalText = {
  title: 'Pure Spice. Real Taste. Trusted Every Time.',
  subtitle: "Jaandaar Masale brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor.",
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
        title: typeof text.title === 'string' ? text.title : DEFAULT_GLOBAL_TEXT.title,
        subtitle: typeof text.subtitle === 'string' ? text.subtitle : DEFAULT_GLOBAL_TEXT.subtitle,
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
    image_url: '/images/turmeric-powder.jpeg',
    title: 'Golden Purity. Natural Healing. Rich Curcumin.',
    subtitle: 'Handpicked Salem & Alleppey turmeric roots, cold-ground to preserve natural essential oils and authentic golden warmth.',
    button_text: 'Shop Turmeric Powder',
    button_link: '/product/turmeric-powder',
    is_active: true,
    display_order: 0,
  },
  {
    image_url: '/images/red-chilly-powder.jpeg',
    title: 'Authentic Fiery Aroma & Rich Natural Color',
    subtitle: 'Sun-dried whole red chillies ground without artificial colors or seed fillers for appetizing heat and vibrant color.',
    button_text: 'Shop Red Chilly',
    button_link: '/product/red-chilly-powder',
    is_active: true,
    display_order: 1,
  },
  {
    image_url: '/images/garam-masala.jpeg',
    title: 'Master Crafted Royal Garam Masala',
    subtitle: 'An heirloom recipe of slow-roasted whole spices formulated to transform everyday curries into royal culinary feasts.',
    button_text: 'Shop Garam Masala',
    button_link: '/product/garam-masala',
    is_active: true,
    display_order: 2,
  },
  {
    image_url: '/images/coriander-powder.jpeg',
    title: 'Freshly Ground Coriander (Dhaniya)',
    subtitle: 'Selected roasted whole coriander seeds gently ground to lock in fresh citrusy aroma and natural essential oils.',
    button_text: 'Shop Coriander',
    button_link: '/product/coriander-powder',
    is_active: true,
    display_order: 3,
  },
  {
    image_url: '/images/cumin-powder.jpeg',
    title: 'Aromatic Cumin (Jeera) Powder',
    subtitle: 'Premium Gujarat cumin seeds sun-dried and perfectly roasted for rich warm earthy aroma in every single pinch.',
    button_text: 'Shop Cumin',
    button_link: '/product/cumin-powder',
    is_active: true,
    display_order: 4,
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

  return data || []
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
      subtitle: slideData?.subtitle || "Jaandaar Masle brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor.",
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
