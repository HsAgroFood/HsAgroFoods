import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { redirect } from 'next/navigation'
import { AccountNav } from '@/components/storefront/AccountNav'
import { logout } from '@/actions/auth'
import { LogOut } from 'lucide-react'

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
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CU'

  return (
    <div className="bg-[#FBF5EE] min-h-[calc(100vh-80px)] py-4 sm:py-8 lg:py-10 text-[#14361F]">
      <div className="max-w-[1310px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 mb-4 sm:mb-6 lg:mb-0 space-y-3 sm:space-y-4 lg:space-y-5">
            {/* User Profile Summary Card */}
            <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-3.5 sm:p-5 lg:p-6 shadow-xs">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-tr from-[#E07B0C] to-[#D1491B] text-white flex items-center justify-center font-serif text-base sm:text-lg lg:text-xl font-bold shadow-md shadow-[#E07B0C]/20 shrink-0 border-2 border-[#F09819]/40">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-[#14361F] truncate">
                    {profile?.full_name || 'Customer'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#8C7567] truncate mt-0.5">{profile?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-[#FDF9F3] border border-[#E8DFD5] text-[9px] sm:text-[10px] font-bold text-[#E07B0C] uppercase tracking-wider">
                    <span>✦</span>
                    <span>{isAdmin ? 'Store Admin' : 'Verified Member'}</span>
                  </span>
                </div>

                {/* Mobile only: the desktop sidebar has its own Sign Out row */}
                <form action={logout} className="lg:hidden shrink-0">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-[5px] border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Account Navigation Tabs */}
            <nav className="bg-white rounded-[5px] border border-[#E8DFD5] shadow-xs">
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
