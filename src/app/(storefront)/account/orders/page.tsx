import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Truck, CheckCircle2, MapPin, MessageCircle, ArrowRight } from 'lucide-react'
import { getEffectiveUser } from '@/lib/userAuth'
import { syncOrderStatusesFromIthink } from '@/lib/ithink'
import TrackShipmentModal from '@/components/shipping/TrackShipmentModal'
import CopyAwb from '@/components/shipping/CopyAwb'
import { Suspense } from 'react'
import Image from 'next/image'
import { OrdersFilterBar } from './_components/OrdersFilterBar'

export const metadata = {
  title: 'My Orders & Live Tracking | HS AgroFoods',
}

export const dynamic = 'force-dynamic'

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received & Confirmed' },
  { key: 'processing', label: 'Packed', desc: 'Aroma-Lock Sealing' },
  { key: 'shipped', label: 'In Transit', desc: 'Handed to Courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy Fresh Spices' },
]

function getStepIndex(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 0
    case 'processing':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    default:
      return 0
  }
}

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>
}) {
  const filters = await searchParams
  const user = await getEffectiveUser()
  const hasAdminCookie = await isAdminAuthenticated()

  if (!user && !hasAdminCookie) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  let effectiveUserId = user?.id || null
  let effectiveEmail = (user?.email || '').trim().toLowerCase()

  if (!effectiveUserId && hasAdminCookie) {
    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('role', 'admin')
      .maybeSingle()

    if (adminProfile) {
      effectiveUserId = adminProfile.id
      effectiveEmail = (adminProfile.email || '').trim().toLowerCase()
    }
  }

  // Check if current user is admin
  let isStoreAdmin = hasAdminCookie
  if (!isStoreAdmin && effectiveUserId) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', effectiveUserId)
      .maybeSingle()
    if (profile?.role === 'admin') {
      isStoreAdmin = true
    }
  }

  // Fetch all orders with items via admin client
  const { data: allOrders } = await adminClient
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false })

  const orders = (allOrders || []).filter((order) => {
    if (isStoreAdmin) return true

    if (effectiveUserId && order.user_id === effectiveUserId) return true

    const orderEmail = order.shipping_address?.email?.trim().toLowerCase()
    if (effectiveEmail && orderEmail && orderEmail === effectiveEmail) return true

    const userPhoneClean = user?.phone?.replace(/\D/g, '')
    const orderPhoneClean = order.shipping_address?.phone?.replace(/\D/g, '')
    if (userPhoneClean && orderPhoneClean && userPhoneClean.length >= 10 && userPhoneClean === orderPhoneClean) {
      return true
    }

    if (user?.full_name && order.shipping_address?.full_name) {
      if (user.full_name.trim().toLowerCase() === order.shipping_address.full_name.trim().toLowerCase()) {
        return true
      }
    }

    return false
  })

  // Refresh shipped/delivered status from the courier for the orders being shown (throttled)
  const syncPatches = await syncOrderStatusesFromIthink(orders, `account:${effectiveUserId || effectiveEmail || 'admin'}`)
  for (const order of orders) Object.assign(order, syncPatches[order.id] || {})

  // Product pictures for the order lines (order_items only stores the product id)
  const productIds = [...new Set(orders.flatMap((order) => (order.order_items || []).map((item: any) => item.product_id)).filter(Boolean))]
  const { data: productRows } = productIds.length
    ? await adminClient.from('products').select('id, slug, featured_image_url').in('id', productIds)
    : { data: [] as any[] }
  const productById = new Map<string, { slug: string | null; image: string | null }>(
    (productRows || []).map((product: any) => [product.id, { slug: product.slug, image: product.featured_image_url }])
  )

  // ── Filters (status / search / sort), driven by the URL so they survive refresh and sharing ──
  const statusFilter = VALID_STATUSES.includes(filters.status || '') ? (filters.status as string) : 'all'
  const searchTerm = (filters.q || '').trim().toLowerCase().slice(0, 80)
  const sortKey = ['oldest', 'amount_high', 'amount_low'].includes(filters.sort || '') ? (filters.sort as string) : 'newest'

  const statusCounts: Record<string, number> = { all: orders.length }
  for (const status of VALID_STATUSES) statusCounts[status] = 0
  for (const order of orders) {
    if (statusCounts[order.order_status] !== undefined) statusCounts[order.order_status] += 1
  }

  const visibleOrders = orders
    .filter((order) => {
      if (statusFilter !== 'all' && order.order_status !== statusFilter) return false
      if (!searchTerm) return true
      const haystack = [
        order.order_number,
        ...(order.order_items || []).flatMap((item: any) => [item.product_name, item.variant_name]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchTerm)
    })
    .sort((a, b) => {
      if (sortKey === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortKey === 'amount_high') return Number(b.total_amount) - Number(a.total_amount)
      if (sortKey === 'amount_low') return Number(a.total_amount) - Number(b.total_amount)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg sm:text-xl">📦</span>
              <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-[#14361F]">
                My Orders & Tracking
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#8C7567]">
              Track your spice deliveries in real-time from our mill to your kitchen.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-1.5 self-start sm:self-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-[5px] bg-[#E07B0C] text-white text-xs font-bold hover:bg-[#2D1409] transition-colors shadow-xs"
          >
            <span>Explore Spices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {orders.length > 0 && (
        <Suspense fallback={null}>
          <OrdersFilterBar counts={statusCounts} />
        </Suspense>
      )}

      {!orders || orders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-[5px] border border-[#E8DFD5] shadow-xs">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5] text-[#E07B0C] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 opacity-60" />
          </div>
          <h3 className="font-serif text-base sm:text-xl font-bold text-[#14361F]">No Orders Placed Yet</h3>
          <p className="text-xs sm:text-sm text-[#8C7567] max-w-sm mx-auto mt-1.5 mb-6">
            You haven&rsquo;t ordered any pure spices yet. Add authentic handpicked spices to your kitchen!
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 bg-[#E07B0C] text-white text-xs sm:text-sm font-bold rounded-[5px] hover:bg-[#2D1409] shadow-md shadow-[#E07B0C]/20 transition-all active:scale-95"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="text-center py-10 sm:py-14 px-4 bg-white rounded-[5px] border border-[#E8DFD5] shadow-xs">
          <div className="w-12 h-12 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5] text-[#E07B0C] flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">No orders match your filters</h3>
          <p className="text-xs sm:text-sm text-[#8C7567] mt-1.5">Try a different status or search term.</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 border border-[#E07B0C] text-[#E07B0C] text-xs font-bold rounded-[5px] hover:bg-[#E07B0C] hover:text-white transition-colors"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {visibleOrders.map((order) => {
            const currentStep = getStepIndex(order.order_status)
            const isCancelled = order.order_status === 'cancelled'
            const shippingAddr = order.shipping_address || order.addresses

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E8DFD5] rounded-[5px] overflow-hidden shadow-xs hover:border-[#E07B0C]/40 transition-colors"
              >
                {/* Order Top Summary Bar */}
                <div className="bg-[#FDF9F3] p-3.5 sm:p-5 border-b border-[#E8DFD5]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-6 lg:gap-8">
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#8C7567] block">
                          Date
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-[#14361F] mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#8C7567] block">
                          Total
                        </span>
                        <p className="text-xs sm:text-sm font-extrabold text-[#E07B0C] mt-0.5">
                          ₹{order.total_amount}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#8C7567] block">
                          Order #
                        </span>
                        <p className="text-xs sm:text-sm font-mono font-bold text-[#14361F] mt-0.5 truncate">
                          {order.order_number}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center self-start sm:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                        isCancelled 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : order.order_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          isCancelled ? 'bg-rose-500' : order.order_status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`} />
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 📍 LIVE ORDER TRACKING PROGRESS BAR */}
                {!isCancelled && (
                  <div className="p-3.5 sm:p-5 lg:p-6 bg-white border-b border-[#E8DFD5]/80">
                    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#14361F] flex items-center gap-1.5 sm:gap-2">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E07B0C]" />
                        <span>Live Delivery Tracker</span>
                      </h4>
                      <span className="text-[11px] sm:text-xs font-semibold text-[#E07B0C] text-right truncate">
                        {order.order_status === 'delivered' 
                          ? 'Delivered' 
                          : order.order_status === 'shipped' 
                          ? 'In transit' 
                          : 'Processing'}
                      </span>
                    </div>

                    {/* Step Timeline */}
                    <div className="relative pt-2 pb-1">
                      {/* Background connecting bar */}
                      <div className="absolute top-5 left-4 right-4 sm:left-6 sm:right-6 h-1 bg-stone-200 rounded-full" />
                      {/* Active filled connecting bar */}
                      <div
                        className="absolute top-5 left-4 sm:left-6 h-1 bg-[#E07B0C] rounded-full transition-all duration-500"
                        style={{ width: `calc(${(currentStep / (ORDER_STEPS.length - 1)) * 100}% - 16px)` }}
                      />

                      <div className="relative flex justify-between">
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStep
                          const isCurrent = idx === currentStep

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center max-w-[70px] sm:max-w-none">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs transition-all z-10 ${
                                  isDone
                                    ? 'bg-[#E07B0C] text-white shadow-md shadow-[#E07B0C]/25'
                                    : 'bg-white border-2 border-stone-300 text-stone-400'
                                } ${isCurrent ? 'ring-3 ring-[#F09819]/30' : ''}`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-bold mt-1.5 leading-tight ${isDone ? 'text-[#14361F]' : 'text-stone-400'}`}>
                                {step.label}
                              </span>
                              <span className="text-[10px] text-[#8C7567] hidden sm:block mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Courier & live shipment tracking (same view the admin sees) */}
                {order.awb_number && !isCancelled && (
                  <div className="p-3.5 sm:p-5 lg:p-6 bg-white border-b border-[#E8DFD5]/80">
                    <div className="rounded-[5px] border border-[#F2E3CF] bg-[#FFF9F1] p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#E07B0C]/10 text-[#E07B0C] flex items-center justify-center shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-[#8C7567] block">
                            Shipment details
                          </span>
                          <h5 className="text-sm sm:text-base font-bold text-[#14361F] mt-0.5">
                            {order.courier_name
                              ? `Shipped via ${String(order.courier_name).replace(/\b\w/g, (c: string) => c.toUpperCase())}`
                              : 'Shipment booked'}
                          </h5>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7567]">AWB</span>
                            <CopyAwb awb={order.awb_number} />
                          </div>
                        </div>
                      </div>
                      <TrackShipmentModal orderId={order.id} awb={order.awb_number} variant="customer" />
                    </div>
                  </div>
                )}
                {/* Order Details: Items + Shipping Address */}
                <div className="p-3.5 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                  
                  {/* Left: Ordered Items (7 cols) */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#8C7567] block">
                      Items in Package ({order.order_items?.length || 0})
                    </span>

                    <div className="divide-y divide-[#F2E8DC] border border-[#E8DFD5] rounded-[5px] overflow-hidden bg-[#FDF9F3]/40">
                      {order.order_items?.map((item: any) => {
                        const product = productById.get(item.product_id)
                        const thumb = (
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-[5px] overflow-hidden border border-[#E8DFD5] bg-[#FAF6F0]">
                            {product?.image ? (
                              <Image
                                src={product.image}
                                alt={item.product_name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[#C9B8A6]">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        )

                        return (
                        <div key={item.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
                          {product?.slug ? (
                            <Link href={`/product/${product.slug}`} className="shrink-0" aria-label={item.product_name}>
                              {thumb}
                            </Link>
                          ) : (
                            thumb
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold text-[#14361F] truncate">
                              {item.product_name}
                            </h5>
                            <p className="text-[11px] sm:text-xs text-[#8C7567] mt-0.5 font-medium">
                              Pack: <span className="text-[#14361F]">{item.variant_name}</span> · Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-extrabold text-[#E07B0C]">
                              ₹{item.line_total}
                            </span>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right: Shipping Address & WhatsApp Help (5 cols) */}
                  <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                    {/* Shipping Address Box */}
                    <div className="p-3.5 sm:p-4 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5]">
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#8C7567] mb-1.5 sm:mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#E07B0C]" />
                        <span>Delivery Destination</span>
                      </div>
                      {shippingAddr ? (
                        <div className="text-xs text-[#5A433B] space-y-0.5">
                          <p className="font-bold text-[#14361F] text-xs sm:text-sm">{shippingAddr.full_name}</p>
                          <p className="leading-relaxed">{shippingAddr.address_line_1}</p>
                          {shippingAddr.address_line_2 && <p className="leading-relaxed">{shippingAddr.address_line_2}</p>}
                          <p className="font-medium text-[#14361F]">{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postal_code}</p>
                          <p className="pt-1 font-semibold text-[#14361F]">Phone: {shippingAddr.phone}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#8C7567] italic">Address registered on file.</p>
                      )}
                    </div>

                    {/* WhatsApp Help / Support Button */}
                    <a
                      href={`https://wa.me/919493184110?text=${encodeURIComponent(`Hi HS AgroFoods, I need an update on my order #${order.order_number}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[5px] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Need help? Chat on WhatsApp</span>
                    </a>
                  </div>

                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
