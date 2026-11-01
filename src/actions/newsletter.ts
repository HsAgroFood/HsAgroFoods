'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'

const LEGACY_SUBSCRIBER_NAME = 'Purity Club Subscriber'

/** Optional: mirror the email to a Brevo list when BREVO_API_KEY and BREVO_LIST_ID are configured. */
async function syncToBrevo(email: string) {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const listId = Number(process.env.BREVO_LIST_ID)
  if (!apiKey || !Number.isInteger(listId) || listId < 1) return

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { accept: 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    })
    if (!res.ok) console.error('Brevo newsletter sync failed:', await res.text())
  } catch (err) {
    console.error('Brevo newsletter sync error:', err)
  }
}

export async function subscribeNewsletter(email: string) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email is required.' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail, source: 'footer' })

    if (error) {
      // Already on the list: treat as success, nothing to add
      if (error.code === '23505') return { success: true }

      // Table not created yet (migration pending): keep collecting emails the old way
      if (error.code === '42P01' || /newsletter_subscribers/i.test(error.message)) {
        const { data: existing } = await supabase
          .from('inquiries')
          .select('id')
          .eq('email', normalizedEmail)
          .eq('name', LEGACY_SUBSCRIBER_NAME)
          .limit(1)
          .maybeSingle()
        if (existing) return { success: true }

        const { error: legacyError } = await supabase.from('inquiries').insert([
          {
            name: LEGACY_SUBSCRIBER_NAME,
            email: normalizedEmail,
            message: 'Joined Purity Club newsletter for festival recipe cards and discounts.',
            is_resolved: false,
          },
        ])
        if (legacyError) return { success: false, error: 'Unable to save your subscription. Please try again.' }
        return { success: true }
      }

      console.error('Newsletter insert failed:', error)
      return { success: false, error: 'Unable to save your subscription. Please try again.' }
    }

    await syncToBrevo(normalizedEmail)
    revalidatePath('/admin/subscribers')
    return { success: true }
  } catch (err) {
    console.error('Newsletter error:', err)
    return { success: false, error: 'Unable to save your subscription. Please try again.' }
  }
}

export async function deleteSubscriber(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const { error } = await createAdminClient().from('newsletter_subscribers').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/subscribers')
  return { success: true }
}
