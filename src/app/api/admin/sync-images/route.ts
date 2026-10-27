import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Ensure 3 core categories exist
    for (const cat of FALLBACK_CATEGORIES) {
      await supabase
        .from('categories')
        .upsert(
          {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
    }

    const { data: dbCategories } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap: Record<string, string> = {}
    for (const c of dbCategories || []) {
      categoryMap[c.slug] = c.id
    }

    // 2. Sync all 14 HS AgroFoods products
    for (const prod of Object.values(FALLBACK_PRODUCTS)) {
      const categoryId = categoryMap[prod.categories.slug] || null
      await supabase
        .from('products')
        .upsert(
          {
            category_id: categoryId,
            name: prod.name,
            slug: prod.slug,
            short_description: prod.short_description,
            description: prod.description,
            featured_image_url: prod.featured_image_url,
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            use_global_faqs: prod.use_global_faqs,
          },
          { onConflict: 'slug' }
        )
    }

    revalidatePath('/shop')
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
