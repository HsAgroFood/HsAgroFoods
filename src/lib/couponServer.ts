import { createAdminClient } from '@/lib/supabase/admin'
import { REAL_ORDER_FILTER } from '@/lib/orderVisibility'
import { computeDiscount, normalizeCouponCode, type CouponRules } from '@/lib/coupons'

export const COUPON_COOKIE = 'applied_coupon'

type AdminClient = ReturnType<typeof createAdminClient>

export type CouponRow = CouponRules & {
  id: string
  usage_limit: number | null
  per_customer_limit: number | null
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
}

export type CouponCheck =
  | { ok: true; coupon: CouponRow; discount: number }
  | { ok: false; error: string }

const toNumber = (value: unknown) => Number(value) || 0

function toRow(raw: Record<string, unknown>): CouponRow {
  return {
    id: String(raw.id),
    code: String(raw.code),
    discount_type: raw.discount_type === 'flat' ? 'flat' : 'percent',
    discount_value: toNumber(raw.discount_value),
    min_order_amount: toNumber(raw.min_order_amount),
    usage_limit: raw.usage_limit == null ? null : toNumber(raw.usage_limit),
    per_customer_limit: raw.per_customer_limit == null ? null : toNumber(raw.per_customer_limit),
    starts_at: (raw.starts_at as string | null) ?? null,
    expires_at: (raw.expires_at as string | null) ?? null,
    is_active: raw.is_active !== false,
  }
}

export async function findCoupon(admin: AdminClient, rawCode: string): Promise<CouponRow | null> {
  const code = normalizeCouponCode(rawCode)
  if (!code) return null
  const { data, error } = await admin.from('coupons').select('*').eq('code', code).maybeSingle()
  if (error || !data) return null
  return toRow(data)
}

/** Orders that really redeemed this coupon: placed (COD) or paid, and not cancelled. */
async function countRedemptions(
  admin: AdminClient,
  code: string,
  who?: { userId?: string | null; email?: string | null }
): Promise<number> {
  const base = () =>
    admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_code', code)
      .neq('order_status', 'cancelled')
      .or(REAL_ORDER_FILTER)

  if (!who) {
    const { count } = await base()
    return count || 0
  }

  const counts: number[] = [0]
  if (who.userId) {
    const { count } = await base().eq('user_id', who.userId)
    counts.push(count || 0)
  }
  if (who.email) {
    const { count } = await base().ilike('shipping_address->>email', who.email)
    counts.push(count || 0)
  }
  return Math.max(...counts)
}

/**
 * Coupons the admin chose to suggest in the cart, still valid for this customer right now.
 * The minimum order is NOT checked here: the cart compares it with the live subtotal.
 */
export async function listPublicOffers(
  admin: AdminClient,
  who: { userId?: string | null; email?: string | null } = {}
): Promise<CouponRules[]> {
  const { data, error } = await admin.from('coupons').select('*').eq('is_active', true).eq('is_public', true)
  if (error || !data) return []

  const now = Date.now()
  const offers: CouponRules[] = []
  for (const raw of data) {
    const c = toRow(raw)
    if (c.starts_at && new Date(c.starts_at).getTime() > now) continue
    if (c.expires_at && new Date(c.expires_at).getTime() < now) continue
    if (c.usage_limit != null && (await countRedemptions(admin, c.code)) >= c.usage_limit) continue
    if (
      c.per_customer_limit != null &&
      (who.userId || who.email) &&
      (await countRedemptions(admin, c.code, who)) >= c.per_customer_limit
    ) {
      continue
    }
    offers.push({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
    })
  }
  return offers
}

/**
 * The single source of truth for "can this customer use this coupon on this cart right now?".
 * Used when the coupon is applied in the cart and again when the order is created.
 */
export async function checkCoupon(
  admin: AdminClient,
  rawCode: string,
  subtotal: number,
  who: { userId?: string | null; email?: string | null } = {}
): Promise<CouponCheck> {
  const coupon = await findCoupon(admin, rawCode)
  if (!coupon || !coupon.is_active) {
    return { ok: false, error: 'This coupon code is not valid.' }
  }

  const now = Date.now()
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { ok: false, error: 'This coupon is not active yet.' }
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { ok: false, error: 'This coupon has expired.' }
  }

  if (subtotal < coupon.min_order_amount) {
    const more = Math.ceil(coupon.min_order_amount - subtotal)
    return { ok: false, error: `Add ₹${more} more to use this coupon (minimum order ₹${coupon.min_order_amount}).` }
  }

  if (coupon.usage_limit != null) {
    const used = await countRedemptions(admin, coupon.code)
    if (used >= coupon.usage_limit) {
      return { ok: false, error: 'This coupon has reached its usage limit.' }
    }
  }

  if (coupon.per_customer_limit != null && (who.userId || who.email)) {
    const used = await countRedemptions(admin, coupon.code, who)
    if (used >= coupon.per_customer_limit) {
      return {
        ok: false,
        error:
          coupon.per_customer_limit === 1
            ? 'You have already used this coupon.'
            : 'You have already used this coupon the maximum number of times.',
      }
    }
  }

  const discount = computeDiscount(coupon, subtotal)
  if (discount <= 0) {
    return { ok: false, error: 'This coupon does not apply to your cart.' }
  }

  return { ok: true, coupon, discount }
}
