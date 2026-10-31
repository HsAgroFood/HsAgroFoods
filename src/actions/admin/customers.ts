'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'
import { REAL_ORDER_FILTER } from '@/lib/orderVisibility'

export type AdminActionResult = {
  error?: string
  success?: boolean
}

export async function getCustomers() {
  if (!(await isAdminAuthenticated())) return []

  const adminClient = createAdminClient()

  // 1. Fetch registered customer profiles
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  // 2. Fetch direct-auth customers (users table is the login source of truth)
  const { data: directUsers } = await adminClient
    .from('users')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  // 3. Fetch all orders to include ordering customers
  const { data: orders } = await adminClient
    .from('orders')
    .select('id, user_id, shipping_address, created_at')
    .or(REAL_ORDER_FILTER)
    .order('created_at', { ascending: false })

  const customerMap = new Map<string, any>()

  // Add registered customer profiles
  profiles?.forEach((p) => {
    const emailKey = p.email?.trim().toLowerCase()
    if (emailKey) {
      customerMap.set(emailKey, {
        id: p.id,
        full_name: p.full_name || 'Customer',
        email: p.email,
        phone: p.phone || '',
        role: 'customer',
        is_active: p.is_active ?? true,
        created_at: p.created_at,
        orders_count: 0,
      })
    }
  })

  // Merge direct-auth users, whose is_active flag controls sign-in
  directUsers?.forEach((u) => {
    const emailKey = u.email?.trim().toLowerCase()
    if (!emailKey) return

    const existing = customerMap.get(emailKey)
    if (existing) {
      existing.is_active = u.is_active ?? existing.is_active
      if (!existing.phone && u.phone) existing.phone = u.phone
      if ((!existing.full_name || existing.full_name === 'Customer') && u.full_name) {
        existing.full_name = u.full_name
      }
    } else {
      customerMap.set(emailKey, {
        id: u.id,
        full_name: u.full_name || 'Customer',
        email: u.email,
        phone: u.phone || '',
        role: 'customer',
        is_active: u.is_active ?? true,
        created_at: u.created_at,
        orders_count: 0,
      })
    }
  })

  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@hsagrofoods.com').trim().toLowerCase()

  // Add or augment with order history
  orders?.forEach((o) => {
    const emailKey = o.shipping_address?.email?.trim().toLowerCase()
    if (emailKey && emailKey !== defaultAdminEmail) {
      if (customerMap.has(emailKey)) {
        const existing = customerMap.get(emailKey)
        existing.orders_count = (existing.orders_count || 0) + 1
        if (!existing.phone && o.shipping_address?.phone) {
          existing.phone = o.shipping_address.phone
        }
      } else {
        // Customer who ordered with shipping details
        customerMap.set(emailKey, {
          id: o.user_id || o.id,
          full_name: o.shipping_address?.full_name || 'Customer',
          email: o.shipping_address?.email || emailKey,
          phone: o.shipping_address?.phone || '',
          role: 'customer',
          is_active: true,
          created_at: o.created_at,
          orders_count: 1,
        })
      }
    }
  })

  return Array.from(customerMap.values())
}

export async function toggleCustomerStatus(
  id: string,
  isActive: boolean
): Promise<AdminActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }

  const adminClient = createAdminClient()

  const { data: profileRows, error: profileError } = await adminClient
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('role', 'customer')
    .select('id')

  // The direct-auth login checks the `users` table, so keep both in sync.
  const { data: userRows, error: userError } = await adminClient
    .from('users')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('role', 'customer')
    .select('id')

  if (profileError) {
    return { error: profileError.message }
  }

  if (userError) {
    return { error: userError.message }
  }

  if (!profileRows?.length && !userRows?.length) {
    return { error: 'No registered account found for this customer' }
  }

  revalidatePath('/admin/customers')
  return { success: true }
}
