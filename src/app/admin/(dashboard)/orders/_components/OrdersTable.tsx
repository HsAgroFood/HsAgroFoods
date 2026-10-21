'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Search, Filter } from 'lucide-react'

const ORDER_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

export function OrdersTable({ orders }: { orders: any[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase()

    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.order_status !== statusFilter) {
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
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.payment_status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                        order.payment_status === 'refunded' ? 'bg-stone-100 text-stone-700 border-stone-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
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
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
