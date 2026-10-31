import { createAdminClient } from '@/lib/supabase/admin'
import { OrdersTable } from './_components/OrdersTable'
import { syncOrderStatusesFromIthink } from '@/lib/ithink'

export const metadata = {
  title: 'Orders | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()

  // Fetch all orders from DB
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin orders:', error?.message || error)
  }

  // Refresh shipped/delivered status from the courier (throttled to once a minute)
  const syncPatches = await syncOrderStatusesFromIthink(orders || [], 'admin:all')
  for (const order of orders || []) Object.assign(order, syncPatches[order.id] || {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">Manage and track all store orders.</p>
        </div>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  )
}
