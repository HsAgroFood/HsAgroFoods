// Client-safe (no server imports): public iThink tracking page for an AWB.
export function ithinkTrackingUrl(awb: string) {
  return `https://www.ithinklogistics.co.in/postship/tracking/${encodeURIComponent(awb)}`
}
