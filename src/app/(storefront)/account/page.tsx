import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/userAuth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Package, ShieldCheck, ArrowRight, UserCheck, Store } from 'lucide-react'
import { ProfileForm } from './_components/ProfileForm'

export const metadata = {
  title: 'My Profile & Details | HS AgroFoods',
  description: 'Manage your personal details, contact number, and delivery settings.',
}

export default async function AccountProfilePage() {
  const directUser = await getAuthUser()
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  const activeUserId = directUser?.id || supabaseUser?.id

  if (!activeUserId) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // 1. Fetch Profile
  let profile: any = null
  if (directUser) {
    const { data: dbUser } = await adminClient
      .from('users')
      .select('*')
      .eq('id', directUser.id)
      .maybeSingle()

    if (dbUser) {
      profile = dbUser
    } else {
      const { data: dbProfile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', directUser.id)
        .maybeSingle()
      profile = dbProfile || {
        full_name: directUser.full_name,
        email: directUser.email,
        phone: '',
      }
    }
  } else if (supabaseUser) {
    const { data: dbProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle()
    profile = dbProfile
  }

  // 2. Fetch Primary Address
  const { data: defaultAddress } = await adminClient
    .from('addresses')
    .select('*')
    .eq('user_id', activeUserId)
    .order('is_default', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 3. Fetch Orders Count
  const userEmail = (directUser?.email || supabaseUser?.email || '').trim().toLowerCase()
  const { data: userOrders } = await adminClient
    .from('orders')
    .select('id, user_id, shipping_address')

  const ordersCount = (userOrders || []).filter(o => 
    (activeUserId && o.user_id === activeUserId) || 
    (userEmail && o.shipping_address?.email?.trim().toLowerCase() === userEmail)
  ).length

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* 👑 Top Welcome & Account Overview Card */}
      <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD5] pb-4 sm:pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg sm:text-xl">🌿</span>
              <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-[#14361F]">
                Personal Profile & Details
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#8C7567]">
              Manage your personal information, mobile contact, and delivery settings.
            </p>
          </div>
        </div>

        {/* 3 Quick Stat Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-4 sm:pt-6">
          <Link
            href="/account/orders"
            className="p-3 sm:p-4 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5] hover:border-[#E07B0C]/40 transition-colors group"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#E07B0C] mb-1">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8C7567] truncate">Orders</span>
            </div>
            <p className="text-lg sm:text-[22px] font-extrabold text-[#14361F] group-hover:text-[#E07B0C] transition-colors mt-1 sm:mt-2">
              {ordersCount || 0}
            </p>
          </Link>

          <Link
            href="/account/addresses"
            className="p-3 sm:p-4 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5] hover:border-[#E07B0C]/40 transition-colors group"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#E07B0C] mb-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8C7567] truncate">Addresses</span>
            </div>
            <p className="text-lg sm:text-[22px] font-extrabold text-[#14361F] group-hover:text-[#E07B0C] transition-colors mt-1 sm:mt-2">
              {defaultAddress ? 'Saved' : 'None'}
            </p>
          </Link>

          <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5]">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#E07B0C] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F09819] shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8C7567]">Security</span>
            </div>
            <p className="text-sm sm:text-base lg:text-[18px] font-bold text-emerald-800 mt-1 sm:mt-2 flex items-center gap-1">
              <span>Verified</span>
              <span className="text-xs">✦</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left (Profile Form) + Right (Address & Shortcuts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left Column: Edit Profile Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[5px] border border-[#E8DFD5] p-4 sm:p-6 lg:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 border-b border-[#E8DFD5] pb-3 sm:pb-4">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
            <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#14361F]">
              Edit Profile Information
            </h2>
          </div>

          <ProfileForm 
            initialFullName={profile?.full_name || directUser?.full_name || ''} 
            initialPhone={profile?.phone || ''}
            email={profile?.email || directUser?.email || supabaseUser?.email || ''} 
          />
        </div>

        {/* Right Column: Default Delivery Address & Quick Links (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Primary Address Snapshot Box */}
          <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-4 sm:p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 border-b border-[#E8DFD5] pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E07B0C]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14361F]">
                  Default Delivery Address
                </h3>
              </div>
              <Link
                href="/account/addresses"
                className="text-xs font-bold text-[#E07B0C] hover:underline"
              >
                Manage →
              </Link>
            </div>

            {defaultAddress ? (
              <div className="p-3.5 sm:p-4 rounded-[5px] bg-[#FDF9F3] border border-[#E8DFD5] text-xs text-[#5A433B] space-y-1">
                <p className="font-bold text-sm text-[#14361F]">{defaultAddress.full_name}</p>
                <p className="leading-relaxed">{defaultAddress.address_line_1}</p>
                {defaultAddress.address_line_2 && <p className="leading-relaxed">{defaultAddress.address_line_2}</p>}
                <p className="font-medium text-[#14361F]">{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postal_code}</p>
                <p className="pt-1 font-semibold text-[#14361F]">Phone: {defaultAddress.phone}</p>
              </div>
            ) : (
              <div className="text-center py-5 px-3 bg-[#FDF9F3] rounded-[5px] border border-dashed border-[#E8DFD5]">
                <p className="text-xs text-[#8C7567] mb-3">No delivery address saved yet.</p>
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E07B0C] text-white text-xs font-bold rounded-[5px] hover:bg-[#2D1409] transition-colors shadow-xs"
                >
                  <span>+ Add Delivery Address</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Helpful Shortcuts */}
          <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-4 sm:p-5 lg:p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C7567] mb-2 sm:mb-3">
              Quick Shortcuts
            </h3>
            <div className="divide-y divide-[#F2E8DC] text-xs">
              <Link
                href="/account/orders"
                className="flex items-center justify-between py-2.5 text-[#14361F] hover:text-[#E07B0C] font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#F09819]" />
                  <span>Track Package Delivery</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/shop"
                className="flex items-center justify-between py-2.5 text-[#14361F] hover:text-[#E07B0C] font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-[#F09819]" />
                  <span>Browse Fresh Spices</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
