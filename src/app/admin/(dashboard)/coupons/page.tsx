import { createAdminClient } from '@/lib/supabase/admin'
import { REAL_ORDER_FILTER } from '@/lib/orderVisibility'
import { CouponsManager, type CouponListItem } from './_components/CouponsManager'

export const metadata = {
  title: 'Coupons | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  // The table is created by supabase/migrations/20261101050000_coupons.sql
  const tableMissing = !!error && (error.code === '42P01' || /coupons/i.test(error.message))

  const usage = new Map<string, { used: number; discount: number }>()
  if (!error) {
    const { data: redeemed } = await supabase
      .from('orders')
      .select('coupon_code, discount_amount')
      .not('coupon_code', 'is', null)
      .neq('order_status', 'cancelled')
      .or(REAL_ORDER_FILTER)
      .limit(10000)

    for (const row of redeemed || []) {
      const entry = usage.get(row.coupon_code) || { used: 0, discount: 0 }
      entry.used += 1
      entry.discount += Number(row.discount_amount) || 0
      usage.set(row.coupon_code, entry)
    }
  }

  const coupons: CouponListItem[] = (data || []).map((c) => ({
    id: c.id,
    code: c.code,
    discount_type: c.discount_type,
    discount_value: Number(c.discount_value),
    min_order_amount: Number(c.min_order_amount) || 0,
    usage_limit: c.usage_limit,
    per_customer_limit: c.per_customer_limit,
    is_public: c.is_public !== false,
    starts_at: c.starts_at,
    expires_at: c.expires_at,
    is_active: c.is_active,
    used: usage.get(c.code)?.used || 0,
    discountGiven: usage.get(c.code)?.discount || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Coupons</h1>
        <p className="text-sm text-stone-500 mt-1">
          Create discount codes customers can apply in the cart. Every code is checked on the server at checkout.
        </p>
      </div>

      {tableMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-bold">One-time database setup needed</p>
          <p className="mt-1">
            The <code className="font-mono">coupons</code> table does not exist yet. Run{' '}
            <code className="font-mono">supabase/migrations/20261101050000_coupons.sql</code> in the Supabase SQL
            editor, then refresh this page.
          </p>
        </div>
      ) : (
        <CouponsManager initialCoupons={coupons} />
      )}
    </div>
  )
}
