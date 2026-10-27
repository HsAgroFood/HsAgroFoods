import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/userAuth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Package, ShieldCheck, ArrowRight, UserCheck, Sparkles } from 'lucide-react'
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
    <div className="space-y-6">
      
      {/* 👑 Top Welcome & Account Overview Card */}
      <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD5] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌿</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F]">
                Personal Profile & Details
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#8C7567]">
              Manage your personal information, mobile contact, and default delivery preferences.
            </p>
          </div>
        </div>

        {/* 3 Quick Stat Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-6">
          <Link
            href="/account/orders"
            className="p-4 rounded-2xl bg-[#FDF9F3] border border-[#E8DFD5] hover:border-[#E07B0C]/40 transition-colors group"
          >
            <div className="flex items-center gap-2 text-[#E07B0C] mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7567]">Orders Placed</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#14361F] group-hover:text-[#E07B0C] transition-colors">
              {ordersCount || 0}
            </p>
          </Link>

          <Link
            href="/account/addresses"
            className="p-4 rounded-2xl bg-[#FDF9F3] border border-[#E8DFD5] hover:border-[#E07B0C]/40 transition-colors group"
          >
            <div className="flex items-center gap-2 text-[#E07B0C] mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7567]">Saved Addresses</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#14361F] group-hover:text-[#E07B0C] transition-colors">
              {defaultAddress ? 'Configured' : 'None yet'}
            </p>
          </Link>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#FDF9F3] border border-[#E8DFD5]">
            <div className="flex items-center gap-2 text-[#E07B0C] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#F09819]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7567]">Security</span>
            </div>
            <p className="text-sm font-bold text-emerald-800">
              Verified User ✦
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left (Profile Form) + Right (Address & Shortcuts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Edit Profile Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD5] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6 border-b border-[#E8DFD5] pb-4">
            <UserCheck className="w-5 h-5 text-[#E07B0C]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#14361F]">
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
        <div className="lg:col-span-5 space-y-6">
          
          {/* Primary Address Snapshot Box */}
          <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4 border-b border-[#E8DFD5] pb-3">
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
              <div className="p-4 rounded-2xl bg-[#FDF9F3] border border-[#E8DFD5] text-xs text-[#5A433B] space-y-1">
                <p className="font-bold text-sm text-[#14361F]">{defaultAddress.full_name}</p>
                <p>{defaultAddress.address_line_1}</p>
                {defaultAddress.address_line_2 && <p>{defaultAddress.address_line_2}</p>}
                <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postal_code}</p>
                <p className="pt-1.5 font-semibold text-[#14361F]">Phone: {defaultAddress.phone}</p>
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-[#FDF9F3] rounded-2xl border border-dashed border-[#E8DFD5]">
                <p className="text-xs text-[#8C7567] mb-3">No delivery address saved yet.</p>
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E07B0C] text-white text-xs font-bold rounded-full hover:bg-[#2D1409] transition-colors shadow-xs"
                >
                  <span>+ Add Delivery Address</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Helpful Shortcuts */}
          <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C7567] mb-3">
              Quick Shortcuts
            </h3>
            <div className="divide-y divide-[#F2E8DC] text-xs">
              <Link
                href="/account/orders"
                className="flex items-center justify-between py-2.5 text-[#14361F] hover:text-[#E07B0C] font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F09819]" />
                  <span>Track Package Delivery</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/shop"
                className="flex items-center justify-between py-2.5 text-[#14361F] hover:text-[#E07B0C] font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F09819]" />
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
