'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function subscribeNewsletter(email: string) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email is required.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const supabase = createAdminClient()
    const normalizedEmail = email.trim().toLowerCase()
    const subscriberName = 'Purity Club Subscriber'
    const brevoApiKey = process.env.BREVO_API_KEY?.trim()
    const brevoListId = Number(process.env.BREVO_LIST_ID)

    if (!brevoApiKey || !Number.isInteger(brevoListId) || brevoListId < 1) {
      return { success: false, error: 'The email subscription service is not configured yet. Please try again later.' }
    }

    const { data: existing, error: lookupError } = await supabase
      .from('inquiries')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('name', subscriberName)
      .limit(1)
      .maybeSingle()

    if (lookupError) return { success: false, error: 'Unable to verify your subscription. Please try again.' }
    if (existing) return { success: true }

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        listIds: [brevoListId],
        updateEnabled: true,
      }),
    })

    if (!brevoResponse.ok) {
      console.error('Brevo newsletter subscription failed:', await brevoResponse.text())
      return { success: false, error: 'Unable to complete your subscription. Please try again.' }
    }
    
    // Save to inquiries with newsletter tag
    const { error } = await supabase
      .from('inquiries')
      .insert([{
        name: subscriberName,
        email: normalizedEmail,
        message: 'Joined Purity Club newsletter for festival recipe cards and discounts.',
        is_resolved: false,
      }])

    if (error) return { success: false, error: 'Unable to save your subscription. Please try again.' }

    return { success: true }
  } catch (err) {
    console.error('Newsletter error:', err)
    return { success: false, error: 'Unable to save your subscription. Please try again.' }
  }
}
