'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, MapPin, Package, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

export function AccountNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  const links = [
    { name: 'Profile', href: '/account', icon: User },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Orders', href: '/account/orders', icon: Package },
  ]

  return (
    <div className="flex flex-row lg:flex-col overflow-x-auto no-scrollbar p-1.5 lg:p-0 lg:divide-y lg:divide-[#F2E8DC] gap-1.5 lg:gap-0">
      {links.map((link) => {
        const Icon = link.icon
        const isActive =
          link.href === '/account'
            ? pathname === '/account'
            : pathname === link.href || pathname.startsWith(link.href + '/')

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-4 text-xs sm:text-sm font-bold whitespace-nowrap rounded-[5px] lg:rounded-none transition-all shrink-0 ${
              isActive
                ? 'bg-[#E07B0C] lg:bg-[#FDF9F3] text-white lg:text-[#E07B0C] shadow-xs lg:shadow-none lg:border-l-4 lg:border-l-[#E07B0C] lg:pl-5'
                : 'text-[#5A433B] hover:bg-[#FAF3EB] hover:text-[#E07B0C] lg:border-l-4 lg:border-l-transparent lg:pl-5'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                isActive ? 'text-white lg:text-[#E07B0C]' : 'text-[#8C7567]'
              }`}
            />
            <span>{link.name}</span>
          </Link>
        )
      })}

      <button
        onClick={handleLogout}
        type="button"
        className="hidden lg:flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-4 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50/70 hover:bg-rose-100 lg:bg-transparent lg:hover:bg-rose-50 transition-colors rounded-[5px] lg:rounded-none lg:border-l-4 lg:border-l-transparent lg:pl-5 shrink-0 ml-auto lg:ml-0 lg:w-full text-left cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  )
}
