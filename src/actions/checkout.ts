'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCart } from '@/actions/cart'
import { getShippingConfig } from '@/actions/shipping'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { sendOrderConfirmationEmail } from '@/lib/brevo'
import { markOrderPaid, markOrderFailed, expectedAmountPaise } from '@/lib/orderPayment'
import { createReceiptToken } from '@/lib/receiptToken'

type StockAdjustment = {
  variantId: string
  previousStock: number
}

async function rollbackPendingOrder(
  adminClient: ReturnType<typeof createAdminClient>,
  orderId: string,
  adjustments: StockAdjustment[] = []
) {
  for (const adjustment of adjustments) {
    await adminClient
      .from('product_variants')
      .update({
        stock_quantity: adjustment.previousStock,
        is_active: adjustment.previousStock > 0,
      })
      .eq('id', adjustment.variantId)
  }

  await adminClient.from('orders').delete().eq('id', orderId)
}

// Initialize Razorpay
let razorpayInstance: any = null
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch {
  console.warn('Razorpay credentials missing or invalid')
}

export type ShippingAddressInput = {
  full_name: string
  phone: string
  email?: string
  address_line_1: string
  address_line_2?: string | null
  city: string
  state: string
  postal_code: string
  country?: string
}

import { getEffectiveUser } from '@/lib/userAuth'

export async function createOrder(
  addressInput: string | ShippingAddressInput,
  paymentMethod: 'COD' | 'RAZORPAY'
) {
  try {
    if (paymentMethod !== 'COD' && paymentMethod !== 'RAZORPAY') {
      return { success: false, error: 'Invalid payment method.' }
    }

    const adminClient = createAdminClient()

    // 1. Check user authentication via JWT / direct DB session
    const user = await getEffectiveUser()

    // 2. Fetch cart items (works for both authenticated and guest users)
    const cartRes = await getCart()
    const items = cartRes.items || []

    if (items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items to proceed.' }
    }

    // 3. Resolve shipping address snapshot
    let shippingAddressSnapshot: any = null
    let addressId: string | null = null

    if (typeof addressInput === 'string') {
      // Saved address selected by ID
      addressId = addressInput
      if (!user) {
        return { success: false, error: 'Session expired. Please re-enter your address.' }
      }

      const { data: address } = await adminClient
        .from('addresses')
        .select('*')
        .eq('id', addressInput)
        .eq('user_id', user.id)
        .single()

      if (!address) {
        return { success: false, error: 'Invalid shipping address selected.' }
      }

      shippingAddressSnapshot = {
        full_name: address.full_name,
        phone: address.phone,
        email: user.email || '',
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || null,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || 'India',
      }
    } else {
      // Direct Address Form Input
      if (!addressInput.full_name || !addressInput.phone || !addressInput.address_line_1 || !addressInput.city || !addressInput.postal_code) {
        return { success: false, error: 'Please fill in all required shipping fields.' }
      }

      // 1. Full name validation: At least 3 letters, alphabetic & spaces only
      const trimmedName = (addressInput.full_name || '').trim()
      if (!/^[a-zA-Z\s.']{3,60}$/.test(trimmedName)) {
        return { 
          success: false, 
          error: 'Please enter a valid full name (at least 3 alphabetic characters, no numbers or special symbols).' 
        }
      }

      // 2. Indian mobile number validation: strictly 10 digits starting with 6, 7, 8, or 9
      const cleanPhone = (addressInput.phone || '').trim().replace(/\D/g, '')
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return { 
          success: false, 
          error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' 
        }
      }

      // 3. Street Address validation: Minimum 6 characters
      const trimmedAddress1 = (addressInput.address_line_1 || '').trim()
      if (trimmedAddress1.length < 6) {
        return { 
          success: false, 
          error: 'Please enter a complete street address (House/Flat No., Building & Street - minimum 6 characters).' 
        }
      }

      // 4. PIN code validation
      const cleanPin = (addressInput.postal_code || '').trim()
      if (!/^\d{6}$/.test(cleanPin)) {
        return { success: false, error: 'Please enter a valid 6-digit Indian PIN code.' }
      }

      shippingAddressSnapshot = {
        full_name: trimmedName,
        phone: cleanPhone,
        email: addressInput.email?.trim() || user?.email || '',
        address_line_1: trimmedAddress1,
        address_line_2: addressInput.address_line_2?.trim() || null,
        city: addressInput.city.trim(),
        state: addressInput.state.trim(),
        postal_code: cleanPin,
        country: addressInput.country || 'India',
      }

      // If user is logged in, optionally save this address for future 1-click checkout
      if (user) {
        try {
          const { data: savedAddr } = await adminClient
            .from('addresses')
            .insert([{
              user_id: user.id,
              full_name: shippingAddressSnapshot.full_name,
              phone: shippingAddressSnapshot.phone,
              address_line_1: shippingAddressSnapshot.address_line_1,
              address_line_2: shippingAddressSnapshot.address_line_2,
              city: shippingAddressSnapshot.city,
              state: shippingAddressSnapshot.state,
              postal_code: shippingAddressSnapshot.postal_code,
              country: 'India',
              is_default: false,
            }])
            .select('id')
            .single()

          if (savedAddr) {
            addressId = savedAddr.id
          }
        } catch (e) {
          console.warn('Could not auto-save address for user:', e)
        }
      }
    }

    // 4. Determine user_id to assign to order
    let targetUserId: string | null = null
    const checkoutEmail = shippingAddressSnapshot.email?.trim().toLowerCase()

    // A) If current logged-in user matches the checkout email, attach to current user
    if (user && user.email?.trim().toLowerCase() === checkoutEmail) {
      targetUserId = user.id
    } else if (checkoutEmail) {
      // B) If customer entered an email, check if an existing profile exists for that email
      const { data: matchedProfile } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('email', checkoutEmail)
        .maybeSingle()

      if (matchedProfile) {
        targetUserId = matchedProfile.id
      }
    }

    // C) If still not assigned and an authenticated user session is active
    if (!targetUserId && user?.id) {
      targetUserId = user.id
    }

    // 5. Verify stock availability and calculate totals securely
    let subtotal = 0
    const orderItemsToInsert: any[] = []

    for (const item of items) {
      const variant: any = item.product_variants
      if (!variant) {
        return { success: false, error: 'One or more cart items are no longer available.' }
      }

      const product = Array.isArray(variant.products) ? variant.products[0] : variant.products
      const currentStock = Number(variant.stock_quantity ?? 0)
      const requestedQty = Number(item.quantity || 1)

      if (!Number.isInteger(requestedQty) || requestedQty < 1) {
        return { success: false, error: 'Cart quantities must be positive whole numbers.' }
      }

      // Stock check: Prevent overselling
      if (currentStock < requestedQty) {
        return {
          success: false,
          error: currentStock === 0
            ? `Sorry, "${product?.name || 'Product'} (${variant.variant_name})" is currently out of stock.`
            : `Only ${currentStock} unit(s) remaining for "${product?.name || 'Product'} (${variant.variant_name})". Please update your cart.`
        }
      }

      const price = Number(variant.price || 0)
      const lineTotal = price * requestedQty

      subtotal += lineTotal

      orderItemsToInsert.push({
        product_id: product?.id || variant.product_id,
        variant_id: variant.id,
        product_name: product?.name || 'Spice Product',
        variant_name: variant.variant_name || 'Standard Pack',
        price_at_purchase: price,
        quantity: requestedQty,
        line_total: lineTotal,
      })
    }

    if (orderItemsToInsert.length === 0) {
      return { success: false, error: 'Your cart contains no purchasable items.' }
    }

    const shippingConfig = await getShippingConfig()
    const shipping_cost = subtotal >= shippingConfig.free_shipping_threshold ? 0 : shippingConfig.standard_shipping_cost
    const total_amount = subtotal + shipping_cost

    // Generate readable order number
    const order_number = `AS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    const actualPaymentMethod = paymentMethod === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'

    // 6. Insert Order via Admin Client to prevent any RLS issues
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert([{
        order_number,
        user_id: targetUserId,
        address_id: addressId,
        shipping_address: shippingAddressSnapshot,
        subtotal,
        shipping_cost,
        total_amount,
        payment_status: 'pending',
        order_status: 'pending',
        payment_method: actualPaymentMethod,
      }])
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      return { success: false, error: orderError?.message || 'Failed to place order. Please try again.' }
    }

    // 7. Insert Order Items
    const itemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(itemsWithOrderId)

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError)
      await adminClient.from('orders').delete().eq('id', order.id)
      return { success: false, error: 'Order item processing failed. Please contact support.' }
    }

    // 8. Auto-Deduct Inventory Stock (COD only). Online orders reserve nothing
    // until the payment is confirmed, so abandoned/failed payments never hold stock;
    // markOrderPaid deducts it once Razorpay confirms the payment.
    const stockAdjustments: StockAdjustment[] = []
    for (const item of paymentMethod === 'COD' ? items : []) {
      const variant: any = item.product_variants
      if (!variant?.id) continue

      const currentStock = Number(variant.stock_quantity ?? 0)
      const purchasedQty = Number(item.quantity || 1)
      const newStock = Math.max(0, currentStock - purchasedQty)

      const { error: inventoryError } = await adminClient
        .from('product_variants')
        .update({
          stock_quantity: newStock,
          is_active: newStock > 0,
        })
        .eq('id', variant.id)

      if (inventoryError) {
        await rollbackPendingOrder(adminClient, order.id, stockAdjustments)
        return { success: false, error: 'Inventory could not be updated. Please try again.' }
      }

      stockAdjustments.push({
        variantId: variant.id,
        previousStock: currentStock,
      })
    }

    revalidatePath('/shop')
    revalidatePath('/cart')
    revalidatePath('/admin/products')

    // 8. Handle Payment Method Specific Logic
    if (paymentMethod === 'RAZORPAY') {
      if (!razorpayInstance) {
        await rollbackPendingOrder(adminClient, order.id, stockAdjustments)
        return { 
          success: false, 
          error: 'Online Payment Gateway is currently under maintenance. Please select Cash on Delivery (COD) to place your order!' 
        }
      }

      try {
        const options = {
          amount: Math.round(total_amount * 100),
          currency: 'INR',
          receipt: order.id,
          payment_capture: 1,
        }

        const rzpOrder = await razorpayInstance.orders.create(options)

        // Save razorpay_order_id immediately so webhook and callbacks can match it reliably
        await adminClient
          .from('orders')
          .update({ razorpay_order_id: rzpOrder.id })
          .eq('id', order.id)

        return {
          success: true,
          isRazorpay: true,
          razorpayOrderId: rzpOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          orderId: order.id,
          orderNumber: order.order_number,
          amount: options.amount,
        }
      } catch (err: any) {
        console.error('Razorpay Error:', err)
        await rollbackPendingOrder(adminClient, order.id, stockAdjustments)
        return { 
          success: false, 
          error: 'Online payment could not be initialized. Please choose Cash on Delivery (COD).' 
        }
      }
    }

    // 9. COD Flow: Clear cart
    // Clear user cart if authenticated
    if (user) {
      await adminClient
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
    }

    // Clear guest cart cookie
    try {
      const cookieStore = await cookies()
      cookieStore.delete('guest_cart')
    } catch (e) {
      console.warn('Could not clear guest cart cookie:', e)
    }

    // 10. Send Brevo Confirmation Email for COD Order
    const recipientEmail = shippingAddressSnapshot?.email || user?.email
    if (recipientEmail) {
      try {
        await sendOrderConfirmationEmail({
          orderNumber: order.order_number,
          customerName: shippingAddressSnapshot?.full_name || 'Valued Customer',
          customerEmail: recipientEmail,
          customerPhone: shippingAddressSnapshot?.phone,
          shippingAddress: shippingAddressSnapshot || {
            address_line_1: '',
            city: '',
            state: '',
            postal_code: '',
          },
          items: orderItemsToInsert.map(item => ({
            product_name: item.product_name,
            variant_name: item.variant_name,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            line_total: item.line_total,
          })),
          subtotal,
          shippingCost: shipping_cost,
          totalAmount: total_amount,
          paymentMethod: 'Cash on Delivery (COD)',
          paymentStatus: 'pending',
        })
      } catch (emailErr) {
        console.error('Failed to send COD confirmation email:', emailErr)
      }
    }

    revalidatePath('/cart')
    revalidatePath('/checkout')
    revalidatePath('/account/orders')
    revalidatePath('/admin/orders')

    return {
      success: true,
      isRazorpay: false,
      order_number: order.order_number,
      orderId: order.id,
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return { success: false, error: error.message || 'Something went wrong while placing your order.' }
  }
}

export async function verifyRazorpayPayment(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  internal_order_id: string
) {
  const failure = { success: false, error: 'Payment verification failed. If money was deducted, your order will be confirmed automatically.' }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) return { success: false, error: 'Razorpay secret not configured' }

    if (
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      typeof internal_order_id !== 'string'
    ) {
      return failure
    }

    // 1. Signature proves Razorpay issued this payment for this Razorpay order
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const sigBuf = Buffer.from(razorpay_signature, 'utf8')
    const expBuf = Buffer.from(expected, 'utf8')
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return failure
    }

    // 2. The Razorpay order must be the one we created for THIS internal order.
    //    (Stops a valid payment for a cheap order being replayed against another.)
    const adminClient = createAdminClient()
    const { data: order } = await adminClient
      .from('orders')
      .select('id, order_number, total_amount, razorpay_order_id')
      .eq('id', internal_order_id)
      .maybeSingle()

    if (!order || order.razorpay_order_id !== razorpay_order_id) {
      return failure
    }

    // 3. Confirm with Razorpay itself that the payment belongs to this order,
    //    was for the full amount, and actually succeeded.
    if (!razorpayInstance) return failure
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id).catch(() => null)

    if (
      !payment ||
      payment.order_id !== razorpay_order_id ||
      payment.currency !== 'INR' ||
      Number(payment.amount) !== expectedAmountPaise(order.total_amount) ||
      !['captured', 'authorized'].includes(payment.status)
    ) {
      return failure
    }

    // 4. Apply exactly once (the webhook may race us; only one wins)
    const result = await markOrderPaid(adminClient, order.id, razorpay_payment_id)
    if (result.error) {
      console.error('Failed to update order status:', result.error)
      return { success: false, error: 'Failed to update order payment status' }
    }

    // Clear the buyer's cart
    const user = await getEffectiveUser()
    if (user) {
      await adminClient.from('cart_items').delete().eq('user_id', user.id)
    }

    const cookieStore = await cookies()
    cookieStore.delete('guest_cart')

    revalidatePath('/shop')
    revalidatePath('/cart')
    revalidatePath('/checkout')
    revalidatePath('/account/orders')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/products')

    // Lets this browser (even a guest) see its own payment details on the success page
    return { success: true, receiptToken: createReceiptToken(order.order_number) }
  } catch (err: any) {
    console.error('Payment verification error:', err)
    return failure
  }
}

/**
 * Called by the browser when Razorpay reports that a payment attempt FAILED (card declined,
 * UPI failure, ...). Marks the order "failed" straight away instead of waiting for the webhook.
 * Needs both ids of the same order, only ever moves pending -> failed, and a later successful
 * payment still turns the order to paid.
 */
export async function reportPaymentFailure(internal_order_id: string, razorpay_order_id: string) {
  try {
    if (typeof internal_order_id !== 'string' || typeof razorpay_order_id !== 'string') return { success: false }

    const adminClient = createAdminClient()
    const { data: order } = await adminClient
      .from('orders')
      .select('id, razorpay_order_id')
      .eq('id', internal_order_id)
      .maybeSingle()

    if (!order || order.razorpay_order_id !== razorpay_order_id) return { success: false }

    const { error } = await markOrderFailed(adminClient, order.id)
    if (error) return { success: false }

    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('reportPaymentFailure error:', err)
    return { success: false }
  }
}