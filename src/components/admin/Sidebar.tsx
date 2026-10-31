'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Image as ImageIcon,
  Megaphone,
  Truck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from 'lucide-react'
import { useAdminNav } from '@/contexts/AdminNavContext'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Hero Slides', href: '/admin/hero-slides', icon: ImageIcon },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Delivery Settings', href: '/admin/delivery-settings', icon: Truck },
  { label: 'Global FAQs', href: '/admin/global-faqs', icon: HelpCircle },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useAdminNav()

  return (
    <>
      {/* Mobile Backdrop Overlay (Soft forest overlay, no pitch black) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#14361F]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside (Clean modern warm aesthetic, zero pitch black) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#EDE4D9] transition-all duration-300 ease-in-out shrink-0 shadow-xs
          lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
          w-72 max-w-[85vw]
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#EDE4D9] shrink-0 bg-[#FAF7F2]/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative w-9 h-9 rounded-[5px] overflow-hidden border border-[#EDE4D9] shrink-0 shadow-2xs bg-[#FAF6F0] flex items-center justify-center p-0.5">
              <Image
                src="/images/logo.png"
                alt="HS AgroFoods Logo"
                fill
                className="object-contain p-0.5"
                sizes="36px"
              />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <p className="font-serif text-[#14361F] font-bold text-sm leading-tight truncate">
                  HS AgroFoods
                </p>
                <p className="text-[#E07B0C] text-[11px] font-semibold tracking-wider uppercase truncate">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#7A6458] hover:text-[#14361F] rounded-[5px] hover:bg-[#FAF7F2] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#FFF8F2] text-[#E07B0C] border-l-4 border-[#E07B0C] shadow-2xs'
                    : 'text-[#615147] hover:text-[#14361F] hover:bg-[#FAF7F2]'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isActive
                      ? 'text-[#E07B0C]'
                      : 'text-[#8C766E] group-hover:text-[#14361F]'
                  }`}
                />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:block p-3 border-t border-[#EDE4D9] bg-[#FAF7F2]/40">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[5px] text-[#7A6458] hover:text-[#14361F] hover:bg-[#FAF7F2] border border-transparent hover:border-[#EDE4D9] transition-all duration-200 text-xs font-semibold"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
