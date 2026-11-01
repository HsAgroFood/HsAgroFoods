import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { REAL_ORDER_FILTER } from '@/lib/orderVisibility'
import { paymentTag } from '@/lib/paymentTag'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { redirect } from 'next/navigation'
import {
  ShoppingCart,
  Users,
  Package,
  IndianRupee,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Truck,
  ImageIcon,
  HelpCircle,
  Megaphone,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Admin | HS AgroFoods',
}

export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000
const LOW_STOCK_LIMIT = 10
const CHART_DAYS = 14

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

// Calendar day in India (the store's timezone), e.g. "2026-11-01"
const dayKey = (value: string | number | Date) =>
  new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

// Same rule as the "real order" filter, applied to rows we already fetched
const isRealOrder = (o: { payment_method?: string | null; payment_status?: string | null }) =>
  /cash on delivery/i.test(o.payment_method || '') ||
  o.payment_status === 'paid' ||
  o.payment_status === 'refunded'

const countsAsSale = (o: { order_status?: string | null; payment_status?: string | null }) =>
  o.order_status !== 'cancelled' && o.payment_status !== 'refunded'

async function getDashboardData() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()
  const since30 = new Date(Date.now() - 30 * DAY_MS).toISOString()

  const [
    allOrdersRes,
    recentOrdersRes,
    orders30Res,
    customersRes,
    activeProductsRes,
    totalProductsRes,
    toProcessRes,
    pendingReviewsRes,
    openInquiriesRes,
    lowStockRes,
    lowStockCountRes,
    outOfStockCountRes,
    itemsRes,
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, order_status, payment_status').or(REAL_ORDER_FILTER),
    supabase
      .from('orders')
      .select('id, order_number, total_amount, order_status, payment_method, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('orders')
      .select('total_amount, order_status, payment_status, created_at')
      .or(REAL_ORDER_FILTER)
      .gte('created_at', since30)
      .limit(5000),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .or(REAL_ORDER_FILTER)
      .in('order_status', ['pending', 'processing']),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
    supabase
      .from('product_variants')
      .select('id, variant_name, stock_quantity, products(name)')
      .eq('is_active', true)
      .lte('stock_quantity', LOW_STOCK_LIMIT)
      .order('stock_quantity', { ascending: true })
      .limit(6),
    supabase
      .from('product_variants')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('stock_quantity', LOW_STOCK_LIMIT),
    supabase
      .from('product_variants')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('stock_quantity', 0),
    supabase
      .from('order_items')
      .select('product_name, quantity, line_total, orders!inner(created_at, order_status, payment_status, payment_method)')
      .gte('orders.created_at', since30)
      .limit(5000),
  ])

  // ── All-time totals ──────────────────────────────────────────
  const allOrders = allOrdersRes.data || []
  const totalOrders = allOrders.length
  const totalRevenue = allOrders
    .filter(countsAsSale)
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  // ── Sales windows + 14-day chart ─────────────────────────────
  const orders30 = (orders30Res.data || []).filter(countsAsSale)
  const todayKey = dayKey(Date.now())
  const revenueByDay = new Map<string, { revenue: number; orders: number }>()
  for (const o of orders30) {
    const key = dayKey(o.created_at)
    const row = revenueByDay.get(key) || { revenue: 0, orders: 0 }
    row.revenue += Number(o.total_amount) || 0
    row.orders += 1
    revenueByDay.set(key, row)
  }

  const chart = Array.from({ length: CHART_DAYS }, (_, i) => {
    const date = new Date(Date.now() - (CHART_DAYS - 1 - i) * DAY_MS)
    const key = dayKey(date)
    const row = revenueByDay.get(key) || { revenue: 0, orders: 0 }
    return {
      key,
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }),
      ...row,
    }
  })

  const sumWindow = (days: number) => {
    const from = Date.now() - days * DAY_MS
    const rows = orders30.filter((o) => new Date(o.created_at).getTime() >= from)
    return {
      revenue: rows.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
      orders: rows.length,
    }
  }
  const today = revenueByDay.get(todayKey) || { revenue: 0, orders: 0 }
  const last7 = sumWindow(7)
  const last30 = sumWindow(30)

  // ── Top products (last 30 days) ──────────────────────────────
  type ItemRow = {
    product_name: string
    quantity: number
    line_total: number
    orders: { order_status: string; payment_status: string; payment_method: string | null } | { order_status: string; payment_status: string; payment_method: string | null }[] | null
  }
  const topMap = new Map<string, { name: string; units: number; revenue: number }>()
  for (const item of (itemsRes.data || []) as unknown as ItemRow[]) {
    const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
    if (!order || !isRealOrder(order) || !countsAsSale(order)) continue
    const row = topMap.get(item.product_name) || { name: item.product_name, units: 0, revenue: 0 }
    row.units += Number(item.quantity) || 0
    row.revenue += Number(item.line_total) || 0
    topMap.set(item.product_name, row)
  }
  const topProducts = [...topMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  const lowStock = ((lowStockRes.data || []) as unknown as {
    id: string
    variant_name: string
    stock_quantity: number
    products: { name: string } | { name: string }[] | null
  }[]).map((v) => ({
    id: v.id,
    variantName: v.variant_name,
    stock: v.stock_quantity,
    productName: (Array.isArray(v.products) ? v.products[0]?.name : v.products?.name) || 'Product',
  }))

  return {
    totalOrders,
    totalRevenue,
    totalCustomers: customersRes.count || 0,
    activeProducts: activeProductsRes.count || 0,
    totalProducts: totalProductsRes.count || 0,
    recentOrders: recentOrdersRes.data || [],
    toProcess: toProcessRes.count || 0,
    pendingReviews: pendingReviewsRes.count || 0,
    openInquiries: openInquiriesRes.count || 0,
    lowStock,
    lowStockCount: lowStockCountRes.count || 0,
    outOfStockCount: outOfStockCountRes.count || 0,
    todayKey,
    today,
    last7,
    last30,
    chart,
    topProducts,
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border border-amber-200',
  processing: 'bg-blue-50 text-blue-800 border border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  delivered: 'bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3]',
  cancelled: 'bg-red-50 text-red-800 border border-red-200',
}

const cardClass = 'bg-white rounded-[5px] border border-[#EDE4D9] shadow-2xs'

export default async function AdminDashboardPage() {
  const d = await getDashboardData()

  const attention = [
    {
      label: 'Orders to process',
      value: d.toProcess,
      hint: d.toProcess > 0 ? 'Pending or processing' : 'All caught up',
      href: '/admin/orders',
      icon: ShoppingCart,
      tone: 'amber',
    },
    {
      label: 'Reviews to approve',
      value: d.pendingReviews,
      hint: d.pendingReviews > 0 ? 'Hidden until you approve' : 'Nothing waiting',
      href: '/admin/reviews',
      icon: Star,
      tone: 'amber',
    },
    {
      label: 'Open inquiries',
      value: d.openInquiries,
      hint: d.openInquiries > 0 ? 'Customers waiting for a reply' : 'No open inquiries',
      href: '/admin/inquiries',
      icon: MessageSquare,
      tone: 'blue',
    },
    {
      label: 'Low stock variants',
      value: d.lowStockCount,
      hint:
        d.outOfStockCount > 0
          ? `${d.outOfStockCount} out of stock`
          : d.lowStockCount > 0
            ? `${LOW_STOCK_LIMIT} or fewer left`
            : 'Stock looks healthy',
      href: '/admin/products',
      icon: AlertTriangle,
      tone: 'red',
    },
  ] as const

  const toneClasses = {
    amber: { box: 'bg-amber-50 border-amber-200', icon: 'text-amber-700', num: 'text-amber-800' },
    blue: { box: 'bg-blue-50 border-blue-200', icon: 'text-blue-700', num: 'text-blue-800' },
    red: { box: 'bg-red-50 border-red-200', icon: 'text-red-700', num: 'text-red-800' },
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: inr(d.totalRevenue),
      icon: IndianRupee,
      bgColor: 'bg-[#FFF8F2]',
      iconColor: 'text-[#E07B0C]',
      borderColor: 'border-[#E07B0C]/30',
    },
    {
      label: 'Total Orders',
      value: d.totalOrders.toString(),
      icon: ShoppingCart,
      bgColor: 'bg-[#EBF3ED]',
      iconColor: 'text-[#144D29]',
      borderColor: 'border-[#CFE3D3]',
    },
    {
      label: 'Registered Customers',
      value: d.totalCustomers.toString(),
      icon: Users,
      bgColor: 'bg-[#F2F7FB]',
      iconColor: 'text-[#1A5B8C]',
      borderColor: 'border-[#CFE3F4]',
    },
    {
      label: 'Active Products',
      value: `${d.activeProducts}`,
      sub: d.totalProducts > d.activeProducts ? `of ${d.totalProducts} total` : undefined,
      icon: Package,
      bgColor: 'bg-[#FAF4ED]',
      iconColor: 'text-[#B85D08]',
      borderColor: 'border-[#EBDBC9]',
    },
  ]

  const chartMax = Math.max(...d.chart.map((c) => c.revenue), 1)
  const topMax = Math.max(...d.topProducts.map((p) => p.revenue), 1)
  const aov = d.last30.orders > 0 ? d.last30.revenue / d.last30.orders : 0

  const quickLinks = [
    { label: 'Add product', href: '/admin/products/new', icon: Package },
    { label: 'Hero slides', href: '/admin/hero-slides', icon: ImageIcon },
    { label: 'Delivery settings', href: '/admin/delivery-settings', icon: Truck },
    { label: 'Announcement', href: '/admin/announcements', icon: Megaphone },
    { label: 'Global FAQs', href: '/admin/global-faqs', icon: HelpCircle },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F]">Store Overview</h1>
          <p className="text-[#615147] text-xs sm:text-sm mt-1">
            Welcome back! Here&apos;s what needs your attention and how the store is doing.
          </p>
        </div>
        <p suppressHydrationWarning className="text-xs font-semibold text-[#7A6458]">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Kolkata',
          })}
        </p>
      </div>

      {/* Needs attention */}
      <section aria-label="Needs attention">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {attention.map((item) => {
            const Icon = item.icon
            const active = item.value > 0
            const tone = toneClasses[item.tone]
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${cardClass} p-3 sm:p-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-4 hover:shadow-md transition-all group ${
                  active ? '' : 'opacity-80'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-[5px] border flex items-center justify-center shrink-0 ${
                    active ? tone.box : 'bg-[#EBF3ED] border-[#CFE3D3]'
                  }`}
                >
                  {active ? (
                    <Icon className={`w-5 h-5 ${tone.icon}`} />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-[#144D29]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-serif text-2xl font-extrabold leading-none ${active ? tone.num : 'text-[#14361F]'}`}>
                    {item.value}
                  </p>
                  <p className="text-xs font-bold text-[#14361F] mt-1 leading-tight">{item.label}</p>
                  <p className="text-[11px] text-[#7A6458] leading-tight sm:truncate">{item.hint}</p>
                </div>
                <ArrowRight className="hidden sm:block w-4 h-4 text-[#8C766E] group-hover:text-[#E07B0C] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* All-time stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`${cardClass} p-4 sm:p-5 hover:shadow-md transition-all duration-300 group`}>
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className={`w-10 h-10 rounded-[5px] ${card.bgColor} ${card.borderColor} border flex items-center justify-center shadow-2xs`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C766E] group-hover:text-[#E07B0C] transition-colors" />
              </div>
              <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#14361F]">
                {card.value}
                {card.sub && <span className="ml-1.5 text-xs font-semibold text-[#7A6458]">{card.sub}</span>}
              </p>
              <p className="text-xs sm:text-[13px] font-semibold text-[#7A6458] mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Sales snapshot + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className={`${cardClass} lg:col-span-2 p-4 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#E07B0C]" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">Sales, last {CHART_DAYS} days</h2>
            </div>
            <div className="grid w-full grid-cols-3 gap-3 text-left sm:flex sm:w-auto sm:gap-4 sm:text-right">
              {[
                { label: 'Today', v: d.today },
                { label: '7 days', v: d.last7 },
                { label: '30 days', v: d.last30 },
              ].map((w) => (
                <div key={w.label}>
                  <p className="text-sm font-extrabold text-[#14361F]">{inr(w.v.revenue)}</p>
                  <p className="text-[11px] leading-tight text-[#7A6458]">
                    {w.label}
                    <span className="block sm:inline"> · {w.v.orders} {w.v.orders === 1 ? 'order' : 'orders'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2 h-44 pt-2">
            {d.chart.map((c, i) => {
              const height = c.revenue > 0 ? Math.max(6, (c.revenue / chartMax) * 100) : 0
              const isToday = c.key === d.todayKey
              return (
                <div key={c.key} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1.5 group">
                  <div className="relative w-full flex-1 flex items-end">
                    <div
                      title={`${c.label}: ${inr(c.revenue)} from ${c.orders} ${c.orders === 1 ? 'order' : 'orders'}`}
                      className={`w-full rounded-t-[3px] transition-colors ${
                        c.revenue === 0
                          ? 'h-[3px] bg-[#EDE4D9]'
                          : isToday
                            ? 'bg-[#E07B0C]'
                            : 'bg-[#F0A95A] group-hover:bg-[#E07B0C]'
                      }`}
                      style={c.revenue > 0 ? { height: `${height}%` } : undefined}
                    />
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] text-[#7A6458] whitespace-nowrap ${
                      i % 3 === 1 ? '' : 'invisible sm:visible'
                    }`}
                  >
                    {c.label.replace(' ', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[11px] text-[#7A6458]">
            Average order value (30 days): <strong className="text-[#14361F]">{inr(aov)}</strong>. Cancelled and refunded orders are excluded.
          </p>
        </div>

        {/* Top products */}
        <div className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4.5 h-4.5 text-[#E07B0C]" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">Top products</h2>
            <span className="ml-auto text-[11px] text-[#7A6458]">last 30 days</span>
          </div>
          {d.topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#7A6458]">No sales in the last 30 days yet.</p>
          ) : (
            <ol className="space-y-3.5">
              {d.topProducts.map((p, i) => (
                <li key={p.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-semibold text-[#14361F]">
                      <span className="text-[#8C766E] mr-1.5">{i + 1}.</span>
                      {p.name}
                    </span>
                    <span className="shrink-0 font-extrabold text-[#E07B0C]">{inr(p.revenue)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#F3EBE1] overflow-hidden">
                    <div className="h-full rounded-full bg-[#E07B0C]" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-[#7A6458]">
                    {p.units} {p.units === 1 ? 'pack' : 'packs'} sold
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Low stock + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className={`${cardClass} lg:col-span-2 overflow-hidden`}>
          <div className="px-5 sm:px-6 py-4 border-b border-[#EDE4D9] bg-[#FAF7F2]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-[#E07B0C]" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">Low stock</h2>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-[#E07B0C] hover:underline">
              Manage products
            </Link>
          </div>
          {d.lowStock.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#144D29] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#14361F]">Stock looks healthy</p>
              <p className="text-xs text-[#7A6458] mt-1">Variants with {LOW_STOCK_LIMIT} or fewer packs left will show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EDE4D9]">
              {d.lowStock.map((v) => (
                <li key={v.id} className="px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#14361F] truncate">{v.productName}</p>
                    <p className="text-xs text-[#7A6458]">{v.variantName}</p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold border ${
                      v.stock <= 0
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {v.stock <= 0 ? 'Out of stock' : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${cardClass} p-5 sm:p-6`}>
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F] mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 gap-2">
            {quickLinks.map((q) => {
              const Icon = q.icon
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="flex items-center gap-3 rounded-[5px] border border-[#EDE4D9] px-3.5 py-2.5 text-sm font-semibold text-[#14361F] hover:bg-[#FAF7F2] hover:border-[#E07B0C]/40 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-[#E07B0C]" />
                  <span className="flex-1">{q.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C766E] group-hover:text-[#E07B0C] transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="px-4 sm:px-6 py-4 border-b border-[#EDE4D9] bg-[#FAF7F2]/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#E07B0C]" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">Recent Customer Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-[#E07B0C] hover:underline">
            View all orders
          </Link>
        </div>

        {d.recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#8C766E] mx-auto mb-3 opacity-60" />
            <p className="text-[#14361F] text-sm font-bold">No orders placed yet</p>
            <p className="text-[#7A6458] text-xs mt-1">
              Customer orders will appear here in real-time as they are placed.
            </p>
          </div>
        ) : (
          <>
            {/* Phones: one row per order */}
            <ul className="divide-y divide-[#EDE4D9] md:hidden">
              {d.recentOrders.map((order) => (
                <li key={order.id} className="space-y-2 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block truncate font-mono text-sm font-bold text-[#14361F] hover:text-[#E07B0C]"
                      >
                        #{order.order_number}
                      </Link>
                      <p suppressHydrationWarning className="text-xs text-[#7A6458]">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-[#E07B0C]">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold capitalize ${
                        statusColors[order.order_status] || 'bg-[#FAF7F2] text-[#615147] border border-[#EDE4D9]'
                      }`}
                    >
                      {order.order_status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold capitalize ${
                        order.payment_status === 'paid'
                          ? 'bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3]'
                          : order.payment_status === 'failed'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {paymentTag(order).label.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EDE4D9]">
                  {['Order Number', 'Total Amount', 'Order Status', 'Payment', 'Date'].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D9]">
                {d.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                    <td className="px-6 py-3.5 text-xs sm:text-sm font-bold text-[#14361F] font-mono">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-[#E07B0C] hover:underline">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-xs sm:text-sm font-extrabold text-[#E07B0C]">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold capitalize ${
                          statusColors[order.order_status] || 'bg-[#FAF7F2] text-[#615147] border border-[#EDE4D9]'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold capitalize ${
                          order.payment_status === 'paid'
                            ? 'bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3]'
                            : order.payment_status === 'failed'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {paymentTag(order).label.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-[#615147]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
