'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'

type GuestCartItem = {
  id: string
  variant_id: string
  quantity: number
  created_at: number
}

async function getGuestCart(): Promise<GuestCartItem[]> {
  const cookieStore = await cookies()
  const guestCartCookie = cookieStore.get('guest_cart')
  if (guestCartCookie) {
    try {
      return JSON.parse(guestCartCookie.value) as GuestCartItem[]
    } catch {
      return []
    }
  }
  return []
}

async function saveGuestCart(cart: GuestCartItem[]) {
  const cookieStore = await cookies()
  cookieStore.set('guest_cart', JSON.stringify(cart), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    if (!variantId) {
      return { success: false, error: 'Invalid product variant' }
    }

    const user = await getEffectiveUser()

    if (!user) {
      // Guest cart flow — no database access required
      const cart = await getGuestCart()
      const existing = cart.find(i => i.variant_id === variantId)
      if (existing) {
        existing.quantity += quantity
      } else {
        cart.push({
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          variant_id: variantId,
          quantity,
          created_at: Date.now()
        })
      }
      await saveGuestCart(cart)
      revalidatePath('/cart')
      return { success: true }
    }

    const adminClient = createAdminClient()

    // Check if this variant already exists in the user's cart
    const { data: existing, error: findError } = await adminClient
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .maybeSingle()

    let dbError: string | null = findError?.message || null

    if (!dbError) {
      if (existing) {
        const newQty = existing.quantity + quantity
        const { error } = await adminClient
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existing.id)

        if (error) dbError = error.message
      } else {
        const { error } = await adminClient
          .from('cart_items')
          .insert([{ user_id: user.id, variant_id: variantId, quantity }])

        if (error) dbError = error.message
      }
    }

    // If the database is unavailable, gracefully fall back to the guest cart
    // so the customer's selection is never lost.
    if (dbError) {
      const cart = await getGuestCart()
      const guestExisting = cart.find(i => i.variant_id === variantId)
      if (guestExisting) {
        guestExisting.quantity += quantity
      } else {
        cart.push({
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          variant_id: variantId,
          quantity,
          created_at: Date.now()
        })
      }
      await saveGuestCart(cart)
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add to cart' }
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const user = await getEffectiveUser()

    if (!user) {
      // Guest cart flow
      let cart = await getGuestCart()
      cart = cart.filter(i => i.id !== cartItemId)
      await saveGuestCart(cart)
      revalidatePath('/cart')
      return { success: true }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id)

    if (error) {
      // Database unavailable — also clear a matching guest-cart entry if present
      let cart = await getGuestCart()
      cart = cart.filter(i => i.id !== cartItemId)
      await saveGuestCart(cart)
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove item' }
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }

    const user = await getEffectiveUser()

    if (!user) {
      const cart = await getGuestCart()
      const item = cart.find(i => i.id === cartItemId)
      if (!item) {
        return { success: false, error: 'Item not found in guest cart' }
      }
      item.quantity = quantity
      await saveGuestCart(cart)
      revalidatePath('/cart')
      return { success: true }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', user.id)

    if (error) {
      // Database unavailable — apply the change to the guest cart if present
      const cart = await getGuestCart()
      const item = cart.find(i => i.id === cartItemId)
      if (item) {
        item.quantity = quantity
        await saveGuestCart(cart)
      }
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update quantity' }
  }
}

async function resolveGuestCartItems(): Promise<any[]> {
  const cart = await getGuestCart()
  if (cart.length === 0) return []

  const variantIds = cart.map(i => i.variant_id)

  // Fetch variant details from the DB when available. If the DB is
  // unreachable, resolve from the static catalog instead of dropping the cart.
  let variants: any[] = []
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('product_variants')
      .select(`
        id,
        variant_name,
        price,
        original_price,
        stock_quantity,
        is_active,
        product_id,
        products (
          id,
          name,
          slug,
          featured_image_url
        )
      `)
      .in('id', variantIds)

    if (!error && data) {
      variants = data
    }
  } catch {
    // Ignore DB errors and resolve from fallback catalog below
  }

  // Map cookies array back to cart items shape
  const items = cart.map(item => {
    let variant = variants.find(v => v.id === item.variant_id)
    if (!variant) {
      for (const p of Object.values(FALLBACK_PRODUCTS)) {
        const fv = p.product_variants.find(v => v.id === item.variant_id)
        if (fv) {
          variant = {
            id: fv.id,
            variant_name: fv.variant_name,
            price: fv.price,
            original_price: fv.original_price,
            stock_quantity: fv.stock_quantity,
            is_active: fv.is_active,
            product_id: p.id,
            products: {
              id: p.id,
              name: p.name,
              slug: p.slug,
              featured_image_url: p.featured_image_url,
            }
          } as any
          break
        }
      }
    }
    return {
      id: item.id,
      quantity: item.quantity,
      variant_id: item.variant_id,
      product_variants: variant || null
    }
  }).filter(i => i.product_variants !== null)

  items.sort((a, b) => {
    const aCartItem = cart.find(i => i.id === a.id);
    const bCartItem = cart.find(i => i.id === b.id);
    return (bCartItem?.created_at || 0) - (aCartItem?.created_at || 0);
  })

  return items
}

export async function getCart() {
  let user: Awaited<ReturnType<typeof getEffectiveUser>> = null
  try {
    user = await getEffectiveUser()

    if (!user) {
      return { success: true, items: await resolveGuestCartItems() }
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('cart_items')
      .select(`
        id,
        quantity,
        variant_id,
        product_variants (
          id,
          variant_name,
          price,
          original_price,
          stock_quantity,
          is_active,
          product_id,
          products (
            id,
            name,
            slug,
            featured_image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return { success: true, items: await resolveGuestCartItems() }

    return { success: true, items: data || [] }
  } catch {
    if (!user) {
      try {
        return { success: true, items: await resolveGuestCartItems() }
      } catch {
        return { success: true, items: [] }
      }
    }
    return { success: true, items: [] }
  }
}

export async function getCartCount() {
  try {
    const user = await getEffectiveUser()

    if (!user) {
      const cart = await getGuestCart()
      return cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id)

    if (error) {
      const cart = await getGuestCart()
      return cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    if (!data) return 0

    return data.reduce((sum, item) => sum + item.quantity, 0)
  } catch {
    const cart = await getGuestCart()
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }
}
