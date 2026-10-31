import { createClient } from '@/lib/supabase/server'
import { LogOut, User } from 'lucide-react'
import { logout } from '@/actions/auth'
import { MobileMenuTrigger } from './MobileMenuTrigger'

export default async function AdminHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="h-16 bg-white border-b border-[#EDE4D9] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <MobileMenuTrigger />
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#14361F] truncate">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Admin user info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] flex items-center justify-center text-[#144D29]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-bold text-[#14361F] leading-tight">
              {user?.email || 'Admin'}
            </p>
            <p className="text-[11px] text-[#7A6458]">Administrator</p>
          </div>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs sm:text-sm font-semibold text-[#7A6458] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  )
}
