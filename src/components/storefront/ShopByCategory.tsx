import Link from 'next/link'
import { ArrowRight, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CATEGORIES } from '@/constants/fallbackProducts'
import { CategoryCarousel, type CategoryCardData } from '@/components/storefront/CategoryCarousel'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'

async function getCategoryCards(): Promise<CategoryCardData[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, image_url, products(id, is_active)')
      .eq('is_active', true)
      .order('name')

    if (error || !data || data.length === 0) throw new Error('no categories')

    return data.map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      imageUrl: (c.image_url as string | null) || null,
      productCount: ((c.products as { is_active: boolean }[] | null) || []).filter((p) => p.is_active).length,
    }))
  } catch {
    return FALLBACK_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: null,
      productCount: null,
    }))
  }
}

export async function ShopByCategory({ content = HOME_DEFAULTS.shopByCategory }: { content?: HomeContent['shopByCategory'] }) {
  const categories = await getCategoryCards()
  if (categories.length === 0) return null


  return (
    <section id="shop-by-category" className="relative z-20 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1330px] px-2.5 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-7 flex flex-col items-center gap-3 text-center sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE4D4] bg-[#EAF3EC] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#144D29] sm:text-xs">
              <Leaf className="h-3.5 w-3.5" />
              <span>{content.badge}</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-extrabold leading-[1.12] tracking-tight text-[#14361F] sm:text-4xl lg:text-5xl">
              {content.titleFirst} <span className="text-[#E07B0C]">{content.titleHighlight}</span>
            </h2>
          </div>

          {content.buttonText && content.buttonLink && (
            <Link
              href={content.buttonLink}
              className="group inline-flex items-center gap-2 rounded-full border border-[#144D29]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#144D29] shadow-sm transition-all hover:border-[#144D29] hover:bg-[#144D29] hover:text-white"
            >
              {content.buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* One line, slides one card at a time (see CategoryCarousel) */}
        <CategoryCarousel categories={categories} />
      </div>
    </section>
  )
}
