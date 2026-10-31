// Server-only. iThink Logistics integration: shipment booking, tracking
// and syncing order status from live tracking.

import { createAdminClient } from '@/lib/supabase/admin'

const ORDER_ADD_URL = 'https://my.ithinklogistics.com/api_v3/order/add.json'
const TRACK_URL = 'https://api.ithinklogistics.com/api_v3/order/track.json'

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-cache' }

type Credentials = { accessToken: string; secretKey: string }

function getCredentials(): Credentials | null {
  const accessToken = process.env.ITHINK_ACCESS_TOKEN?.trim()
  const secretKey = process.env.ITHINK_SECRET_KEY?.trim()
  return accessToken && secretKey ? { accessToken, secretKey } : null
}

function getConfig() {
  const credentials = getCredentials()
  const pickupAddressId = process.env.ITHINK_PICKUP_ADDRESS_ID?.trim()
  if (!credentials || !pickupAddressId) return null
  return { ...credentials, pickupAddressId }
}

export function isIthinkConfigured() {
  return getConfig() !== null
}

const NOT_CONFIGURED = 'iThink Logistics API credentials are not configured on the server.'

async function postJson(url: string, data: Record<string, unknown>, timeoutMs = 15000) {
  const response = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ data }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const raw = await response.text()
  let result: unknown
  try {
    result = JSON.parse(raw)
  } catch {
    result = { raw }
  }
  return { response, result }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function formatDate(date = new Date()) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
}

// iThink only accepts ASCII in names/addresses on its labels
function asciiSafe(value: string, fallback: string): string {
  const stripped = value.replace(/[^\x20-\x7E]/g, '').trim()
  return stripped || fallback
}

function extractString(value: unknown, keys: string[]): string | null {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = extractString(child, keys)
      if (found) return found
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  for (const key of keys) {
    if (typeof record[key] === 'string' && record[key]) return record[key] as string
  }
  for (const child of Object.values(record)) {
    const found = extractString(child, keys)
    if (found) return found
  }
  return null
}

function extractWaybill(value: unknown): string | null {
  const direct = extractString(value, ['waybill', 'awb_number'])
  if (direct) return direct
  const list = extractString(value, ['awb_numbers'])
  return list ? list.split(',')[0].trim() : null
}

export function isCodPayment(paymentMethod: string | null | undefined) {
  return /cash on delivery|\bcod\b/i.test(paymentMethod || '')
}

// ── Look up / cancel an existing shipment ────────────────────────────────
const ORDER_DETAILS_URL = 'https://my.ithinklogistics.com/api_v3/order/get_details.json'
const ORDER_CANCEL_URL = 'https://my.ithinklogistics.com/api_v3/order/cancel.json'

const AWB_KEYS = ['waybill', 'awb_no', 'awb_number', 'awb', 'airwaybill']
const REFERENCE_KEYS = ['refnum', 'order_reference', 'reference_number', 'order_no', 'order_id', 'order']
const COURIER_KEYS = ['logistic_name', 'logistic', 'courier_name', 'courier']

function firstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim()
      if (text && !['none', 'null', '0'].includes(text.toLowerCase())) return text
    }
  }
  return null
}

// Every object in the response (at any depth) that looks like a shipment record
function collectRecords(value: unknown, out: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    value.forEach((child) => collectRecords(child, out))
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if ([...AWB_KEYS, ...REFERENCE_KEYS].some((key) => key in record)) out.push(record)
    Object.values(record).forEach((child) => collectRecords(child, out))
  }
  return out
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/**
 * Asks iThink whether it already holds a booking for this order reference and, if so,
 * returns its AWB. Used to recover from a booking iThink created but whose response we
 * never saw (timeout, crash, "duplicate order", missing waybill). Never throws: a failed
 * lookup just means "nothing recovered".
 */
async function findExistingShipment(
  orderNumber: string,
  createdAt: string | null | undefined
): Promise<{ awb: string; courier: string | null; raw: unknown } | null> {
  const credentials = getCredentials()
  if (!credentials) return null

  const created = createdAt ? new Date(createdAt) : new Date()
  const start = new Date(created.getTime() - 24 * 3600 * 1000)
  const end = new Date(Math.max(created.getTime(), Date.now()) + 24 * 3600 * 1000)

  // Read-only lookup, so a couple of retries are safe (booking itself is never retried)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { response, result } = await postJson(
        ORDER_DETAILS_URL,
        {
          awb_number_list: '',
          order_no: orderNumber,
          start_date: isoDay(start),
          end_date: isoDay(end),
          access_token: credentials.accessToken,
          secret_key: credentials.secretKey,
        },
        12000
      )
      if (!response.ok) continue

      // Strict match on our own reference so a different order's AWB is never adopted
      const match = collectRecords(asRecord(result).data ?? result).find(
        (record) => firstString(record, REFERENCE_KEYS) === orderNumber && firstString(record, AWB_KEYS)
      )
      if (!match) return null

      return { awb: firstString(match, AWB_KEYS) as string, courier: firstString(match, COURIER_KEYS), raw: result }
    } catch {
      // network hiccup: try once more, then give up quietly
    }
  }
  return null
}

export type CancelShipmentOutcome = { ok: true; alreadyGone?: boolean } | { ok: false; error: string }

/** Cancels the shipment with iThink. Treats "not found / already cancelled" as success. */
export async function cancelIthinkShipment(awb: string): Promise<CancelShipmentOutcome> {
  const credentials = getCredentials()
  if (!credentials) return { ok: false, error: NOT_CONFIGURED }

  try {
    const { response, result } = await postJson(ORDER_CANCEL_URL, {
      awb_numbers: awb,
      access_token: credentials.accessToken,
      secret_key: credentials.secretKey,
    })

    const record = asRecord(result)

    // iThink returns the per-AWB outcome either as a list or keyed by AWB, and the top-level
    // status says "success" even when this AWB was refused, so the per-AWB entry decides.
    const data = record.data
    const entries: Record<string, unknown>[] = Array.isArray(data)
      ? data.map(asRecord)
      : Object.entries(asRecord(data)).map(([key, value]) => ({ waybill: key, ...asRecord(value) }))
    const perAwb = entries.find((entry) => String(entry.waybill ?? entry.awb ?? '') === awb) ?? entries[0] ?? {}

    const message = String(
      perAwb.remark || perAwb.message || record.html_message || record.message || ''
    ).trim()

    const failed =
      !response.ok || record.status === 'error' || String(perAwb.status || '').toLowerCase() === 'error'

    if (!failed) return { ok: true }

    // The shipment no longer exists on iThink's side (or was cancelled already): nothing to undo
    if (/no airway bill|not found|already cancel|invalid awb/i.test(message)) return { ok: true, alreadyGone: true }

    return { ok: false, error: message || `iThink returned HTTP ${response.status}` }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not reach iThink.' }
  }
}

// ── Create shipment ──────────────────────────────────────────────────────
export interface ShipmentOverrides {
  length?: string
  width?: string
  height?: string
  weight?: string
}

export type CreateShipmentOutcome =
  | { status: 'created'; waybill: string }
  | { status: 'already_created' | 'already_processing' | 'not_configured' }
  | { status: 'failed'; error: string }

// A booking stuck in "processing" this long means the server died mid-request
const STUCK_PROCESSING_MS = 5 * 60 * 1000

export async function createIthinkShipment(
  orderId: string,
  overrides: ShipmentOverrides = {}
): Promise<CreateShipmentOutcome> {
  const config = getConfig()
  if (!config) return { status: 'not_configured' }

  const admin = createAdminClient()
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, order_number, created_at, total_amount, shipping_cost, payment_method, payment_status, order_status, shipping_address, shipment_status')
    .eq('id', orderId)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order) return { status: 'failed', error: 'Order not found.' }

  if (order.shipment_status === 'created') return { status: 'already_created' }
  if (order.order_status === 'cancelled') return { status: 'failed', error: 'This order is cancelled.' }
  if (!isCodPayment(order.payment_method) && order.payment_status !== 'paid') {
    return { status: 'failed', error: 'This online order is not paid yet. Ship it only after the payment is confirmed.' }
  }

  const address = asRecord(order.shipping_address)
  const addressLine1 = String(address.address_line_1 || '').trim()
  const addressLine2 = String(address.address_line_2 || '').trim()
  if (`${addressLine1}${addressLine2}`.replace(/\s/g, '').length < 10) {
    return { status: 'failed', error: 'The delivery address is too short (iThink needs at least 10 characters).' }
  }

  // Claim the order so two admins cannot book it twice. Retries restart from "failed", and a
  // booking stuck in "processing" (server died mid-request) can be taken over after a few minutes.
  const stuckBefore = new Date(Date.now() - STUCK_PROCESSING_MS).toISOString()
  const { data: claimed, error: claimError } = await admin
    .from('orders')
    .update({ shipment_status: 'processing', shipment_error: null })
    .eq('id', orderId)
    .or(`shipment_status.is.null,shipment_status.in.(pending,failed),and(shipment_status.eq.processing,updated_at.lt.${stuckBefore})`)
    .select('id')
    .maybeSingle()
  if (claimError) throw claimError
  if (!claimed) return { status: 'already_processing' }

  const fail = async (message: string): Promise<CreateShipmentOutcome> => {
    await admin.from('orders').update({ shipment_status: 'failed', shipment_error: message }).eq('id', orderId)
    console.error('iThink shipment creation failed', { orderId, message })
    return { status: 'failed', error: message }
  }

  try {
    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('product_name, variant_id, variant_name, quantity, price_at_purchase')
      .eq('order_id', orderId)
    if (itemsError) throw itemsError
    if (!items?.length) return await fail('Order has no items to ship.')

    const dims = {
      length: overrides.length || '15',
      width: overrides.width || '10',
      height: overrides.height || '5',
      weight: overrides.weight || '0.5',
    }

    const saveCreated = async (waybill: string, courier: string | null, raw: unknown): Promise<CreateShipmentOutcome> => {
      const { error: updateError } = await admin
        .from('orders')
        .update({
          shipment_status: 'created',
          shipment_id: order.order_number,
          awb_number: waybill,
          courier_name: courier,
          shipment_response: raw,
          shipment_error: null,
          shipment_weight_kg: Number(dims.weight),
          shipment_length_cm: Number(dims.length),
          shipment_width_cm: Number(dims.width),
          shipment_height_cm: Number(dims.height),
          shipment_created_at: new Date().toISOString(),
          // Booking a courier means the parcel is being packed
          order_status: order.order_status === 'pending' ? 'processing' : order.order_status,
        })
        .eq('id', orderId)
      if (updateError) throw updateError
      return { status: 'created', waybill }
    }

    // A previous attempt may have reached iThink even though we never saw the reply.
    // Adopt that booking instead of creating a duplicate.
    if (order.shipment_status === 'failed' || order.shipment_status === 'processing') {
      const existing = await findExistingShipment(order.order_number, order.created_at)
      if (existing) return await saveCreated(existing.awb, existing.courier, existing.raw)
    }

    const isCod = isCodPayment(order.payment_method)
    const total = Number(order.total_amount)
    const shippingCharge = Number(order.shipping_cost ?? 0)
    // iThink recalculates total_amount itself as (sum of product price x qty) + shipping_charges
    // and rejects the shipment if ours differs, so build it the same way.
    const merchandise = items.reduce((sum, item) => sum + Number(item.price_at_purchase) * Number(item.quantity), 0)

    const shipment = {
      waybill: '',
      order: order.order_number,
      sub_order: '',
      order_date: formatDate(),
      // Merchandise + shipping_charges; the amount to collect on delivery goes in cod_amount
      total_amount: (merchandise + shippingCharge).toFixed(2),
      name: asciiSafe(String(address.full_name || ''), 'Customer'),
      company_name: '',
      add: asciiSafe(addressLine1, ''),
      add2: asciiSafe(addressLine2, ''),
      add3: '',
      pin: String(address.postal_code || ''),
      city: asciiSafe(String(address.city || ''), ''),
      state: asciiSafe(String(address.state || ''), ''),
      country: 'India',
      phone: String(address.phone || '').replace(/\D/g, '').slice(-10),
      alt_phone: '',
      email: String(address.email || ''),
      products: items.map((item, idx) => ({
        product_name: asciiSafe(`${item.product_name} ${item.variant_name || ''}`.trim(), `Spice Product ${idx + 1}`),
        product_sku: String(item.variant_id || `item-${idx + 1}`),
        product_quantity: String(item.quantity),
        product_price: Number(item.price_at_purchase).toFixed(2),
        product_tax_rate: '',
        product_hsn_code: '',
        product_discount: '0',
      })),
      shipment_length: dims.length,
      shipment_width: dims.width,
      shipment_height: dims.height,
      weight: dims.weight,
      shipping_charges: shippingCharge.toFixed(2),
      giftwrap_charges: '0',
      transaction_charges: '0',
      total_discount: '0',
      first_attemp_discount: '0',
      cod_amount: isCod ? total.toFixed(2) : '0',
      payment_mode: isCod ? 'COD' : 'Prepaid',
      reseller_name: '',
      eway_bill_number: '',
      gst_number: '',
      return_address_id: config.pickupAddressId,
      is_billing_same_as_shipping: 'yes',
    }

    // No courier is forced: iThink assigns one using the Courier Priority configured in its dashboard.
    const requestData: Record<string, unknown> = {
      shipments: [shipment],
      pickup_address_id: config.pickupAddressId,
      access_token: config.accessToken,
      secret_key: config.secretKey,
      s_type: 'surface',
    }

    // Booking is never retried blindly; if anything about the reply is unusable we fall
    // through to the recovery lookup below before reporting a failure.
    let bookingError: string | null = null
    let booked: { waybill: string; courier: string | null; raw: unknown } | null = null

    try {
      const { response, result } = await postJson(ORDER_ADD_URL, requestData)
      const record = asRecord(result)
      // The batch can report "success" while the individual shipment still failed validation
      const firstShipmentResult = asRecord(Object.values(asRecord(record.data))[0])

      if (!response.ok) {
        bookingError = `iThink returned HTTP ${response.status}`
      } else if (record.status === 'error') {
        bookingError = typeof record.html_message === 'string' ? record.html_message : 'iThink rejected the shipment'
      } else if (firstShipmentResult.status === 'error') {
        bookingError = typeof firstShipmentResult.remark === 'string' ? firstShipmentResult.remark : 'iThink rejected this shipment'
      } else {
        const waybill = extractWaybill(result)
        if (waybill) booked = { waybill, courier: extractString(result, ['logistic', 'logistic_name']), raw: result }
        else bookingError = `iThink accepted the request but returned no waybill. Response: ${JSON.stringify(result).slice(0, 300)}`
      }
    } catch (error) {
      // Timeout or network drop: the booking may still have gone through on iThink's side
      bookingError = error instanceof Error ? error.message : 'Could not reach iThink.'
    }

    if (booked) return await saveCreated(booked.waybill, booked.courier, booked.raw)

    const recovered = await findExistingShipment(order.order_number, order.created_at)
    if (recovered) return await saveCreated(recovered.awb, recovered.courier, recovered.raw)

    return await fail(bookingError || 'iThink shipment creation failed')
  } catch (error) {
    return await fail(error instanceof Error ? error.message : 'iThink shipment creation failed')
  }
}

// ── Tracking ─────────────────────────────────────────────────────────────
export interface ShipmentScan {
  status: string
  location: string
  dateTime: string
  remark?: string
}

export interface ShipmentTracking {
  awb: string
  courier: string | null
  currentStatus: string
  expectedDeliveryDate: string | null
  lastLocation: string | null
  lastUpdate: string | null
  history: ShipmentScan[]
}

export async function trackIthinkShipment(awb: string): Promise<ShipmentTracking> {
  const credentials = getCredentials()
  if (!credentials) throw new Error(NOT_CONFIGURED)

  const { response, result } = await postJson(TRACK_URL, {
    awb_number_list: awb,
    access_token: credentials.accessToken,
    secret_key: credentials.secretKey,
  })
  if (!response.ok) throw new Error(`iThink returned HTTP ${response.status}`)

  const entry = asRecord(asRecord(asRecord(result).data)[awb])
  if (Object.keys(entry).length === 0) {
    throw new Error('No tracking data yet. It can take a little while after the courier picks up the parcel.')
  }
  if (entry.message && entry.message !== 'success') {
    throw new Error(typeof entry.message === 'string' ? entry.message : 'iThink could not find this shipment.')
  }

  const lastScan = asRecord(entry.last_scan_details)
  const scans = Array.isArray(entry.scan_details) ? (entry.scan_details as Record<string, unknown>[]) : []
  const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

  const lastLocation = str(lastScan.scan_location)

  return {
    awb,
    courier: typeof entry.logistic === 'string' ? entry.logistic : null,
    currentStatus: str(entry.current_status) || 'Unknown',
    // iThink sends "0000-00-00" until the courier sets a date
    expectedDeliveryDate:
      typeof entry.expected_delivery_date === 'string' && /[1-9]/.test(entry.expected_delivery_date)
        ? entry.expected_delivery_date
        : null,
    lastLocation: lastLocation && lastLocation.toUpperCase() !== 'NA' ? lastLocation : null,
    lastUpdate: str(lastScan.status_date_time) || null,
    history: scans
      .map((scan) => {
        const code = str(scan.status_code)
        const location = str(scan.status_location) || str(scan.scan_location)
        return {
          status: str(scan.status) || (code === 'new' ? 'Order booked' : code),
          location: location.toUpperCase() === 'NA' ? '' : location,
          dateTime: str(scan.status_date_time) || str(scan.scan_date_time),
          remark: str(scan.status_remark) || str(scan.remark) || undefined,
        }
      })
      .reverse(),
  }
}

// ── Keep orders.order_status in step with live tracking ──────────────────
// Orders only move forward (processing -> shipped -> delivered); a cancelled
// shipment never cancels the order.
const STATUS_RANK: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 }
const BATCH_SIZE = 10
const MIN_INTERVAL_MS = 60 * 1000
const lastSyncRun = new Map<string, number>()
const IST = '+05:30'

function toIso(value: unknown) {
  if (typeof value !== 'string' || !/[1-9]/.test(value)) return null
  const date = new Date(value.trim().replace(' ', 'T') + IST)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function statusFrom(current: string): 'delivered' | 'shipped' | null {
  const s = current.toLowerCase()
  if (/cancel/.test(s)) return null
  if (/deliver/.test(s) && !/undeliver|not deliver|out for|rto|return/.test(s)) return 'delivered'
  if (/pick|transit|reached|out for|dispatch|shipped|rto|return|undeliver|attempt|hub|bagged/.test(s)) return 'shipped'
  return null
}

export type SyncableOrder = {
  id: string
  awb_number: string | null
  order_status: string
  created_at?: string
  shipped_at?: string | null
  delivered_at?: string | null
}

/**
 * Pulls live status for the given orders (those with an AWB that aren't finished) and
 * updates the ones that moved. Returns the DB patch per order id so callers can reflect
 * it in-memory. Throttled per `scope` so opening a page never hammers iThink.
 */
export async function syncOrderStatusesFromIthink(
  orders: SyncableOrder[],
  scope = 'all'
): Promise<Record<string, Record<string, unknown>>> {
  const credentials = getCredentials()
  const patches: Record<string, Record<string, unknown>> = {}
  if (!credentials) return patches

  const pending = orders.filter(
    (o) => o.awb_number && o.order_status !== 'delivered' && o.order_status !== 'cancelled'
  )
  if (pending.length === 0) return patches

  if (Date.now() - (lastSyncRun.get(scope) ?? 0) < MIN_INTERVAL_MS) return patches
  lastSyncRun.set(scope, Date.now())

  const admin = createAdminClient()

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)

    let tracking: Record<string, unknown> = {}
    try {
      const { response, result } = await postJson(
        TRACK_URL,
        {
          awb_number_list: batch.map((o) => o.awb_number).join(','),
          access_token: credentials.accessToken,
          secret_key: credentials.secretKey,
        },
        8000
      )
      if (!response.ok) continue
      tracking = asRecord(asRecord(result).data)
    } catch {
      continue // iThink unreachable for this batch; try again on the next sync
    }

    for (const order of batch) {
      const entry = asRecord(tracking[order.awb_number as string])
      const next = statusFrom(String(entry.current_status ?? ''))
      if (!next || (STATUS_RANK[next] ?? 0) <= (STATUS_RANK[order.order_status] ?? 0)) continue

      const scans = Array.isArray(entry.scan_details) ? (entry.scan_details as Record<string, unknown>[]) : []
      const picked = scans.find((s) => /pick/.test(`${s.status} ${s.status_code}`.toLowerCase()))
      const last = asRecord(entry.last_scan_details)

      const patch: Record<string, unknown> = { order_status: next, updated_at: new Date().toISOString() }
      if (!order.shipped_at) {
        patch.shipped_at = toIso(picked?.status_date_time) ?? toIso(last.status_date_time) ?? new Date().toISOString()
      }
      if (next === 'delivered' && !order.delivered_at) {
        patch.delivered_at = toIso(last.status_date_time) ?? new Date().toISOString()
      }

      const { error } = await admin.from('orders').update(patch).eq('id', order.id)
      if (!error) patches[order.id] = patch
    }
  }

  return patches
}
