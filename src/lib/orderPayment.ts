// Server-only. Shared by the Razorpay verify action and the webhook so a payment
// is applied exactly once no matter which of them arrives first.

import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/brevo'

type AdminClient = ReturnType<typeof createAdminClient>

async function decrementVariantStock(admin: AdminClient, variantId: string, quantity: number) {
  // Optimistic compare-and-set so concurrent payments cannot overwrite each other
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: variant } = await admin
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .maybeSingle()
    if (!variant) return

    const next = Math.max(0, Number(variant.stock_quantity) - quantity)
    const { data: updated } = await admin
      .from('product_variants')
      .update({ stock_quantity: next, is_active: next > 0 })
      .eq('id', variantId)
      .eq('stock_quantity', variant.stock_quantity)
      .select('id')

    if (updated && updated.length > 0) return
  }
  console.error(`[orderPayment] Could not decrement stock for variant ${variantId}`)
}

async function sendPaidOrderEmail(admin: AdminClient, order: any) {
  const { data: orderItems } = await admin.from('order_items').select('*').eq('order_id', order.id)

  let customerEmail: string | undefined = order.shipping_address?.email
  let customerName: string = order.shipping_address?.full_name || 'Valued Customer'

  if (!customerEmail && order.user_id) {
    const { data: account } = await admin
      .from('users')
      .select('email, full_name')
      .eq('id', order.user_id)
      .maybeSingle()
    if (account?.email) {
      customerEmail = account.email
      customerName = account.full_name || customerName
    }
  }

  if (!customerEmail) return

  await sendOrderConfirmationEmail({
    orderNumber: order.order_number,
    customerName,
    customerEmail,
    customerPhone: order.shipping_address?.phone,
    shippingAddress: order.shipping_address || {
      address_line_1: '',
      city: '',
      state: '',
      postal_code: '',
    },
    items: (orderItems || []).map((item: any) => ({
      product_name: item.product_name,
      variant_name: item.variant_name,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      line_total: item.line_total,
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping_cost),
    totalAmount: Number(order.total_amount),
    paymentMethod: 'Online Payment (Razorpay)',
    paymentStatus: 'paid',
  })
}

/**
 * Marks an online order paid, only if it wasn't already. The status flip is the
 * single atomic gate: only the caller that wins it deducts stock, clears the
 * cart and sends the confirmation email. Stock is deducted from the order's own
 * saved items, never from client-supplied data.
 */
export async function markOrderPaid(admin: AdminClient, orderId: string, razorpayPaymentId: string) {
  const now = new Date().toISOString()

  const { data: updated, error } = await admin
    .from('orders')
    .update({
      payment_status: 'paid',
      order_status: 'processing',
      razorpay_payment_id: razorpayPaymentId,
      paid_at: now,
      updated_at: now,
    })
    .eq('id', orderId)
    .in('payment_status', ['pending', 'failed'])
    .select('*')

  if (error) return { applied: false, error: error.message }
  if (!updated || updated.length === 0) return { applied: false, alreadyPaid: true }

  const order = updated[0]

  const { data: items } = await admin
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId)

  for (const item of items || []) {
    if (item.variant_id) await decrementVariantStock(admin, item.variant_id, Number(item.quantity))
  }

  if (order.user_id) {
    await admin.from('cart_items').delete().eq('user_id', order.user_id)
  }

  try {
    await sendPaidOrderEmail(admin, order)
  } catch (emailErr) {
    // Never let an email problem break payment confirmation
    console.error('[orderPayment] Failed to send confirmation email:', emailErr)
  }

  return { applied: true }
}

export async function markOrderFailed(admin: AdminClient, orderId: string) {
  const { error } = await admin
    .from('orders')
    .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('payment_status', 'pending')

  return { error: error?.message }
}

export function expectedAmountPaise(totalAmount: number | string) {
  return Math.round(Number(totalAmount) * 100)
}
