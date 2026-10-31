'use client'

import { FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'

export const WISHLIST_STORAGE_KEY = 'hs_agro_wishlist'

/**
 * Safely parse the wishlist map from localStorage
 */
export function getWishlistMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored) || {}
  } catch {
    return {}
  }
}

/**
 * Determine if a product is wishlisted by ID, slug, or fallback ID
 */
export function isProductWishlisted(
  wishlistMap: Record<string, boolean>,
  id: string,
  slug?: string
): boolean {
  if (!wishlistMap || typeof wishlistMap !== 'object') return false

  // Direct match by ID
  if (wishlistMap[id]) return true

  // Direct match by slug
  if (slug && wishlistMap[slug]) return true

  // Match by fallback ID corresponding to slug
  if (slug) {
    const fallback = (FALLBACK_PRODUCTS as Record<string, any>)[slug]
    if (fallback?.id && wishlistMap[fallback.id]) return true
  }

  // Match by fallback item if id matches a fallback item's id or slug
  const matchedFallback = Object.values(FALLBACK_PRODUCTS).find(
    (p) => p.id === id || (slug && p.slug === slug)
  )
  if (matchedFallback) {
    if (wishlistMap[matchedFallback.id] || wishlistMap[matchedFallback.slug]) return true
  }

  return false
}

/**
 * Toggle a product in the wishlist (adds exactly 1 key, cleans up any legacy duplicates)
 * Returns the new wishlisted state (true if added, false if removed).
 */
export function toggleWishlistProduct(id: string, slug?: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    const wishlistMap = getWishlistMap()
    const currentlyWishlisted = isProductWishlisted(wishlistMap, id, slug)
    const nextState = !currentlyWishlisted

    // Find all legacy keys related to this product to clean them up
    const keysToDelete = new Set<string>([id])
    if (slug) keysToDelete.add(slug)

    const fallback = slug ? (FALLBACK_PRODUCTS as Record<string, any>)[slug] : null
    if (fallback?.id) keysToDelete.add(fallback.id)

    const matchedFallback = Object.values(FALLBACK_PRODUCTS).find(
      (p) => p.id === id || (slug && p.slug === slug)
    )
    if (matchedFallback) {
      keysToDelete.add(matchedFallback.id)
      keysToDelete.add(matchedFallback.slug)
    }

    // Delete all legacy keys for this product
    for (const key of keysToDelete) {
      delete wishlistMap[key]
    }

    // If adding, store ONLY the primary ID (strictly 1 key per product)
    if (nextState) {
      wishlistMap[id] = true
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistMap))
    window.dispatchEvent(new Event('hs_wishlist_updated'))
    return nextState
  } catch (err) {
    console.error('Failed to toggle wishlist:', err)
    return false
  }
}

/**
 * Remove a product from the wishlist completely
 */
export function removeWishlistProduct(id: string, slug?: string): void {
  if (typeof window === 'undefined') return

  try {
    const wishlistMap = getWishlistMap()
    const keysToDelete = new Set<string>([id])
    if (slug) keysToDelete.add(slug)

    const fallback = slug ? (FALLBACK_PRODUCTS as Record<string, any>)[slug] : null
    if (fallback?.id) keysToDelete.add(fallback.id)

    const matchedFallback = Object.values(FALLBACK_PRODUCTS).find(
      (p) => p.id === id || (slug && p.slug === slug)
    )
    if (matchedFallback) {
      keysToDelete.add(matchedFallback.id)
      keysToDelete.add(matchedFallback.slug)
    }

    for (const key of keysToDelete) {
      delete wishlistMap[key]
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistMap))
    window.dispatchEvent(new Event('hs_wishlist_updated'))
  } catch (err) {
    console.error('Failed to remove from wishlist:', err)
  }
}

/**
 * Count unique wishlist products (deduplicating id vs slug vs fallbackId)
 */
export function getWishlistCount(): number {
  if (typeof window === 'undefined') return 0

  try {
    const wishlistMap = getWishlistMap()
    const activeKeys = Object.keys(wishlistMap).filter((k) => wishlistMap[k] === true)
    if (activeKeys.length === 0) return 0

    const uniqueSet = new Set<string>()
    for (const key of activeKeys) {
      const match = Object.values(FALLBACK_PRODUCTS).find(
        (p) => p.id === key || p.slug === key
      )
      if (match) {
        uniqueSet.add(match.id)
      } else {
        uniqueSet.add(key)
      }
    }
    return uniqueSet.size
  } catch {
    return 0
  }
}

