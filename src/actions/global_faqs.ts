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

function sanitizeFaqText(text: string): string {
  return text
    .replace(/jaandaar\s*masal[ae]?/gi, 'HS AgroFoods')
    .replace(/jaandaar/gi, 'HS AgroFoods')
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

  const sanitizedData = (data || []).map((item: any) => ({
    ...item,
    question: typeof item.question === 'string' ? sanitizeFaqText(item.question) : item.question,
    answer: typeof item.answer === 'string' ? sanitizeFaqText(item.answer) : item.answer,
  }))

  return { success: true, data: sanitizedData }
}

export async function addGlobalFaq(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()

  const question = formData.get('question')?.toString().trim()
  const answer = formData.get('answer')?.toString().trim()

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

  const question = formData.get('question')?.toString().trim()
  const answer = formData.get('answer')?.toString().trim()

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
  const updatedAt = new Date().toISOString()

  const results = await Promise.all(
    orders.map((item) =>
      supabase
        .from('global_faqs')
        .update({ display_order: item.display_order, updated_at: updatedAt })
        .eq('id', item.id)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return { success: false, error: failed.error.message }
  }

  revalidateFaqConsumers()
  return { success: true }
}

/** Show or hide a global FAQ on the storefront without deleting it. */
export async function setGlobalFaqActive(id: string, isActive: boolean) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('global_faqs')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateFaqConsumers()
  return { success: true, data: data[0] }
}

/** How many products currently pull in the global FAQs. */
export async function getGlobalFaqUsage(): Promise<{ using: number; total: number }> {
  const supabase = createAdminClient()
  const [{ count: total }, { count: using }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('use_global_faqs', true),
  ])
  return { using: using ?? 0, total: total ?? 0 }
}
