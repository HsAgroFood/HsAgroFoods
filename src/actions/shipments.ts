'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { getEffectiveUser } from '@/lib/userAuth'
import { createIthinkShipment, trackIthinkShipment, type ShipmentTracking } from '@/lib/ithink'

export type CreateShipmentResult = { success: true; waybill: string } | { error: string }
export type TrackShipmentResult = { success: true; tracking: ShipmentTracking } | { error: string }

// Positive number within a sane range, as a string iThink accepts
function parseDimension(value: FormDataEntryValue | null, min: number, max: number): string | null {
  const n = Number(String(value ?? '').trim())
  return Number.isFinite(n) && n >= min && n <= max ? String(n) : null
}

function readParcel(formData: FormData) {
  const length = parseDimension(formData.get('length'), 1, 200)
  const width = parseDimension(formData.get('width'), 1, 200)
  const height = parseDimension(formData.get('height'), 1, 200)
  const weight = parseDimension(formData.get('weight'), 0.05, 100)
  if (!length || !width || !height || !weight) return null
  return { length, width, height, weight }
}

const PARCEL_ERROR = 'Enter a valid weight (0.05-100 kg) and length/width/height (1-200 cm).'

export async function createShipmentAction(orderId: string, formData: FormData): Promise<CreateShipmentResult> {
  if (!(await isAdminAuthenticated())) return { error: UNAUTHORIZED_ERROR }

  const parcel = readParcel(formData)
  if (!parcel) return { error: PARCEL_ERROR }

  try {
    const result = await createIthinkShipment(orderId, parcel)

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account/orders')

    switch (result.status) {
      case 'created':
        return { success: true, waybill: result.waybill }
      case 'already_created':
        return { error: 'A shipment already exists for this order.' }
      case 'already_processing':
        return { error: 'A shipment request for this order is already in progress. Try again in a moment.' }
      case 'not_configured':
        return { error: 'iThink Logistics API credentials are not configured on the server.' }
      case 'failed':
        return { error: result.error }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Shipment creation failed unexpectedly.' }
  }
}

// Tracking is looked up by ORDER, never by a caller-supplied AWB, so nobody can use our
// iThink credentials to query arbitrary shipments. Admins can track any order; customers
// only their own.
export async function trackOrderShipmentAction(orderId: string): Promise<TrackShipmentResult> {
  try {
    const admin = createAdminClient()
    const { data: order } = await admin
      .from('orders')
      .select('user_id, awb_number, shipping_address')
      .eq('id', orderId)
      .maybeSingle()

    if (!order?.awb_number) return { error: 'No shipment has been created for this order yet.' }

    if (!(await isAdminAuthenticated())) {
      const user = await getEffectiveUser()
      const ownerEmail = String(order.shipping_address?.email || '').trim().toLowerCase()
      const isOwner =
        !!user && (order.user_id === user.id || (!!ownerEmail && ownerEmail === user.email.trim().toLowerCase()))
      if (!isOwner) return { error: 'You do not have access to this shipment.' }
    }

    const tracking = await trackIthinkShipment(order.awb_number)
    return { success: true, tracking }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not fetch tracking details.' }
  }
}
