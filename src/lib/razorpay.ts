// Server-only. Shared Razorpay SDK instance (null when the keys are not configured).

import Razorpay from 'razorpay'

let instance: Razorpay | null = null

export function getRazorpay(): Razorpay | null {
  if (instance) return instance
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!keyId || !keySecret) return null
  instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  return instance
}

const METHOD_LABELS: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  emi: 'EMI',
}

/**
 * Asks Razorpay how a payment was made (UPI / card / netbanking / wallet). Never throws and
 * gives up after a few seconds, so a slow Razorpay can never block a page.
 */
export async function describeRazorpayMethod(paymentId: string): Promise<string | null> {
  const razorpay = getRazorpay()
  if (!razorpay) return null

  try {
    const payment: any = await Promise.race([
      razorpay.payments.fetch(paymentId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ])
    if (payment?.method === 'card' && payment?.card?.last4) {
      return `${payment.card.network || 'Card'} ending ${payment.card.last4}`
    }
    return METHOD_LABELS[payment?.method] || null
  } catch {
    return null
  }
}