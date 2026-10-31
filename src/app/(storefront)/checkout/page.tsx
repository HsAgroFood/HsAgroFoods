import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { redirect } from 'next/navigation'
import { getCart } from '@/actions/cart'
import { getShippingConfig } from '@/actions/shipping'
import { CheckoutClient } from './_components/CheckoutClient'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Secure Checkout | HS AgroFoods',
  description: 'Complete your order of 100% pure authentic spices and natural dehydrated powders.',
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const user = await getEffectiveUser()

  // Get Cart & Shipping Configuration in parallel
  const [{ items }, shippingConfig] = await Promise.all([
    getCart(),
    getShippingConfig(),
  ])

  if (!items || items.length === 0) {
    redirect('/cart')
  }

  // Get Addresses if authenticated
  let addresses = []
  if (user) {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) addresses = data
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] pb-12 sm:pb-16 relative overflow-x-clip">
      {/* ── Ambient Background Lighting Gradients (Matching Home Page) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 5%, rgba(240, 152, 25, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 92% 12%, rgba(224, 123, 12, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 5% 40%, rgba(20, 77, 41, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Right Accent Spices */}
      <div className="absolute top-0 right-0 w-36 h-36 sm:w-56 sm:h-56 lg:w-80 lg:h-80 pointer-events-none select-none mix-blend-multiply opacity-75 z-0">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spice Leaves Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 144px, 320px"
          priority={false}
        />
      </div>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A6458] mb-6 sm:mb-8">
          <Link href="/" className="hover:text-[#E07B0C] transition-colors">
            Home
          </Link>
          <span className="text-[#BBA89B]">/</span>
          <Link href="/cart" className="hover:text-[#E07B0C] transition-colors">
            Cart
          </Link>
          <span className="text-[#BBA89B]">/</span>
          <span className="text-[#14361F] font-bold">Secure Checkout</span>
        </nav>

        {/* ── Modern Hero Header (Home Page Typography & Style) ── */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto mb-8 sm:mb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#144D29]" />
            <span>100% PURE &amp; SECURE CHECKOUT</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#14361F]">
            Complete Your Order
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm sm:text-base text-[#615147] max-w-xl mx-auto leading-relaxed">
            Fast doorstep delivery across India. Pay with Cash on Delivery (COD) or Instant UPI / Cards.
          </p>
        </div>

        <CheckoutClient 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialItems={items as any[]} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addresses={addresses as any[]} 
          isAuthenticated={!!user}
          userEmail={user?.email || ''}
          shippingConfig={shippingConfig}
        />
      </div>
    </div>
  )
}
