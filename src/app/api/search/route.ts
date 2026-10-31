import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'

// Expanded bilingual spice keyword mapping for Indian grocery shoppers
const SYNONYM_MAP: Record<string, string[]> = {
  haldi: ['turmeric', 'haldi', 'curcumin'],
  turmeric: ['haldi', 'turmeric', 'curcumin'],
  mirch: ['chilli', 'mirch', 'chili', 'lal mirch'],
  mirchi: ['chilli', 'mirch', 'chili'],
  chilli: ['mirch', 'chilli', 'chili'],
  chili: ['mirch', 'chilli', 'chili'],
  dhaniya: ['coriander', 'dhaniya', 'dhania'],
  coriander: ['dhaniya', 'coriander'],
  jeera: ['cumin', 'jeera', 'zeera'],
  zeera: ['cumin', 'jeera', 'zeera'],
  cumin: ['jeera', 'zeera', 'cumin'],
  garam: ['shahi garam masala', 'garam masala'],
  masala: ['garam masala', 'chaat masala', 'fruit chaat masala'],
  chaat: ['chaat masala', 'fruit chaat masala'],
  chat: ['chaat masala', 'fruit chaat masala'],
  amchur: ['mango', 'amchur', 'dry mango'],
  aamchur: ['mango', 'amchur', 'dry mango'],
  mango: ['amchur', 'mango'],
  beetroot: ['beetroot', 'chukandar'],
  chukandar: ['beetroot', 'chukandar'],
  tomato: ['tomato', 'tamatar'],
  tamatar: ['tomato', 'tamatar'],
  banana: ['banana', 'kela', 'raw banana'],
  kela: ['banana', 'kela', 'raw banana'],
  garlic: ['garlic', 'lehsun', 'lasun'],
  lehsun: ['garlic', 'lehsun', 'lasun'],
  lasun: ['garlic', 'lehsun', 'lasun'],
  carrot: ['carrot', 'gajar'],
  gajar: ['carrot', 'gajar'],
  radish: ['radish', 'mooli'],
  mooli: ['radish', 'mooli'],
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')?.trim()

    if (!rawQuery || rawQuery.length < 1) {
      return NextResponse.json({ results: [] })
    }

    const qLower = rawQuery.toLowerCase()

    // Expand search terms with bilingual synonyms
    const termsToMatch = new Set<string>([qLower])
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (qLower.includes(key) || key.includes(qLower)) {
        synonyms.forEach((s) => termsToMatch.add(s.toLowerCase()))
      }
    }

    // Fast local in-memory search over catalog
    const filterLocal = () => {
      return Object.values(FALLBACK_PRODUCTS)
        .filter((p) => {
          const haystack = `${p.name} ${p.short_description} ${p.slug}`.toLowerCase()
          for (const term of termsToMatch) {
            if (haystack.includes(term)) return true
          }
          return false
        })
        .slice(0, 6)
        .map((p) => {
          const activeVariants = p.product_variants.filter((v) => v.is_active)
          const prices = activeVariants.map((v) => v.price)
          const minPrice = prices.length > 0 ? Math.min(...prices) : null
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: p.featured_image_url,
            price: minPrice,
          }
        })
    }

    // Try Supabase with a strict 1-second timeout so it never blocks or slows down
    const fetchFromSupabase = async () => {
      const supabase = await createClient()
      const orClauses = Array.from(termsToMatch)
        .slice(0, 3)
        .map((term) => `name.ilike.%${term}%,short_description.ilike.%${term}%,slug.ilike.%${term}%`)
        .join(',')

      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          featured_image_url,
          short_description,
          product_variants (
            price,
            is_active
          )
        `)
        .or(orClauses)
        .eq('is_active', true)
        .limit(6)

      if (!error && products && products.length > 0) {
        return products.map((p: any) => {
          const activeVariants = p.product_variants?.filter((v: any) => v.is_active) || []
          const prices = activeVariants.map((v: any) => v.price)
          const minPrice = prices.length > 0 ? Math.min(...prices) : null
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: p.featured_image_url || '/images/products/red-chilli-powder.png',
            price: minPrice,
          }
        })
      }
      return null
    }

    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
    const dbResults = await Promise.race([fetchFromSupabase().catch(() => null), timeout])

    if (dbResults && dbResults.length > 0) {
      return NextResponse.json({ results: dbResults })
    }

    return NextResponse.json({ results: filterLocal() })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
