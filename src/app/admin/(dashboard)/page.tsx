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
  Clock,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Admin | HS AgroFoods',
}

export const dynamic = 'force-dynamic'

async function getStats() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()

  const [ordersRes, customersRes, productsRes, recentOrdersRes] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, order_status, payment_status', { count: 'exact', head: false })
        .or(REAL_ORDER_FILTER),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('id, order_number, total_amount, order_status, payment_method, payment_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const totalOrders = ordersRes.count || 0
  const totalRevenue =
    ordersRes.data
      ?.filter(
        (order) =>
          order.order_status !== 'cancelled' && order.payment_status !== 'refunded'
      )
      .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0
  const totalCustomers = customersRes.count || 0
  const totalProducts = productsRes.count || 0
  const recentOrders = recentOrdersRes.data || []

  return { totalOrders, totalRevenue, totalCustomers, totalProducts, recentOrders }
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border border-amber-200',
  processing: 'bg-blue-50 text-blue-800 border border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  delivered: 'bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3]',
  cancelled: 'bg-red-50 text-red-800 border border-red-200',
}

export default async function AdminDashboardPage() {
  const { totalOrders, totalRevenue, totalCustomers, totalProducts, recentOrders } =
    await getStats()

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      bgColor: 'bg-[#FFF8F2]',
      iconColor: 'text-[#E07B0C]',
      borderColor: 'border-[#E07B0C]/30',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      bgColor: 'bg-[#EBF3ED]',
      iconColor: 'text-[#144D29]',
      borderColor: 'border-[#CFE3D3]',
    },
    {
      label: 'Registered Customers',
      value: totalCustomers.toString(),
      icon: Users,
      bgColor: 'bg-[#F2F7FB]',
      iconColor: 'text-[#1A5B8C]',
      borderColor: 'border-[#CFE3F4]',
    },
    {
      label: 'Active Products',
      value: totalProducts.toString(),
      icon: Package,
      bgColor: 'bg-[#FAF4ED]',
      iconColor: 'text-[#B85D08]',
      borderColor: 'border-[#EBDBC9]',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F]">
          Store Overview
        </h1>
        <p className="text-[#615147] text-xs sm:text-sm mt-1">
          Welcome back! Here&apos;s a live summary of your sales, products and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-[5px] border border-[#EDE4D9] p-5 hover:shadow-md transition-all duration-300 group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className={`w-10 h-10 rounded-[5px] ${card.bgColor} ${card.borderColor} border flex items-center justify-center shadow-2xs`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C766E] group-hover:text-[#E07B0C] transition-colors" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">{card.value}</p>
              <p className="text-xs sm:text-[13px] font-semibold text-[#7A6458] mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Card */}
      <div className="bg-white rounded-[5px] border border-[#EDE4D9] overflow-hidden shadow-2xs">
        <div className="px-5 sm:px-6 py-4 border-b border-[#EDE4D9] bg-[#FAF7F2]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#E07B0C]" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">
              Recent Customer Orders
            </h2>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#8C766E] mx-auto mb-3 opacity-60" />
            <p className="text-[#14361F] text-sm font-bold">No orders placed yet</p>
            <p className="text-[#7A6458] text-xs mt-1">
              Customer orders will appear here in real-time as they are placed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EDE4D9]">
                  <th className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                    Order Number
                  </th>
                  <th className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                    Total Amount
                  </th>
                  <th className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                    Order Status
                  </th>
                  <th className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                    Payment
                  </th>
                  <th className="text-left text-xs font-bold text-[#14361F] uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D9]">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF7F2]/70 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-xs sm:text-sm font-bold text-[#14361F] font-mono">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-3.5 text-xs sm:text-sm font-extrabold text-[#E07B0C]">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-xs font-bold capitalize ${
                          statusColors[order.order_status] ||
                          'bg-[#FAF7F2] text-[#615147] border border-[#EDE4D9]'
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
        )}
      </div>
    </div>
  )
}
