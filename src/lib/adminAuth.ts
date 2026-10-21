import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSessionValue } from '@/lib/adminSession'

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    if (await verifyAdminSessionValue(cookieStore.get('admin_session')?.value)) {
      return true
    }
  } catch {
    // Cookie store unavailable
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    return profile?.role === 'admin'
  } catch {
    return false
  }
}

export const UNAUTHORIZED_ERROR = 'Unauthorized: Admin access required.'
