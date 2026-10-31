import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowRight, Truck, ShieldCheck, Check, CreditCard, Banknote } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { isValidReceiptToken } from '@/lib/receiptToken'
import { describeRazorpayMethod } from '@/lib/razorpay'
import CopyText from '@/components/storefront/CopyText'

export const metadata = {
  title: 'Order Confirmed | HS AgroFoods',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const orderNumber = resolvedParams.order_number as string
  const receiptToken = typeof resolvedParams.t === 'string' ? resolvedParams.t : undefined

  // Payment details are only shown to whoever just paid (signed receipt token), the order's owner, or an admin
  let payment: {
    isCod: boolean
    total: number
    paid: boolean
    paymentId: string | null
    method: string | null
    paidAt: string | null
  } | null = null

  if (orderNumber) {
    const { data: order } = await createAdminClient()
      .from('orders')
      .select('total_amount, payment_method, payment_status, razorpay_payment_id, paid_at, user_id, shipping_address')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (order) {
      let allowed = isValidReceiptToken(orderNumber, receiptToken)
      if (!allowed) {
        const [user, isAdmin] = await Promise.all([getEffectiveUser(), isAdminAuthenticated()])
        const ownerEmail = String(order.shipping_address?.email || '').trim().toLowerCase()
        allowed =
          isAdmin ||
          (!!user && (order.user_id === user.id || (!!ownerEmail && ownerEmail === user.email.trim().toLowerCase())))
      }

      if (allowed) {
        const isCod = /cash on delivery/i.test(order.payment_method || '')

        // Ask Razorpay how the customer paid (UPI / card / ...); never blocks the page
        const method = !isCod && order.razorpay_payment_id ? await describeRazorpayMethod(order.razorpay_payment_id) : null

        payment = {
          isCod,
          total: Number(order.total_amount),
          paid: order.payment_status === 'paid',
          paymentId: order.razorpay_payment_id || null,
          method,
          paidAt: order.paid_at || null,
        }
      }
    }
  }

  return (
    <div className="bg-[#FAF7F2] py-16 sm:py-24 min-h-screen flex items-center justify-center relative overflow-x-clip">
      {/* ── Ambient Background Lighting Gradients ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(240, 152, 25, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 92% 15%, rgba(224, 123, 12, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 8% 85%, rgba(20, 77, 41, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-[5px] border border-[#EDE4D9] p-7 sm:p-10 text-center shadow-[0_4px_24px_rgba(20,54,31,0.05)]">
          
          {/* Brand Logo & Success Badge */}
          <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
            <div className="w-20 h-20 rounded-[5px] overflow-hidden border border-[#EDE4D9] bg-[#FAF6F0] shadow-xs flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="HS AgroFoods Logo"
                width={64}
                height={64}
                className="object-contain p-1"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-[5px] bg-[#144D29] text-white flex items-center justify-center shadow-md ring-2 ring-white">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Success Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#144D29]" />
            <span>ORDER PLACED SUCCESSFULLY</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14361F] mb-2">
            Thank You for Your Order!
          </h1>
          
          <p className="text-[#615147] text-xs sm:text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Your order for 100% pure authentic Indian spices &amp; natural dehydrated powders has been received and is being prepared with utmost hygiene and care.
          </p>

          {orderNumber && (
            <div className="bg-[#FAF7F2] border border-[#EDE4D9] rounded-[5px] p-4 mb-6 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-[#7A6458] uppercase tracking-widest mb-1">
                Order Reference Number
              </span>
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-[#14361F] tracking-wider">
                {orderNumber}
              </span>
            </div>
          )}

          {/* Payment details */}
          {payment && (
            <div className="bg-white border border-[#EDE4D9] rounded-[5px] p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                {payment.isCod ? (
                  <Banknote className="w-4 h-4 text-[#E07B0C]" />
                ) : (
                  <CreditCard className="w-4 h-4 text-[#E07B0C]" />
                )}
                <span className="text-[11px] font-bold text-[#7A6458] uppercase tracking-widest">Payment details</span>
              </div>

              <dl className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#8C7567]">Status</dt>
                  <dd>
                    {payment.isCod ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        Pay on delivery
                      </span>
                    ) : payment.paid ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] font-bold">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        Confirming payment
                      </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#8C7567]">{payment.isCod ? 'Amount to pay' : 'Amount'}</dt>
                  <dd className="font-extrabold text-[#E07B0C]">₹{payment.total.toLocaleString('en-IN')}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#8C7567]">Method</dt>
                  <dd className="font-semibold text-[#14361F] text-right">
                    {payment.isCod ? 'Cash on Delivery' : payment.method ? `${payment.method} (Razorpay)` : 'Online (Razorpay)'}
                  </dd>
                </div>

                {payment.paidAt && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#8C7567]">Paid on</dt>
                    <dd className="font-semibold text-[#14361F] text-right">
                      {new Date(payment.paidAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </dd>
                  </div>
                )}

                {payment.paymentId && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[#8C7567] shrink-0">Payment ID</dt>
                    <dd className="text-right min-w-0">
                      <CopyText value={payment.paymentId} />
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Delivery Note */}
          <div className="p-3.5 bg-[#EBF3ED] border border-[#CFE3D3] rounded-[5px] mb-8 flex items-center gap-3 text-left">
            <Truck className="w-5 h-5 text-[#144D29] shrink-0" />
            <p className="text-xs text-[#144D29] leading-relaxed">
              <strong>Doorstep Delivery:</strong> Your freshly packed spices will be dispatched soon. Expected delivery is within 2 to 4 working days across India.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold text-xs sm:text-sm rounded-[5px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#14361F] font-bold text-xs sm:text-sm rounded-[5px] border border-[#EDE4D9] hover:border-[#14361F]/40 hover:bg-[#FAF7F2] transition-all"
            >
              <Package className="w-4 h-4 text-[#14361F]" />
              <span>View My Orders</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
