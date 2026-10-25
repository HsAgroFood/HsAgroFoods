'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'

export type ShippingConfig = {
  free_shipping_threshold: number
  standard_shipping_cost: number
}

const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  free_shipping_threshold: 500,
  standard_shipping_cost: 90,
}

const CONFIG_SLUG = '__system_shipping_config__'

/**
 * Get current shipping configuration from database
 * Always returns valid numbers with graceful fallbacks
 */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('categories')
      .select('description')
      .eq('slug', CONFIG_SLUG)
      .maybeSingle()

    if (data?.description) {
      const parsed = JSON.parse(data.description)
      const threshold = Number(parsed.free_shipping_threshold)
      const shippingCost = Number(parsed.standard_shipping_cost)

      return {
        free_shipping_threshold: Number.isFinite(threshold) && threshold >= 0
          ? threshold
          : DEFAULT_SHIPPING_CONFIG.free_shipping_threshold,
        standard_shipping_cost: Number.isFinite(shippingCost) && shippingCost >= 0
          ? shippingCost
          : DEFAULT_SHIPPING_CONFIG.standard_shipping_cost,
      }
    }
  } catch (err) {
    console.warn('Error reading shipping config, using default:', err)
  }

  return DEFAULT_SHIPPING_CONFIG
}

/**
 * Update shipping configuration (Admin Only)
 */
export async function updateShippingConfig(
  freeShippingThreshold: number,
  standardShippingCost: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: UNAUTHORIZED_ERROR }
    }

    const adminClient = createAdminClient()

    const threshold = Number(freeShippingThreshold)
    const shippingCost = Number(standardShippingCost)

    if (!Number.isFinite(threshold) || threshold < 0) {
      return { success: false, error: 'Free shipping threshold must be a non-negative number.' }
    }

    if (!Number.isFinite(shippingCost) || shippingCost < 0) {
      return { success: false, error: 'Standard shipping cost must be a non-negative number.' }
    }

    const payload: ShippingConfig = {
      free_shipping_threshold: Math.round(threshold),
      standard_shipping_cost: Math.round(shippingCost),
    }

    const { error } = await adminClient
      .from('categories')
      .upsert(
        {
          slug: CONFIG_SLUG,
          name: 'System Shipping Config',
          description: JSON.stringify(payload),
          is_active: false,
        },
        { onConflict: 'slug' }
      )

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths that use shipping calculations
    revalidatePath('/cart')
    revalidatePath('/checkout')
    revalidatePath('/admin/delivery-settings')
    revalidatePath('/admin/settings/shipping')
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update shipping settings.' }
  }
}
