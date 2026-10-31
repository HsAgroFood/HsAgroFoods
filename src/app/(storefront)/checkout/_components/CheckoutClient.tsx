'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  Plus,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Loader2,
  Leaf,
  RotateCcw,
  Check,
} from 'lucide-react'
import { createOrder, verifyRazorpayPayment, reportPaymentFailure, type ShippingAddressInput } from '@/actions/checkout'
import { useCart } from '@/contexts/CartContext'
import Script from 'next/script'
import type { ShippingConfig } from '@/actions/shipping'

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

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Chandigarh'
]

interface CheckoutClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialItems: any[]
  addresses: Address[]
  isAuthenticated: boolean
  userEmail?: string
  shippingConfig?: ShippingConfig
}

export function CheckoutClient({
  initialItems,
  addresses,
  isAuthenticated,
  userEmail = '',
  shippingConfig = { free_shipping_threshold: 500, standard_shipping_cost: 90 },
}: CheckoutClientProps) {
  const router = useRouter()
  const { refreshCart } = useCart()

  // State: Use saved address or new address form
  const hasSavedAddresses = isAuthenticated && addresses.length > 0
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(hasSavedAddresses)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.is_default)?.id || (addresses.length > 0 ? addresses[0].id : null)
  )

  // Direct Address Form State
  const [formData, setFormData] = useState<ShippingAddressInput>({
    full_name: '',
    phone: '',
    email: userEmail || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: 'Maharashtra',
    postal_code: '',
  })

  // Real-time PIN code verification & auto-fill state
  const [isVerifyingPincode, setIsVerifyingPincode] = useState(false)
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([])
  const [pincodeStatus, setPincodeStatus] = useState<{
    status: 'idle' | 'valid' | 'invalid'
    location?: string
    message?: string
  }>({ status: 'idle' })

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate totals
  const subtotal = initialItems.reduce((sum, item) => {
    const price = Number(item.product_variants?.price || 0)
    const qty = Number(item.quantity || 1)
    return sum + price * qty
  }, 0)

  const FREE_SHIPPING_THRESHOLD = shippingConfig.free_shipping_threshold
  const SHIPPING_COST = shippingConfig.standard_shipping_cost
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = isFreeShipping ? 0 : SHIPPING_COST
  const total = subtotal + shipping
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  // Pincode auto-fill & verification function
  const checkAndAutoFillPincode = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus({ status: 'idle' })
      setAvailableLocalities([])
      return
    }

    setIsVerifyingPincode(true)
    try {
      const res = await fetch(`/api/pincode?code=${pin}`)
      const data = await res.json()

      if (!data.valid) {
        setAvailableLocalities([])
        setPincodeStatus({
          status: 'invalid',
          message: data.message || 'Invalid Indian Postal PIN code. Please enter a valid PIN code.',
        })
        return
      }

      // Match state with INDIAN_STATES
      let matchedState = 'Maharashtra'
      if (data.state) {
        const found = INDIAN_STATES.find(
          (st) =>
            st.toLowerCase() === data.state.toLowerCase() ||
            st.toLowerCase().includes(data.state.toLowerCase()) ||
            data.state.toLowerCase().includes(st.toLowerCase())
        )
        if (found) matchedState = found
      }

      const detectedCity = data.city || data.district || ''
      const locationLabel = detectedCity ? `${detectedCity}, ${data.state}` : data.state || 'Verified'
      const localities = Array.isArray(data.postOffices) && data.postOffices.length > 0 
        ? data.postOffices 
        : [detectedCity].filter(Boolean)

      setAvailableLocalities(localities)
      setPincodeStatus({
        status: 'valid',
        location: locationLabel,
      })

      // Auto-populate city with the first verified locality / district
      setFormData((prev) => ({
        ...prev,
        city: localities[0] || detectedCity,
        state: matchedState,
      }))
    } catch {
      // Fallback
      setPincodeStatus({ status: 'idle' })
      setAvailableLocalities([])
    } finally {
      setIsVerifyingPincode(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'phone') {
      const cleanPhone = value.replace(/\D/g, '').slice(0, 10)
      setFormData((prev) => ({ ...prev, phone: cleanPhone }))
      if (error) setError(null)
      return
    }

    if (name === 'postal_code') {
      const cleanPin = value.replace(/\D/g, '').slice(0, 6)
      setFormData((prev) => ({ ...prev, postal_code: cleanPin }))
      if (error) setError(null)

      if (cleanPin.length === 6) {
        checkAndAutoFillPincode(cleanPin)
      } else {
        setPincodeStatus({ status: 'idle' })
        setAvailableLocalities([])
      }
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (useSavedAddress && hasSavedAddresses) {
      if (!selectedAddressId) {
        setError('Please select a delivery address from your saved addresses.')
        return
      }
    } else {
      // 1. Full name: At least 3 letters, alphabetic & spaces only
      const trimmedName = formData.full_name.trim()
      if (!/^[a-zA-Z\s.']{3,60}$/.test(trimmedName)) {
        setError('Please enter a valid full name (at least 3 alphabetic characters, no numbers or symbols).')
        return
      }

      // 2. Mobile phone: Exactly 10 digits starting with 6, 7, 8, or 9
      const cleanPhone = formData.phone.trim().replace(/\D/g, '')
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.')
        return
      }

      // 3. Street Address: Minimum 6 characters
      if (formData.address_line_1.trim().length < 6) {
        setError('Please enter a complete street address (House/Flat No., Building & Street - minimum 6 characters).')
        return
      }

      // 4. City / Area
      if (!formData.city.trim()) {
        setError('Please select or enter your delivery city / area.')
        return
      }

      // 5. PIN code
      if (!/^\d{6}$/.test(formData.postal_code.trim())) {
        setError('Please enter a valid 6-digit Indian PIN code.')
        return
      }
      if (pincodeStatus.status === 'invalid') {
        setError('Please enter a valid Indian Postal PIN code before placing the order.')
        return
      }
    }

    setIsPlacingOrder(true)

    try {
      const addressPayload: string | ShippingAddressInput =
        useSavedAddress && hasSavedAddresses && selectedAddressId
          ? selectedAddressId
          : formData

      const result = await createOrder(addressPayload, paymentMethod)

      if (!result.success) {
        setError(result.error || 'Failed to place order. Please try again.')
        setIsPlacingOrder(false)
        return
      }

      // Handle Razorpay Online Flow
      if (result.isRazorpay && result.razorpayOrderId) {
        const options = {
          key: result.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: result.amount,
          currency: 'INR',
          name: 'HS AgroFoods',
          description: 'Pure Spices Order',
          order_id: result.razorpayOrderId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async function (response: any) {
            setIsPlacingOrder(true)
            const verifyResult = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              result.orderId
            )

            if (verifyResult.success) {
              refreshCart()
              router.push(`/checkout/success?order_number=${result.orderNumber}&t=${encodeURIComponent(verifyResult.receiptToken || '')}`)
            } else {
              setError(verifyResult.error || 'Payment verification failed.')
              setIsPlacingOrder(false)
            }
          },
          prefill: {
            name: formData.full_name || addresses.find((a) => a.id === selectedAddressId)?.full_name || '',
            contact: formData.phone || addresses.find((a) => a.id === selectedAddressId)?.phone || '',
            email: formData.email || userEmail || '',
          },
          modal: {
            // Re-enable the button if the customer closes the payment window
            ondismiss: function () {
              setIsPlacingOrder(false)
            },
          },
          theme: {
            color: '#14361F',
          },
        }

        // @ts-ignore
        if (typeof window !== 'undefined' && window.Razorpay) {
          // @ts-ignore
          const rzp = new window.Razorpay(options)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rzp.on('payment.failed', function (response: any) {
            // Record the failure on the order right away (the webhook confirms it later)
            void reportPaymentFailure(result.orderId, result.razorpayOrderId)
            setError(`Payment Failed: ${response.error?.description || 'Payment rejected'}`)
            setIsPlacingOrder(false)
          })
          rzp.open()
        } else {
          setError('Payment SDK failed to load. Please try Cash on Delivery (COD).')
          setIsPlacingOrder(false)
        }
      } else {
        // COD Success Flow
        refreshCart()
        router.push(`/checkout/success?order_number=${result.order_number}`)
      }
    } catch (err: any) {
      console.error('Order submission error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10 items-start">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* ── Left Column: Checkout Forms (Col 7) ── */}
      <div className="lg:col-span-7 space-y-6 sm:space-y-8">
        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6 sm:space-y-8">
          
          {/* Error Alert Box */}
          {error && (
            <div className="p-4 rounded-[5px] bg-[#FFF5F5] border border-[#FEB2B2] text-[#9B2C2C] flex items-start gap-3 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Action Required</p>
                <p className="text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Delivery Address ── */}
          <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-5 sm:p-7 shadow-[0_4px_20px_rgba(20,54,31,0.03)]">
            <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[#EDE4D9] mb-5 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-[#14361F] text-[#E07B0C] font-bold text-xs sm:text-sm flex items-center justify-center shadow-2xs">
                  1
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#14361F]">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-[#7A6458]">
                    Where should we deliver your pure authentic spices?
                  </p>
                </div>
              </div>

              {/* Toggle if user has saved addresses */}
              {hasSavedAddresses && (
                <button
                  type="button"
                  onClick={() => setUseSavedAddress((prev) => !prev)}
                  className="text-xs font-bold text-[#E07B0C] hover:text-[#C86A08] transition-colors cursor-pointer"
                >
                  {useSavedAddress ? '+ Enter New Address' : 'Use Saved Address'}
                </button>
              )}
            </div>

            {/* Saved Address Selection Mode */}
            {hasSavedAddresses && useSavedAddress ? (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id
                  return (
                    <label
                      key={address.id}
                      className={`relative flex cursor-pointer rounded-[5px] border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#E07B0C] bg-[#FFF8F2] ring-1 ring-[#E07B0C] shadow-xs'
                          : 'border-[#EDE4D9] bg-white hover:border-[#E07B0C]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="saved_address"
                        value={address.id}
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="h-4 w-4 text-[#E07B0C] focus:ring-[#E07B0C] mt-1 accent-[#E07B0C]"
                      />
                      <div className="ml-3.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#14361F]">{address.full_name}</span>
                          {address.is_default && (
                            <span className="bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3] text-[10px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A6458] mt-0.5 font-mono">{address.phone}</p>
                        <p className="text-xs text-[#4A3B32] mt-1 leading-relaxed">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}, {address.city}, {address.state} -{' '}
                          <strong>{address.postal_code}</strong>
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              /* New / Guest Address Form Fields */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="full_name" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-[#E07B0C]">*</span>
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all placeholder:text-[#9C8A7F]"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number <span className="text-[#E07B0C]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6458]">
                      +91
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={10}
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all tracking-wider font-mono placeholder:text-[#9C8A7F]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[#8C766E] font-normal lowercase">(for order tracking)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all placeholder:text-[#9C8A7F]"
                  />
                </div>

                {/* Address Line 1 */}
                <div className="sm:col-span-2">
                  <label htmlFor="address_line_1" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    House / Flat No., Building &amp; Street <span className="text-[#E07B0C]">*</span>
                  </label>
                  <input
                    id="address_line_1"
                    name="address_line_1"
                    type="text"
                    required
                    autoComplete="address-line1"
                    value={formData.address_line_1}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Royal Residency, M.G. Road"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all placeholder:text-[#9C8A7F]"
                  />
                </div>

                {/* Address Line 2 / Landmark */}
                <div className="sm:col-span-2">
                  <label htmlFor="address_line_2" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    Landmark / Area <span className="text-[#8C766E] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="address_line_2"
                    name="address_line_2"
                    type="text"
                    value={formData.address_line_2 || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Near City Hospital or Metro Pillar 45"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all placeholder:text-[#9C8A7F]"
                  />
                </div>

                {/* PIN Code (Drives Area & State selection) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="postal_code" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider">
                      6-Digit PIN Code <span className="text-[#E07B0C]">*</span>
                    </label>
                    {isVerifyingPincode && (
                      <span className="text-[11px] text-[#E07B0C] flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin text-[#E07B0C]" />
                        Verifying Postal Area...
                      </span>
                    )}
                  </div>
                  <div className="relative sm:w-1/2">
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 221001"
                      className={`w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 transition-all tracking-widest font-mono ${
                        pincodeStatus.status === 'valid'
                          ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white'
                          : pincodeStatus.status === 'invalid'
                          ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-white'
                          : 'border-[#EDE4D9] focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white'
                      }`}
                    />
                  </div>

                  {pincodeStatus.status === 'valid' && (
                    <p className="mt-2 text-xs font-medium text-[#144D29] bg-[#EBF3ED] border border-[#CFE3D3] p-2 rounded-[5px] flex items-center gap-1.5 animate-in fade-in duration-200">
                      <Check className="w-3.5 h-3.5 text-[#144D29] shrink-0" />
                      <span>Verified Postal Area: <strong>{pincodeStatus.location}</strong></span>
                    </p>
                  )}

                  {pincodeStatus.status === 'invalid' && (
                    <p className="mt-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 p-2 rounded-[5px] flex items-center gap-1.5 animate-in fade-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{pincodeStatus.message || 'Invalid Indian Postal PIN code. Please check.'}</span>
                    </p>
                  )}
                </div>

                {/* City / Area Dropdown (Official Postal Localities) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="city" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider">
                      City / Area / Town <span className="text-[#E07B0C]">*</span>
                    </label>
                    {availableLocalities.length > 0 && (
                      <span className="text-[10px] text-[#144D29] font-bold uppercase tracking-wider bg-[#EBF3ED] px-2 py-0.5 rounded-[5px] border border-[#CFE3D3]">
                        {availableLocalities.length} Localities
                      </span>
                    )}
                  </div>

                  {availableLocalities.length > 0 ? (
                    <div className="relative">
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full appearance-none px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#CFE3D3] bg-[#EBF3ED]/40 text-[#14361F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all pr-10 cursor-pointer shadow-2xs"
                      >
                        {availableLocalities.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#144D29] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={
                        isVerifyingPincode
                          ? 'Fetching official areas...'
                          : formData.postal_code.length === 6
                          ? 'Enter valid PIN above to select area'
                          : 'Enter 6-digit PIN code above first'
                      }
                      disabled={formData.postal_code.length < 6}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-[#9C8A7F]"
                    />
                  )}
                  {availableLocalities.length === 0 && formData.postal_code.length < 6 && (
                    <p className="mt-1 text-[11px] text-[#8C766E]">
                      💡 Enter your PIN code above to pick from verified official post offices.
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                    State <span className="text-[#E07B0C]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] focus:bg-white transition-all pr-10 cursor-pointer"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#7A6458] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── STEP 2: Payment Method ── */}
          <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-5 sm:p-7 shadow-[0_4px_20px_rgba(20,54,31,0.03)]">
            <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-[#EDE4D9] mb-5 sm:mb-6">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-[#14361F] text-[#E07B0C] font-bold text-xs sm:text-sm flex items-center justify-center shadow-2xs">
                2
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#14361F]">
                  Payment Method
                </h2>
                <p className="text-xs text-[#7A6458]">
                  Choose your preferred payment method
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Cash On Delivery (COD) Option */}
              <label
                className={`relative flex cursor-pointer rounded-[5px] border p-4 sm:p-5 transition-all duration-200 ${
                  paymentMethod === 'COD'
                    ? 'border-[#E07B0C] bg-[#FFF8F2] ring-1 ring-[#E07B0C] shadow-xs'
                    : 'border-[#EDE4D9] bg-white hover:border-[#E07B0C]/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="h-4 w-4 text-[#E07B0C] focus:ring-[#E07B0C] mt-1 accent-[#E07B0C]"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
                      <span className="font-bold text-[#14361F] text-xs sm:text-sm">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#144D29] bg-[#EBF3ED] border border-[#CFE3D3] px-2.5 py-0.5 rounded-[5px]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#615147] mt-1 leading-relaxed">
                    Pay in cash or via UPI directly to the delivery person upon arrival at your doorstep. Zero advance payment required!
                  </p>
                </div>
              </label>

              {/* Online Payment Option */}
              <label
                className={`relative flex cursor-pointer rounded-[5px] border p-4 sm:p-5 transition-all duration-200 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-[#E07B0C] bg-[#FFF8F2] ring-1 ring-[#E07B0C] shadow-xs'
                    : 'border-[#EDE4D9] bg-white hover:border-[#E07B0C]/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="h-4 w-4 text-[#E07B0C] focus:ring-[#E07B0C] mt-1 accent-[#E07B0C]"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#14361F]" />
                      <span className="font-bold text-[#14361F] text-xs sm:text-sm">
                        Online Payment (UPI, Cards, NetBanking)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#7A6458] bg-[#FAF7F2] border border-[#EDE4D9] px-2 py-0.5 rounded-[5px]">
                      Razorpay 100% Secure
                    </span>
                  </div>
                  <p className="text-xs text-[#615147] mt-1 leading-relaxed">
                    Pay securely using Google Pay, PhonePe, Paytm, BHIM UPI, Debit/Credit Card, or NetBanking.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* ── Right Column: Order Summary (Col 5, Sticky Desktop) ── */}
      <div className="lg:col-span-5 relative mt-8 lg:mt-0">
        <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-5 sm:p-7 shadow-[0_4px_20px_rgba(20,54,31,0.03)] sticky top-24 z-20 space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE4D9]">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">
              Order Summary
            </h2>
            <span className="text-xs font-bold text-[#7A6458] bg-[#FAF7F2] px-2 py-0.5 rounded-[5px] border border-[#EDE4D9]">
              {initialItems.length} {initialItems.length === 1 ? 'pack' : 'packs'}
            </span>
          </div>

          {/* Free Shipping Alert Bar */}
          {!isFreeShipping ? (
            <div className="p-3 bg-[#FFF8F2] rounded-[5px] border border-[#E07B0C]/30 text-xs text-[#C86A08] flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span>
                Add <strong>₹{amountNeededForFreeShipping}</strong> more to qualify for <strong>FREE Delivery</strong>!
              </span>
            </div>
          ) : (
            <div className="p-3 bg-[#EBF3ED] rounded-[5px] border border-[#CFE3D3] text-xs text-[#144D29] flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                🎉 You have unlocked <strong>FREE Doorstep Delivery</strong>!
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="max-h-70 overflow-y-auto divide-y divide-[#EDE4D9] pr-6">
            {initialItems.map((item) => {
              const variant = item.product_variants
              const product = variant?.products
              const imageUrl = product?.featured_image_url || '/images/products/red-chilli-powder.png'

              return (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-[5px] overflow-hidden bg-[#FAF6F0] border border-[#EDE4D9] shrink-0 flex items-center justify-center">
                    <Image
                      src={imageUrl}
                      alt={product?.name || 'Spice product'}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#14361F] truncate">
                      {product?.name || 'Pure Spice'}
                    </p>
                    <p className="text-[11px] text-[#7A6458]">
                      {variant?.variant_name} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#E07B0C] shrink-0">
                    ₹{Number(variant?.price || 0) * Number(item.quantity || 1)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-3.5 border-t border-[#EDE4D9] text-xs sm:text-sm text-[#615147]">
            <div className="flex justify-between items-center">
              <span>Items Subtotal</span>
              <span className="font-bold text-[#14361F]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span>Delivery Charges</span>
                <Truck className="w-3.5 h-3.5 text-[#7A6458]" />
              </span>
              {isFreeShipping ? (
                <span className="px-2 py-0.5 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[11px] font-extrabold text-[#144D29] uppercase tracking-wide">
                  FREE
                </span>
              ) : (
                <span className="font-bold text-[#14361F]">₹{SHIPPING_COST}</span>
              )}
            </div>

            <div className="pt-3 border-t border-[#EDE4D9] flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-[#14361F]">Total Amount</span>
                <p className="text-[10px] text-[#8C766E]">Inclusive of all taxes</p>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#14361F]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            form="checkout-form"
            disabled={isPlacingOrder}
            className="w-full py-3.5 sm:py-4 rounded-[5px] font-bold text-sm sm:text-base text-white bg-[#E07B0C] hover:bg-[#C86A08] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>
                  {paymentMethod === 'COD'
                    ? `Confirm Order (COD) • ₹${total.toLocaleString('en-IN')}`
                    : `Pay Online • ₹${total.toLocaleString('en-IN')}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Back to Cart link */}
          <div className="text-center pt-1">
            <Link
              href="/cart"
              className="text-xs font-bold text-[#7A6458] hover:text-[#E07B0C] transition-colors inline-flex items-center gap-1"
            >
              <span>Return to cart to modify items</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-3.5 border-t border-[#EDE4D9] space-y-2 text-[11px] sm:text-xs text-[#615147]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Pure, Cold-Ground, Chemical-Free Spices</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E07B0C] shrink-0" />
              <span>Cash on Delivery Available Across India</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>256-Bit SSL Encrypted &amp; Secure Checkout</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
