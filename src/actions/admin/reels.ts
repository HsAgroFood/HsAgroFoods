'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { MAX_CAPTION_LENGTH, MAX_REELS, type Reel } from '@/lib/reels'
import { revalidatePath } from 'next/cache'

const TABLE_MISSING =
  'The reels table does not exist yet. Run supabase/migrations/20261101080000_home_reels.sql in the Supabase SQL editor, then try again.'

type Result = { success: true } | { success: false; error: string }

function friendlyError(message: string) {
  return /reels/i.test(message) && /(does not exist|schema cache)/i.test(message) ? TABLE_MISSING : message
}

function revalidateReels() {
  revalidatePath('/')
  revalidatePath('/admin/reels')
}

/** Active reels for the homepage. Returns [] when the table is missing or empty so the section simply hides. */
export async function getActiveReels(): Promise<Reel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reels')
      .select('id, video_url, caption, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(MAX_REELS)

    if (error || !data) return []
    return data as Reel[]
  } catch {
    return []
  }
}

/** Every reel (active or not) for the admin page. */
export async function getAllReels(): Promise<{ reels: Reel[]; tableMissing: boolean }> {
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('reels')
    .select('id, video_url, caption, is_active, display_order')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return { reels: [], tableMissing: friendlyError(error.message) === TABLE_MISSING }
  return { reels: (data || []) as Reel[], tableMissing: false }
}

function validVideoUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/** Returns the created row so the admin list can show it immediately, without a page refresh. */
export async function addReel(
  videoUrl: string,
  caption: string
): Promise<{ success: true; reel: Reel } | { success: false; error: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const cleanCaption = caption.trim().slice(0, MAX_CAPTION_LENGTH)
  if (!validVideoUrl(videoUrl)) return { success: false, error: 'Please upload a video first.' }

  const adminSupabase = createAdminClient()
  const { count, error: countError } = await adminSupabase.from('reels').select('*', { count: 'exact', head: true })
  if (countError) return { success: false, error: friendlyError(countError.message) }
  if ((count || 0) >= MAX_REELS) {
    return { success: false, error: `You can add up to ${MAX_REELS} reels. Delete one to add another.` }
  }

  const { data, error } = await adminSupabase
    .from('reels')
    .insert([{ video_url: videoUrl, caption: cleanCaption, is_active: true, display_order: count || 0 }])
    .select('id, video_url, caption, is_active, display_order')
    .single()

  if (error || !data) return { success: false, error: friendlyError(error?.message || 'Could not save the reel.') }

  revalidateReels()
  return { success: true, reel: data as Reel }
}

export async function updateReel(id: string, data: { caption: string; video_url: string }): Promise<Result> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  if (!validVideoUrl(data.video_url)) return { success: false, error: 'A reel needs a video.' }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('reels')
    .update({
      caption: data.caption.trim().slice(0, MAX_CAPTION_LENGTH),
      video_url: data.video_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: friendlyError(error.message) }

  revalidateReels()
  return { success: true }
}

export async function toggleReel(id: string, isActive: boolean): Promise<Result> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('reels')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: friendlyError(error.message) }

  revalidateReels()
  return { success: true }
}

export async function deleteReel(id: string): Promise<Result> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('reels').delete().eq('id', id)
  if (error) return { success: false, error: friendlyError(error.message) }

  revalidateReels()
  return { success: true }
}

/** Swap a reel with its neighbour, then renumber so display_order stays 0..n-1. */
export async function moveReel(id: string, direction: 'left' | 'right'): Promise<Result> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('reels')
    .select('id')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error || !data) return { success: false, error: friendlyError(error?.message || 'Failed to load reels') }

  const ids = data.map((r) => r.id as string)
  const from = ids.indexOf(id)
  const to = direction === 'left' ? from - 1 : from + 1
  if (from === -1 || to < 0 || to >= ids.length) return { success: true }

  ;[ids[from], ids[to]] = [ids[to], ids[from]]

  const results = await Promise.all(
    ids.map((reelId, index) => adminSupabase.from('reels').update({ display_order: index }).eq('id', reelId))
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) return { success: false, error: failed.error.message }

  revalidateReels()
  return { success: true }
}
