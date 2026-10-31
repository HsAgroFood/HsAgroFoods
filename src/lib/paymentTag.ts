// Client-safe. The label shown next to an order's payment so the admin can tell apart:
//  - paid / refunded
//  - COD orders (payment is collected on delivery, "pending" is normal)
//  - online orders where the customer never completed the payment
//  - online orders whose payment attempt failed

type PaymentLike = { payment_method?: string | null; payment_status: string }

export function isOnlineOrder(order: Pick<PaymentLike, 'payment_method'>) {
  return !/cash on delivery/i.test(order.payment_method || '')
}

export function paymentTag(order: PaymentLike): { label: string; tone: 'green' | 'red' | 'amber' | 'stone' } {
  if (order.payment_status === 'paid') return { label: 'PAID', tone: 'green' }
  if (order.payment_status === 'failed') return { label: 'PAYMENT FAILED', tone: 'red' }
  if (order.payment_status === 'refunded') return { label: 'REFUNDED', tone: 'stone' }
  if (isOnlineOrder(order) && order.payment_status === 'pending') {
    return { label: 'PAYMENT NOT COMPLETED', tone: 'amber' }
  }
  return { label: order.payment_status.toUpperCase(), tone: 'amber' }
}

export const PAYMENT_TAG_CLASSES: Record<'green' | 'red' | 'amber' | 'stone', string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-orange-50 text-orange-700 border-orange-200',
  stone: 'bg-stone-100 text-stone-700 border-stone-200',
}
