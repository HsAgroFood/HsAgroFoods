import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { isAdminAuthenticated } from '@/lib/adminAuth'

import { AdminNavProvider } from '@/contexts/AdminNavContext'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <AdminNavProvider>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminNavProvider>
  )
}
