import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { redirect } from 'next/navigation'
import { AccountNav } from '@/components/storefront/AccountNav'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const effectiveUser = await getEffectiveUser()
  const hasAdminCookie = await isAdminAuthenticated()

  if (!effectiveUser && !hasAdminCookie) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  let profile: any = null

  if (effectiveUser) {
    profile = {
      full_name: effectiveUser.full_name,
      email: effectiveUser.email,
      role: effectiveUser.role,
    }
  } else if (hasAdminCookie) {
    const { data } = await adminClient
      .from('profiles')
      .select('full_name, email, role')
      .eq('role', 'admin')
      .maybeSingle()
    profile = data || {
      full_name: 'Store Administrator',
      email: 'admin@hsagrofoods.com',
      role: 'admin',
    }
  }

  const isAdmin = profile?.role === 'admin'
  const initials = (profile?.full_name || 'Customer')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="bg-[#FBF5EE] min-h-[calc(100vh-80px)] py-8 sm:py-12 text-[#14361F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0 space-y-5">
            {/* User Profile Summary Card */}
            <div className="bg-white rounded-3xl border border-[#E8DFD5] p-6 shadow-xs text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E07B0C] to-[#D1491B] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-[#E07B0C]/20 shrink-0 border-2 border-[#F09819]/40">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg font-bold text-[#14361F] truncate">
                    {profile?.full_name || 'Customer'}
                  </h2>
                  <p className="text-xs text-[#8C7567] truncate mt-0.5">{profile?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-[#FDF9F3] border border-[#E8DFD5] text-[10px] font-bold text-[#E07B0C] uppercase tracking-wider">
                    <span>✦</span>
                    <span>{isAdmin ? 'Store Admin' : 'Verified Member'}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Account Navigation Tabs */}
            <nav className="bg-white rounded-3xl border border-[#E8DFD5] overflow-hidden shadow-xs">
              <AccountNav />
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9">
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}
