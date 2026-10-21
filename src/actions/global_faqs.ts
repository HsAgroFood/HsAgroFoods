'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'

function revalidateFaqConsumers() {
  revalidatePath('/admin/global-faqs')
  revalidatePath('/admin/settings/faqs')
  revalidatePath('/product/[slug]', 'page')
  revalidatePath('/shop')
  revalidatePath('/')
}

export async function getGlobalFaqs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_faqs')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching global FAQs:', error?.message || error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function addGlobalFaq(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()

  const question = formData.get('question')?.toString()
  const answer = formData.get('answer')?.toString()

  if (!question || !answer) {
    return { success: false, error: 'Question and answer are required' }
  }

  // Get current max display_order
  const { data: maxOrderData } = await supabase
    .from('global_faqs')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const newOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from('global_faqs')
    .insert([
      {
        question,
        answer,
        display_order: newOrder
      }
    ])
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateFaqConsumers()
  return { success: true, data: data[0] }
}

export async function updateGlobalFaq(id: string, formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()

  const question = formData.get('question')?.toString()
  const answer = formData.get('answer')?.toString()

  if (!question || !answer) {
    return { success: false, error: 'Question and answer are required' }
  }

  const { data, error } = await supabase
    .from('global_faqs')
    .update({ question, answer, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateFaqConsumers()
  return { success: true, data: data[0] }
}

export async function deleteGlobalFaq(id: string) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('global_faqs')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateFaqConsumers()
  return { success: true }
}

export async function updateGlobalFaqOrders(orders: { id: string; display_order: number }[]) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()

  // Supabase doesn't have a built-in bulk update for different values on same query cleanly via RPC without creating one.
  // We'll update them individually since it's a small array.
  for (const item of orders) {
    const { error } = await supabase
      .from('global_faqs')
      .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidateFaqConsumers()
  return { success: true }
}
