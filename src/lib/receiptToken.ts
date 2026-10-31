// Server-only. A short-lived signed token that lets the browser which just paid see its own
// payment details on the "order placed" page, even for guests (who have no login). Without
// it, anyone who guessed an order number could read payment details.

import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'receipt-fallback-secret'
const TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

function sign(orderNumber: string, expiresAt: number) {
  return crypto.createHmac('sha256', SECRET).update(`${orderNumber}.${expiresAt}`).digest('hex')
}

export function createReceiptToken(orderNumber: string) {
  const expiresAt = Date.now() + TTL_MS
  return `${expiresAt}.${sign(orderNumber, expiresAt)}`
}

export function isValidReceiptToken(orderNumber: string, token: string | undefined | null) {
  if (!token) return false
  const [expiresRaw, signature] = token.split('.')
  const expiresAt = Number(expiresRaw)
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const expected = sign(orderNumber, expiresAt)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
