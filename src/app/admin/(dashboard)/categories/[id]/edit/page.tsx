import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CategoryForm from '../../_components/CategoryForm'

export const metadata: Metadata = {
  title: 'Edit Category',
}

export const dynamic = 'force-dynamic'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Edit Category</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Update &quot;{category.name}&quot;
        </p>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}
