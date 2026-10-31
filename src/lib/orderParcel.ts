// Server-only. Works out the default parcel weight/size for an order from the
// per-variant values the admin maintains in the product editor.

import { createAdminClient } from '@/lib/supabase/admin'
import { combineParcels, defaultParcelFor, type ParcelSpec } from '@/lib/shippingDefaults'

export async function getOrderParcel(orderId: string): Promise<ParcelSpec> {
  const admin = createAdminClient()

  const { data: items } = await admin
    .from('order_items')
    .select('variant_id, variant_name, quantity')
    .eq('order_id', orderId)

  const variantIds = (items || []).map((i) => i.variant_id).filter(Boolean) as string[]
  const { data: variants } = variantIds.length
    ? await admin
        .from('product_variants')
        .select('id, weight_kg, length_cm, width_cm, height_cm')
        .in('id', variantIds)
    : { data: [] as any[] }

  const byId = new Map((variants || []).map((v: any) => [v.id, v]))

  return combineParcels(
    (items || []).map((item) => {
      const variant: any = item.variant_id ? byId.get(item.variant_id) : null
      const spec: ParcelSpec = variant
        ? {
            weight_kg: Number(variant.weight_kg),
            length_cm: Number(variant.length_cm),
            width_cm: Number(variant.width_cm),
            height_cm: Number(variant.height_cm),
          }
        : defaultParcelFor(item.variant_name || '') // variant was deleted since the order
      return { quantity: Number(item.quantity) || 1, spec }
    })
  )
}
