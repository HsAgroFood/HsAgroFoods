// Default parcel weight (kg) & size (cm) for a product variant. Mirrors the values the
// ithink_logistics migration pre-filled, so a newly created variant starts with the same
// sensible numbers. Admins can override them per variant in the product editor.

export type ParcelSpec = {
  weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
}

export const FALLBACK_PARCEL: ParcelSpec = { weight_kg: 0.25, length_cm: 15, width_cm: 12, height_cm: 4 }

const PARCEL_BY_PACK: { grams: number; spec: ParcelSpec }[] = [
  { grams: 100, spec: { weight_kg: 0.12, length_cm: 15, width_cm: 10, height_cm: 3 } },
  { grams: 250, spec: { weight_kg: 0.28, length_cm: 18, width_cm: 12, height_cm: 4 } },
  { grams: 500, spec: { weight_kg: 0.55, length_cm: 22, width_cm: 15, height_cm: 5 } },
  { grams: 1000, spec: { weight_kg: 1.08, length_cm: 25, width_cm: 18, height_cm: 7 } },
]

function packGrams(variantName: string): number | null {
  const match = variantName.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/)
  if (!match) return null
  const value = Number(match[1])
  return match[2] === 'kg' ? value * 1000 : value
}

export function defaultParcelFor(variantName: string): ParcelSpec {
  const grams = packGrams(variantName)
  if (grams === null) return FALLBACK_PARCEL

  const exact = PARCEL_BY_PACK.find((p) => p.grams === grams)
  if (exact) return exact.spec

  // Unlisted pack size: scale weight from the pack size and keep the nearest box
  const nearest = PARCEL_BY_PACK.reduce((best, p) =>
    Math.abs(p.grams - grams) < Math.abs(best.grams - grams) ? p : best
  )
  return { ...nearest.spec, weight_kg: Math.round((grams / 1000 + 0.02) * 1000) / 1000 }
}

type ShipmentLine = {
  quantity: number
  spec: ParcelSpec
}

// Combine several order lines into one parcel: weights add up, boxes are stacked flat
// (largest footprint, summed height). The admin can still edit the result before booking.
export function combineParcels(lines: ShipmentLine[]): ParcelSpec {
  if (lines.length === 0) return FALLBACK_PARCEL

  const total = lines.reduce(
    (acc, { quantity, spec }) => ({
      weight_kg: acc.weight_kg + spec.weight_kg * quantity,
      length_cm: Math.max(acc.length_cm, spec.length_cm),
      width_cm: Math.max(acc.width_cm, spec.width_cm),
      height_cm: acc.height_cm + spec.height_cm * quantity,
    }),
    { weight_kg: 0, length_cm: 0, width_cm: 0, height_cm: 0 }
  )

  const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places
  return {
    weight_kg: round(total.weight_kg, 3),
    length_cm: round(total.length_cm, 1),
    width_cm: round(total.width_cm, 1),
    height_cm: round(total.height_cm, 1),
  }
}
