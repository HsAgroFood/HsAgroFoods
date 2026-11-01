// Pure coupon helpers shared by the server (authoritative) and the cart/checkout UI (live preview).

export type CouponType = 'percent' | 'flat'

export type CouponRules = {
  code: string
  discount_type: CouponType
  discount_value: number
  min_order_amount: number
}

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

/** Discount for a cart subtotal. Never takes the items below ₹1 (payment gateways reject ₹0). */
export function computeDiscount(rules: CouponRules, subtotal: number): number {
  if (!(subtotal > 0) || subtotal < rules.min_order_amount) return 0

  let discount =
    rules.discount_type === 'percent' ? (subtotal * rules.discount_value) / 100 : rules.discount_value

  discount = Math.min(discount, Math.max(0, subtotal - 1))
  return Math.round(discount * 100) / 100
}

/** "10% off" / "₹50 off" */
export function describeCoupon(rules: CouponRules): string {
  if (rules.discount_type === 'percent') {
    return `${rules.discount_value}% off`
  }
  return `₹${rules.discount_value} off`
}

/** "10% off on orders of ₹100+" - the discount plus its minimum order, as shown to customers. */
export function describeCouponFull(rules: CouponRules): string {
  const base = describeCoupon(rules)
  return rules.min_order_amount > 0 ? `${base} on orders of ₹${rules.min_order_amount}+` : base
}
