'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import {
  HOME_DEFAULTS,
  HOME_SECTION_KEYS,
  mergeHomeContent,
  normalizeLayout,
  sanitizeLike,
  type HomeContent,
  type HomeSectionKey,
} from '@/lib/homeContent'

/**
 * All home page content lives in one JSON document stored in a hidden "system" row of the categories table
 * (the same trick the hero and shipping settings use), so no extra database table or migration is needed.
 */
const HOME_CONTENT_SLUG = '__system_home_content__'

type AdminClient = ReturnType<typeof createAdminClient>

async function readStored(adminClient: AdminClient): Promise<Record<string, unknown>> {
  const { data } = await adminClient.from('categories').select('description').eq('slug', HOME_CONTENT_SLUG).maybeSingle()
  if (!data?.description) return {}
  try {
    const parsed = JSON.parse(data.description)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function writeStored(adminClient: AdminClient, stored: Record<string, unknown>) {
  return adminClient.from('categories').upsert(
    {
      slug: HOME_CONTENT_SLUG,
      name: 'System Home Content',
      description: JSON.stringify(stored),
      is_active: false,
    },
    { onConflict: 'slug' }
  )
}

/** Everything the home page needs, with defaults filling in whatever the admin has not customised. */
export async function getHomeContent(): Promise<HomeContent> {
  try {
    return mergeHomeContent(await readStored(createAdminClient()))
  } catch {
    return mergeHomeContent({})
  }
}

type SaveResult = { success: true; section: unknown } | { success: false; error: string }

export async function saveHomeSection(key: string, data: unknown): Promise<SaveResult> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  if (!HOME_SECTION_KEYS.includes(key as HomeSectionKey)) return { success: false, error: 'Unknown home section.' }

  const sectionKey = key as HomeSectionKey

  try {
    const adminClient = createAdminClient()
    const stored = await readStored(adminClient)

    let clean: unknown = sanitizeLike(data, HOME_DEFAULTS[sectionKey])
    if (sectionKey === 'layout') clean = normalizeLayout(clean as HomeContent['layout'])

    const { error } = await writeStored(adminClient, { ...stored, [sectionKey]: clean })
    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/home-customization')
    return { success: true, section: clean }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save this section.' }
  }
}
