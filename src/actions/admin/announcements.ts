'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'

export async function getAnnouncement() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return null
    }

    return data || null
  } catch {
    return null
  }
}

export async function saveAnnouncement(message: string, isActive: boolean) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  try {
    const adminSupabase = createAdminClient()
    const existing = await getAnnouncement()

    if (existing) {
      const { error } = await adminSupabase
        .from('announcements')
        .update({
          message,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await adminSupabase
        .from('announcements')
        .insert([{ message, is_active: isActive }])

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/announcements')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save announcement' }
  }
}
