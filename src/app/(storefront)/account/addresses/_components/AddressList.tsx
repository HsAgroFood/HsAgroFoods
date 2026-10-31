'use client'

import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  Phone,
  Check,
  Loader2
} from 'lucide-react'
import { AddressForm } from './AddressForm'
import { deleteAddress, setDefaultAddress } from '@/actions/addresses'

type Address = {
  id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    setLoadingId(id)
    await deleteAddress(id)
    setLoadingId(null)
  }

  const handleSetDefault = async (id: string) => {
    setLoadingId(id)
    await setDefaultAddress(id)
    setLoadingId(null)
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#E8DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[5px] bg-[#FAF3EB] text-[#E07B0C] border border-[#FADCC3] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#E07B0C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#14361F]">
                Saved Addresses
              </h1>
              {addresses.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FDF9F3] border border-[#E8DFD5] text-[#E07B0C] text-[10px] sm:text-xs font-bold">
                  {addresses.length}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#8C7567] mt-0.5">
              Manage your delivery addresses for seamless 1-click checkout.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] hover:from-[#2D1409] hover:to-[#E07B0C] text-white text-xs sm:text-sm font-bold rounded-[5px] shadow-sm transition-all shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 bg-[#FDF9F3]/60 rounded-[5px] border-2 border-dashed border-[#E8DFD5]">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[5px] bg-white border border-[#E8DFD5] text-stone-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-[#E07B0C]/70" />
          </div>
          <h3 className="font-serif text-base sm:text-xl font-bold text-[#14361F]">
            No Addresses Saved Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#8C7567] max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            Add your home or office address now so you don&apos;t have to type it every time you order fresh spices!
          </p>
          <button
            onClick={() => setIsAdding(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] text-white text-xs sm:text-sm font-bold rounded-[5px] hover:from-[#2D1409] hover:to-[#E07B0C] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          {addresses.map((address) => {
            const isLoading = loadingId === address.id

            return (
              <div
                key={address.id}
                className={`relative flex flex-col justify-between p-4 sm:p-5 lg:p-6 rounded-[5px] border transition-all duration-300 ${
                  address.is_default
                    ? 'border-[#E07B0C] bg-[#FDF9F3] shadow-xs'
                    : 'border-[#E8DFD5] bg-white hover:border-[#E07B0C]/40 shadow-2xs'
                }`}
              >
                {/* Default Badge */}
                {address.is_default && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-[#14361F] text-[#FAF3EB] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-[5px] shadow-2xs">
                    <CheckCircle className="w-3 h-3 text-[#E07B0C]" />
                    <span>DEFAULT</span>
                  </div>
                )}

                {/* Top Details */}
                <div>
                  {/* Recipient info */}
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-3">
                    <div className="w-8 h-8 rounded-[5px] bg-[#FAF3EB] border border-[#E8DFD5] text-[#E07B0C] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                      {address.full_name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 pr-16 sm:pr-20">
                      <h3 className="font-bold text-[#14361F] text-sm sm:text-base truncate">
                        {address.full_name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#8C7567] mt-0.5">
                        <Phone className="w-3 h-3 text-[#8C7567] shrink-0" />
                        <span>+91 {address.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Body Box */}
                  <div className="p-3 rounded-[5px] bg-white/80 border border-[#E8DFD5] text-xs text-[#5A433B] space-y-0.5 leading-relaxed">
                    <p className="font-medium text-[#14361F]">{address.address_line_1}</p>
                    {address.address_line_2 && (
                      <p className="text-[#8C7567]">{address.address_line_2}</p>
                    )}
                    <p className="mt-1 font-semibold text-[#14361F]">
                      {address.city}, {address.state} —{' '}
                      <span className="bg-[#FAF3EB] px-1.5 py-0.5 rounded-[3px] border border-[#E8DFD5] font-mono text-[11px] text-[#14361F]">
                        {address.postal_code}
                      </span>
                    </p>
                    <p className="text-[10px] text-[#8C7567] mt-0.5">India</p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD5] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setEditingAddress(address)}
                      disabled={isLoading}
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] text-[11px] sm:text-xs font-semibold text-[#14361F] bg-[#FAF3EB] hover:bg-[#E07B0C] hover:text-white transition-colors cursor-pointer border border-[#E8DFD5]"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={isLoading}
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] text-[11px] sm:text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isLoading}
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#E07B0C] hover:underline cursor-pointer disabled:opacity-50 ml-auto"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Set Default</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Dedicated "+ Add New Address" Card in the Grid */}
          <div
            onClick={() => setIsAdding(true)}
            className="group rounded-[5px] border-2 border-dashed border-[#E8DFD5] hover:border-[#E07B0C] bg-[#FAF3EB]/40 hover:bg-[#FAF3EB] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[170px]"
          >
            <div className="w-10 h-10 rounded-[5px] bg-white border border-[#E8DFD5] group-hover:bg-[#E07B0C] group-hover:text-white text-[#E07B0C] flex items-center justify-center shadow-2xs transition-all duration-300 mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#14361F] text-xs sm:text-sm group-hover:text-[#E07B0C] transition-colors">
              Add Another Address
            </h4>
            <p className="text-[11px] text-[#8C7567] max-w-[200px] mt-0.5 leading-relaxed">
              Save a delivery location for your family, work, or relatives.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {(isAdding || editingAddress) && (
        <AddressForm
          address={editingAddress}
          onClose={() => {
            setIsAdding(false)
            setEditingAddress(null)
          }}
        />
      )}
    </div>
  )
}
