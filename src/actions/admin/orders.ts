'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'
import { cancelIthinkShipment, isIthinkConfigured } from '@/lib/ithink'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

function revalidateOrderConsumers(orderId: string) {
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/account/orders')
  revalidatePath('/account')
  revalidatePath('/', 'layout')
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    error.code === 'PGRST204' ||
    /column .* does not exist/i.test(error.message || '')
  )
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid order status.' }
  }

  const adminClient = createAdminClient()
  const now = new Date().toISOString()

  const { data: current } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle()

  if (!current) {
    return { success: false, error: 'Order not found.' }
  }

  // Cancelling an order that already has a courier booking: cancel it with iThink FIRST.
  // If iThink refuses (e.g. the parcel is already in transit) the order stays as it is, so we
  // never end up with a cancelled order whose parcel is still on its way to the customer.
  let cancelledWithIthink = false
  if (
    status === 'cancelled' &&
    current.order_status !== 'cancelled' &&
    current.awb_number &&
    current.shipment_status === 'created' &&
    isIthinkConfigured()
  ) {
    const cancelResult = await cancelIthinkShipment(current.awb_number)
    if (!cancelResult.ok) {
      return {
        success: false,
        error: `iThink did not cancel the shipment (${cancelResult.error}). The order was NOT cancelled.`
      }
    }
    cancelledWithIthink = true
  }

  const updateData: any = {
    order_status: status,
    updated_at: now,
  }

  if (status === 'shipped') {
    updateData.shipped_at = current?.shipped_at || now
    updateData.delivered_at = null
    updateData.cancelled_at = null
  } else if (status === 'delivered') {
    updateData.shipped_at = current?.shipped_at || now
    updateData.delivered_at = current?.delivered_at || now
    updateData.cancelled_at = null
  } else if (status === 'cancelled') {
    updateData.cancelled_at = now
    if (cancelledWithIthink) updateData.shipment_status = 'cancelled'
  } else {
    updateData.shipped_at = null
    updateData.delivered_at = null
    updateData.cancelled_at = null
  }

  let { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (isMissingColumnError(error)) {
    const retry = await adminClient
      .from('orders')
      .update({ order_status: status, updated_at: now })
      .eq('id', orderId)
    error = retry.error
  }

  if (error) {
    console.error('Failed to update order status:', error)
    return { success: false, error: error.message }
  }

  revalidateOrderConsumers(orderId)
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED_ERROR }
  }

  if (!PAYMENT_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid payment status.' }
  }

  const adminClient = createAdminClient()
  const now = new Date().toISOString()

  const { data: current } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle()

  if (!current) {
    return { success: false, error: 'Order not found.' }
  }

  const updateData: any = {
    payment_status: status,
    updated_at: now,
  }

  if (status === 'paid') {
    updateData.paid_at = current?.paid_at || now
  } else if (status !== 'paid') {
    updateData.paid_at = null
  }

  let { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (isMissingColumnError(error)) {
    const retry = await adminClient
      .from('orders')
      .update({ payment_status: status, updated_at: now })
      .eq('id', orderId)
    error = retry.error
  }

  if (error) {
    console.error('Failed to update payment status:', error)
    return { success: false, error: error.message }
  }

  revalidateOrderConsumers(orderId)
  return { success: true }
}
