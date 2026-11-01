'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Search, Filter, AlertTriangle, Clock } from 'lucide-react'
import { paymentTag, isOnlineOrder, PAYMENT_TAG_CLASSES } from '@/lib/paymentTag'
import { DeleteOrderButton } from './DeleteOrderButton'
import { ViewToggle, useViewMode } from '@/components/admin/ViewToggle'

const ORDER_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'payment_incomplete']

const orderStatusClass = (status: string) =>
  status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
  status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
  status === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
  status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
  'bg-orange-50 text-orange-700 border-orange-200'

export function OrdersTable({ orders }: { orders: any[] }) {
  const { view, setView, cardsClass, tableClass } = useViewMode()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase()

    return orders.filter((order) => {
      if (statusFilter === 'payment_failed') {
        if (order.payment_status !== 'failed') return false
      } else if (statusFilter === 'payment_incomplete') {
        if (!(isOnlineOrder(order) && order.payment_status === 'pending')) return false
      } else if (statusFilter !== 'all' && order.order_status !== statusFilter) {
        return false
      }

      if (!term) return true

      const customer = order.shipping_address || {}
      const haystack = [
        order.order_number,
        customer.full_name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [orders, query, statusFilter])

  return (
    <>
      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order number, customer..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'All Statuses'
                  : status === 'payment_failed'
                    ? 'Payment failed'
                    : status === 'payment_incomplete'
                      ? 'Payment not completed'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Grid view: one card per order */}
      <div className={cardsClass}>
        {filteredOrders.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            No orders found.
          </p>
        ) : (
          filteredOrders.map((order) => {
            const tag = paymentTag(order)
            return (
              <div key={order.id} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${order.id}`} className="block truncate font-semibold text-stone-900 hover:text-orange-600">
                      {order.order_number}
                    </Link>
                    <p suppressHydrationWarning className="text-xs text-stone-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="shrink-0 text-base font-bold text-stone-900">₹{order.total_amount}</span>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-stone-900">
                    {order.shipping_address?.full_name || order.profiles?.full_name || 'Guest'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {order.shipping_address?.phone || order.profiles?.email || ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${orderStatusClass(order.order_status)}`}>
                    {order.order_status.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PAYMENT_TAG_CLASSES[tag.tone]}`}>
                    {tag.tone === 'red' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {tag.label === 'PAYMENT NOT COMPLETED' && <Clock className="w-3 h-3 mr-1" />}
                    {tag.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <Eye className="h-4 w-4" />
                    View details
                  </Link>
                  <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Orders Table */}
      <div className={`bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden ${tableClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-xs border-b border-stone-200/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-900">
                          {order.shipping_address?.full_name || order.profiles?.full_name || 'Guest'}
                        </span>
                        <span className="text-xs text-stone-500">
                          {order.shipping_address?.phone || order.profiles?.email || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900">₹{order.total_amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const tag = paymentTag(order)
                        return (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PAYMENT_TAG_CLASSES[tag.tone]}`}>
                            {tag.tone === 'red' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {tag.label === 'PAYMENT NOT COMPLETED' && <Clock className="w-3 h-3 mr-1" />}
                            {tag.label}
                          </span>
                        )
                      })()}                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.order_status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.order_status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        order.order_status === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        order.order_status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {order.order_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
