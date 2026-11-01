import { getAllReels } from '@/actions/admin/reels'
import { MAX_REELS } from '@/lib/reels'
import { ReelsManager } from './_components/ReelsManager'

export const metadata = {
  title: 'Reels | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminReelsPage() {
  const { reels, tableMissing } = await getAllReels()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Homepage Reels</h1>
        <p className="text-sm text-stone-500 mt-1">
          Upload up to {MAX_REELS} short vertical videos with a caption. They appear as a reels carousel on the homepage.
        </p>
      </div>

      {tableMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-bold">One-time database setup needed</p>
          <p className="mt-1">
            The <code className="font-mono">reels</code> table does not exist yet. Run{' '}
            <code className="font-mono">supabase/migrations/20261101080000_home_reels.sql</code> in the Supabase SQL
            editor, then refresh this page.
          </p>
        </div>
      ) : (
        <ReelsManager initialReels={reels} />
      )}
    </div>
  )
}
