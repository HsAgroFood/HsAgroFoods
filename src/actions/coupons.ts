'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { getEffectiveUser } from '@/lib/userAuth'
import { getCart } from '@/actions/cart'
import { checkCoupon, findCoupon, listPublicOffers, COUPON_COOKIE } from '@/lib/couponServer'
import { normalizeCouponCode, type CouponRules, type CouponType } from '@/lib/coupons'

const COUPON_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const MIGRATION_MISSING =
  'The coupons table does not exist yet. Run supabase/migrations/20261101050000_coupons.sql in the Supabase SQL editor, then try again.'

function rulesOf(coupon: CouponRules): CouponRules {
  return {
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_amount: coupon.min_order_amount,
  }
}

// ─────────────────────────── Customer side ───────────────────────────

type CartLine = { quantity: number; product_variants?: { price?: number | string } | null }

async function currentCartSubtotal() {
  const cart = await getCart()
  const items = (cart.items || []) as unknown as CartLine[]
  return items.reduce((sum, item) => sum + Number(item.product_variants?.price || 0) * Number(item.quantity || 0), 0)
}

export async function applyCoupon(
  rawCode: string
): Promise<{ success: true; coupon: CouponRules; discount: number } | { success: false; error: string }> {
  const code = normalizeCouponCode(rawCode || '')
  if (!code) return { success: false, error: 'Enter a coupon code.' }

  const admin = createAdminClient()
  const [subtotal, user] = await Promise.all([currentCartSubtotal(), getEffectiveUser()])
  if (subtotal <= 0) return { success: false, error: 'Your cart is empty.' }

  const result = await checkCoupon(admin, code, subtotal, { userId: user?.id, email: user?.email })
  if (!result.ok) return { success: false, error: result.error }

  const cookieStore = await cookies()
  cookieStore.set(COUPON_COOKIE, result.coupon.code, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COUPON_COOKIE_MAX_AGE,
  })

  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true, coupon: rulesOf(result.coupon), discount: result.discount }
}

export async function removeCoupon(): Promise<{ success: true }> {
  const cookieStore = await cookies()
  cookieStore.delete(COUPON_COOKIE)
  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

/**
 * The coupon saved in this browser, if it still exists and is switched on. Used to render the
 * cart / checkout summary. The order itself is always re-validated by createOrder.
 */
export async function getAppliedCoupon(): Promise<CouponRules | null> {
  try {
    const cookieStore = await cookies()
    const code = cookieStore.get(COUPON_COOKIE)?.value
    if (!code) return null

    const coupon = await findCoupon(createAdminClient(), code)
    if (!coupon || !coupon.is_active) return null
    const now = Date.now()
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) return null
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return null
    return rulesOf(coupon)
  } catch {
    return null
  }
}

/** Coupons to suggest under the cart's coupon box (only the ones the admin marked as public). */
export async function getPublicOffers(): Promise<CouponRules[]> {
  try {
    const user = await getEffectiveUser()
    return await listPublicOffers(createAdminClient(), { userId: user?.id, email: user?.email })
  } catch {
    return []
  }
}

// ─────────────────────────── Admin side ───────────────────────────

export type CouponInput = {
  code: string
  discount_type: CouponType
  discount_value: number
  min_order_amount: number
  usage_limit: number | null
  per_customer_limit: number | null
  is_public: boolean
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
}

function validateInput(input: CouponInput): { error: string } | { row: Record<string, unknown> } {
  const code = normalizeCouponCode(input.code || '')
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    return { error: 'Code must be 3–24 characters: letters, numbers, - or _ (no spaces).' }
  }
  if (input.discount_type !== 'percent' && input.discount_type !== 'flat') {
    return { error: 'Choose a discount type.' }
  }

  const value = Number(input.discount_value)
  if (!Number.isFinite(value) || value <= 0) return { error: 'Discount value must be greater than 0.' }
  if (input.discount_type === 'percent' && value > 100) return { error: 'A percentage discount cannot exceed 100%.' }

  const intOrNull = (n: number | null, label: string): number | null | { error: string } => {
    if (n == null || Number.isNaN(n)) return null
    if (!Number.isInteger(n) || n < 1) return { error: `${label} must be a whole number of 1 or more.` }
    return n
  }
  const usage = intOrNull(input.usage_limit, 'Total usage limit')
  if (usage && typeof usage === 'object') return usage
  const perCustomer = intOrNull(input.per_customer_limit, 'Per-customer limit')
  if (perCustomer && typeof perCustomer === 'object') return perCustomer

  const minOrder = Number(input.min_order_amount || 0)
  if (!Number.isFinite(minOrder) || minOrder < 0) return { error: 'Minimum order cannot be negative.' }

  const startsAt = input.starts_at ? new Date(input.starts_at) : null
  const expiresAt = input.expires_at ? new Date(input.expires_at) : null
  if ((startsAt && Number.isNaN(startsAt.getTime())) || (expiresAt && Number.isNaN(expiresAt.getTime()))) {
    return { error: 'Enter valid start / expiry dates.' }
  }
  if (startsAt && expiresAt && expiresAt <= startsAt) return { error: 'Expiry must be after the start date.' }

  return {
    row: {
      code,
      discount_type: input.discount_type,
      discount_value: value,
      min_order_amount: minOrder,
      usage_limit: usage,
      per_customer_limit: perCustomer,
      is_public: input.is_public !== false,
      starts_at: startsAt ? startsAt.toISOString() : null,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      is_active: !!input.is_active,
      updated_at: new Date().toISOString(),
    },
  }
}

function mapDbError(error: { code?: string; message: string }) {
  if (error.code === '23505') return 'A coupon with this code already exists.'
  if (error.code === '42P01' || /coupons/i.test(error.message) && /does not exist|schema cache/i.test(error.message)) {
    return MIGRATION_MISSING
  }
  return error.message
}

function revalidateCoupons() {
  revalidatePath('/admin/coupons')
  revalidatePath('/cart')
  revalidatePath('/checkout')
}

export async function createCoupon(input: CouponInput): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  const parsed = validateInput(input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  const admin = createAdminClient()
  let { error } = await admin.from('coupons').insert(parsed.row)
  if (error && /is_public/i.test(error.message)) {
    // is_public column not created yet (migration pending): save without it
    const { is_public: _omit, ...withoutPublic } = parsed.row
    void _omit
    ;({ error } = await admin.from('coupons').insert(withoutPublic))
  }
  if (error) return { success: false, error: mapDbError(error) }

  revalidateCoupons()
  return { success: true }
}

export async function updateCoupon(id: string, input: CouponInput): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  const parsed = validateInput(input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  const admin = createAdminClient()
  let { error } = await admin.from('coupons').update(parsed.row).eq('id', id)
  if (error && /is_public/i.test(error.message)) {
    // is_public column not created yet (migration pending): save without it
    const { is_public: _omit, ...withoutPublic } = parsed.row
    void _omit
    ;({ error } = await admin.from('coupons').update(withoutPublic).eq('id', id))
  }
  if (error) return { success: false, error: mapDbError(error) }

  revalidateCoupons()
  return { success: true }
}

export async function setCouponActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  const { error } = await createAdminClient()
    .from('coupons')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { success: false, error: mapDbError(error) }

  revalidateCoupons()
  return { success: true }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }
  const { error } = await createAdminClient().from('coupons').delete().eq('id', id)
  if (error) return { success: false, error: mapDbError(error) }

  revalidateCoupons()
  return { success: true }
}
