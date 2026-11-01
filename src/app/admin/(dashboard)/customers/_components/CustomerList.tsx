'use client'

import { useState } from 'react'
import { Search, UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react'
import { toggleCustomerStatus } from '@/actions/admin/customers'
import { ViewToggle, useViewMode } from '@/components/admin/ViewToggle'
import type { Profile } from '@/types/database'

interface CustomerListProps {
  initialCustomers: Profile[]
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { view, setView, cardsClass, tableClass } = useViewMode()

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  )

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)
    try {
      const result = await toggleCustomerStatus(id, !currentStatus)
      if (result.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, is_active: !currentStatus } : c
          )
        )
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error(error)
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const statusBadge = (active: boolean) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}
    >
      {active ? 'Active' : 'Suspended'}
    </span>
  )

  const statusButton = (customer: Profile, className: string) => (
    <button
      onClick={() => handleToggleStatus(customer.id, customer.is_active)}
      disabled={isLoading === customer.id}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        customer.is_active
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
          : 'text-green-600 hover:bg-green-50 hover:text-green-700'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading === customer.id ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : customer.is_active ? (
        <UserX className="w-4 h-4" />
      ) : (
        <UserCheck className="w-4 h-4" />
      )}
      {customer.is_active ? 'Suspend' : 'Activate'}
    </button>
  )

  const avatar = (customer: Profile) => (
    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-orange-100 to-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
      {customer.full_name.charAt(0).toUpperCase()}
    </div>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-stone-500">
      <UserX className="w-12 h-12 text-stone-300 mb-3" />
      <p className="text-lg font-medium text-stone-900">No customers found</p>
      <p className="text-sm">We couldn&apos;t find any customers matching your search.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, email or phone…"
          className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-xl leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
        </p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Grid view: one card per customer */}
      <div className={cardsClass}>
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-stone-200 bg-white">{emptyState}</div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {avatar(customer)}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{customer.full_name}</p>
                    <p className="font-mono text-xs text-stone-400">ID: {customer.id.substring(0, 8)}...</p>
                  </div>
                </div>
                {statusBadge(customer.is_active)}
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2 break-all text-stone-900">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2 text-stone-500">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                  {customer.phone || 'N/A'}
                </p>
                <p suppressHydrationWarning className="flex items-center gap-2 text-stone-500">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                  Joined {formatDate(customer.created_at)}
                </p>
              </div>

              {statusButton(customer, 'w-full border border-stone-200')}
            </div>
          ))
        )}
      </div>

      {/* Table view */}
      <div className={`bg-white rounded-xl shadow-sm border border-stone-200/80 overflow-hidden ${tableClass}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {avatar(customer)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-stone-900">
                            {customer.full_name}
                          </div>
                          <div className="text-sm text-stone-500 font-mono text-xs">
                            ID: {customer.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-900 flex items-center gap-2 mb-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-stone-500 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      <div suppressHydrationWarning className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(customer.is_active)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {statusButton(customer, '')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>{emptyState}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
