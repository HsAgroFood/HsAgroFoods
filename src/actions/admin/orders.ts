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

// ─────────────────────────── Delete an order ───────────────────────────

const isCodMethod = (method?: string | null) => /cash on delivery/i.test(method || '')

type DeletableOrder = {
  id: string
  order_number: string
  order_status: string
  payment_status: string
  payment_method: string | null
  total_amount: number | string
  awb_number: string | null
  shipment_status: string | null
  shipping_address: { full_name?: string } | null
  order_items: { product_name: string; variant_name: string; quantity: number; variant_id: string | null }[] | null
}

async function loadDeletableOrder(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data } = await admin
    .from('orders')
    .select('*, order_items (product_name, variant_name, quantity, variant_id)')
    .eq('id', orderId)
    .maybeSingle()
  return (data as DeletableOrder | null) ?? null
}

function describeDeletion(order: DeletableOrder) {
  // Stock is taken when a COD order is placed, or when an online order is paid.
  // (Cancelling does not give it back, so a cancelled order's stock is still "out".)
  const stockDeducted =
    isCodMethod(order.payment_method) || order.payment_status === 'paid' || order.payment_status === 'refunded'

  const hasActiveShipment =
    !!order.awb_number && order.shipment_status === 'created' && order.order_status !== 'cancelled'

  const items = order.order_items || []
  return {
    orderNumber: order.order_number,
    customerName: order.shipping_address?.full_name || 'Customer',
    total: Number(order.total_amount) || 0,
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method || '',
    paidOnline: order.payment_status === 'paid' && !isCodMethod(order.payment_method),
    itemCount: items.length,
    units: items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    stockDeducted,
    blockedReason: hasActiveShipment
      ? `This order has an active courier shipment (AWB ${order.awb_number}). Cancel the order first (that cancels the shipment), then delete it.`
      : null,
  }
}

export type OrderDeleteInfo = ReturnType<typeof describeDeletion>

/** Facts shown in the "Delete order?" confirmation. */
export async function getOrderDeleteInfo(
  orderId: string
): Promise<{ success: true; info: OrderDeleteInfo } | { success: false; error: string }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const order = await loadDeletableOrder(createAdminClient(), orderId)
  if (!order) return { success: false, error: 'Order not found.' }
  return { success: true, info: describeDeletion(order) }
}

async function giveStockBack(admin: ReturnType<typeof createAdminClient>, variantId: string, quantity: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: variant } = await admin
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .maybeSingle()
    if (!variant) return false // the variant itself no longer exists

    const current = Number(variant.stock_quantity) || 0
    const { data: updated } = await admin
      .from('product_variants')
      .update({ stock_quantity: current + quantity, ...(current <= 0 ? { is_active: true } : {}) })
      .eq('id', variantId)
      .eq('stock_quantity', variant.stock_quantity) // only if nobody changed it meanwhile
      .select('id')
    if (updated && updated.length > 0) return true
  }
  return false
}

/** Permanently deletes an order and its items. Optionally puts the sold packs back into stock. */
export async function deleteOrder(
  orderId: string,
  restoreStock: boolean
): Promise<{ success: boolean; error?: string; warning?: string; restoredUnits?: number }> {
  if (!(await isAdminAuthenticated())) return { success: false, error: UNAUTHORIZED_ERROR }

  const admin = createAdminClient()
  const order = await loadDeletableOrder(admin, orderId)
  if (!order) return { success: false, error: 'Order not found.' }

  const info = describeDeletion(order)
  if (info.blockedReason) return { success: false, error: info.blockedReason }

  const { error } = await admin.from('orders').delete().eq('id', orderId)
  if (error) {
    console.error('Failed to delete order:', error)
    return { success: false, error: error.message }
  }

  let restoredUnits = 0
  let failedUnits = 0
  if (restoreStock && info.stockDeducted) {
    for (const item of order.order_items || []) {
      if (!item.variant_id) continue
      const quantity = Number(item.quantity) || 0
      if (quantity < 1) continue
      if (await giveStockBack(admin, item.variant_id, quantity)) restoredUnits += quantity
      else failedUnits += quantity
    }
  }

  revalidateOrderConsumers(orderId)
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/shop')

  return {
    success: true,
    restoredUnits,
    ...(failedUnits > 0
      ? { warning: `The order was deleted, but ${failedUnits} pack(s) could not be added back to stock. Please adjust that product's stock by hand.` }
      : {}),
  }
}
