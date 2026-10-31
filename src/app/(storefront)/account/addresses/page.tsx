import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { redirect } from 'next/navigation'
import { AddressList } from './_components/AddressList'

export const metadata = {
  title: 'My Addresses | HS AgroFoods',
}

export const dynamic = 'force-dynamic'

export default async function AccountAddressesPage() {
  const user = await getEffectiveUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  const { data: addresses } = await adminClient
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white rounded-[5px] border border-[#E8DFD5] p-3.5 sm:p-6 lg:p-8 shadow-xs min-h-full">
      <AddressList addresses={addresses || []} />
    </div>
  )
}
