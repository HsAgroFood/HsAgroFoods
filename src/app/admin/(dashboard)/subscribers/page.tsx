import { createAdminClient } from '@/lib/supabase/admin'
import { SubscribersList, type Subscriber } from './_components/SubscribersList'

export const metadata = {
  title: 'Subscribers | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminSubscribersPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  // The table is created by supabase/migrations/20261101070000_newsletter_subscribers.sql
  const tableMissing = !!error && (error.code === '42P01' || /newsletter_subscribers/i.test(error.message))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Subscribers</h1>
        <p className="text-sm text-stone-500 mt-1">
          Emails collected from the &quot;Join Purity Club&quot; box on the website. Copy or download them to send your offers.
        </p>
      </div>

      {tableMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-bold">One-time database setup needed</p>
          <p className="mt-1">
            Run <code className="font-mono">supabase/migrations/20261101070000_newsletter_subscribers.sql</code> in the
            Supabase SQL editor, then refresh this page. New sign-ups are still saved in the meantime (under Inquiries).
          </p>
        </div>
      ) : (
        <SubscribersList initialSubscribers={(data || []) as Subscriber[]} />
      )}
    </div>
  )
}
