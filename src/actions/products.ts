'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated, UNAUTHORIZED_ERROR } from '@/lib/adminAuth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { defaultParcelFor } from '@/lib/shippingDefaults'

export type ActionResult = {
  error?: string
  success?: boolean
}

async function getAdminDb() {
  const authorized = await isAdminAuthenticated()
  return authorized ? createAdminClient() : null
}

function revalidateProductStorefront() {
  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/product/[slug]', 'page')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await getAdminDb()
  if (!supabase) return { error: UNAUTHORIZED_ERROR }

  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'

  // Pricing & variant fields
  const priceStr = formData.get('price') as string
  const originalPriceStr = formData.get('original_price') as string
  const variantName = ((formData.get('variant_name') as string) || '').trim() || 'Standard Pack'
  const stockQuantityStr = formData.get('stock_quantity') as string
  const featuredImageUrl = (formData.get('featured_image_url') as string) || null
  const galleryImagesRaw = formData.get('gallery_images') as string

  if (!name) {
    return { error: 'Product name is required' }
  }

  const hasPrice = Boolean(priceStr?.trim())
  const price = hasPrice ? Number(priceStr) : null
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { error: 'Selling price must be a non-negative number.' }
  }

  const hasOriginalPrice = Boolean(originalPriceStr?.trim())
  const originalPrice = hasOriginalPrice ? Number(originalPriceStr) : null
  if (hasOriginalPrice && !hasPrice) {
    return { error: 'Selling price is required when an original price is supplied.' }
  }
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return { error: 'Original price must be a non-negative number.' }
  }
  if (originalPrice !== null && price !== null && originalPrice < price) {
    return { error: 'Original price cannot be lower than the selling price.' }
  }

  const stockQuantity = stockQuantityStr ? Number(stockQuantityStr) : 100
  if (hasPrice && (!Number.isInteger(stockQuantity) || stockQuantity < 0)) {
    return { error: 'Stock quantity must be a non-negative whole number.' }
  }

  const slug = slugify(name)

  const { data: product, error } = await supabase.from('products').insert({
    name,
    slug,
    category_id: categoryId || null,
    short_description: shortDescription || null,
    description: description || null,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    featured_image_url: featuredImageUrl,
    is_active: isActive,
    is_featured: isFeatured,
  }).select('id').single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  // If featured_image_url or gallery images were provided, insert them into product_images
  const imagesToInsert: { product_id: string; image_url: string; sort_order: number }[] = []
  if (featuredImageUrl) {
    imagesToInsert.push({
      product_id: product.id,
      image_url: featuredImageUrl,
      sort_order: 0,
    })
  }

  if (galleryImagesRaw) {
    try {
      const parsedGallery: string[] = JSON.parse(galleryImagesRaw)
      parsedGallery.forEach((url) => {
        if (url && url !== featuredImageUrl) {
          imagesToInsert.push({
            product_id: product.id,
            image_url: url,
            sort_order: imagesToInsert.length,
          })
        }
      })
    } catch {
      // Ignore json parse error
    }
  }

  if (imagesToInsert.length > 0) {
    const { error: imageError } = await supabase.from('product_images').insert(imagesToInsert)
    if (imageError) {
      await supabase.from('products').delete().eq('id', product.id)
      return { error: imageError.message }
    }
  }

  // If price is provided, create the initial variant automatically
  if (price !== null) {
    const { error: variantError } = await supabase.from('product_variants').insert({
      product_id: product.id,
      variant_name: variantName,
      price,
      original_price: originalPrice,
      stock_quantity: stockQuantity,
      is_active: true,
    })

    if (variantError) {
      await supabase.from('products').delete().eq('id', product.id)
      return { error: variantError.message }
    }
  }

  revalidatePath('/admin/products')
  revalidateProductStorefront()
  redirect(`/admin/products/${product.id}/edit`)
}

export async function updateProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await getAdminDb()
  if (!supabase) return { error: UNAUTHORIZED_ERROR }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'
  const featuredImageUrl = formData.get('featured_image_url') as string | null

  if (!id || !name) {
    return { error: 'Product ID and name are required' }
  }

  const slug = slugify(name)

  const updatePayload: any = {
    name,
    slug,
    category_id: categoryId || null,
    short_description: shortDescription || null,
    description: description || null,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    is_active: isActive,
    is_featured: isFeatured,
  }

  if (featuredImageUrl !== null && featuredImageUrl !== undefined) {
    updatePayload.featured_image_url = featuredImageUrl || null
  }

  const { error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  // Update gallery images if provided
  const galleryImagesRaw = formData.get('gallery_images') as string
  if (galleryImagesRaw) {
    try {
      const parsedGallery: string[] = JSON.parse(galleryImagesRaw)
      // Delete old product images and re-insert
      const { error: deleteImagesError } = await supabase.from('product_images').delete().eq('product_id', id)
      if (deleteImagesError) return { error: deleteImagesError.message }

      const imagesToInsert: { product_id: string; image_url: string; sort_order: number }[] = []
      if (featuredImageUrl) {
        imagesToInsert.push({
          product_id: id,
          image_url: featuredImageUrl,
          sort_order: 0,
        })
      }

      parsedGallery.forEach((url) => {
        if (url && url !== featuredImageUrl) {
          imagesToInsert.push({
            product_id: id,
            image_url: url,
            sort_order: imagesToInsert.length,
          })
        }
      })

      if (imagesToInsert.length > 0) {
        const { error: insertImagesError } = await supabase.from('product_images').insert(imagesToInsert)
        if (insertImagesError) return { error: insertImagesError.message }
      }
    } catch {
      return { error: 'Gallery images must be valid JSON.' }
    }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}/edit`)
  revalidateProductStorefront()
  redirect('/admin/products')
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.from('products').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidateProductStorefront()
  return { success: true }
}

// ─── Product Information CRUD ────────────────────────────

export async function saveProductInformation(
  productId: string,
  items: { id?: string; label: string; value: string; display_order: number }[]
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  // Delete existing items and re-insert
  const { error: deleteError } = await supabase
    .from('product_information')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      label: item.label,
      value: item.value,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_information')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}

// ─── Product Image CRUD ────────────────────────────────────

export async function addProductImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  // Get max sort_order
  const { data: maxSort } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSort = maxSort && typeof maxSort.sort_order === 'number' ? maxSort.sort_order + 1 : 0

  const { error } = await supabase.from('product_images').insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: nextSort,
  })

  if (error) {
    console.error('Error inserting product image:', error)
    return { error: error.message }
  }

  // If product doesn't have a featured image yet or this is first image, set as featured
  const { data: currentProduct } = await supabase
    .from('products')
    .select('featured_image_url')
    .eq('id', productId)
    .single()

  if (!currentProduct?.featured_image_url || nextSort === 0) {
    await supabase
      .from('products')
      .update({ featured_image_url: imageUrl })
      .eq('id', productId)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/admin/products')
  revalidateProductStorefront()
  return { success: true }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  // Check if this is the featured image before deleting
  const { data: image } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .maybeSingle()

  const { error } = await supabase.from('product_images').delete().eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  // If we just deleted the featured image, clear it or set to next available
  if (image) {
    const { data: product } = await supabase
      .from('products')
      .select('featured_image_url')
      .eq('id', productId)
      .maybeSingle()

    if (product?.featured_image_url === image.image_url) {
      // Find another image to feature
      const { data: nextImage } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()

      await supabase
        .from('products')
        .update({ featured_image_url: nextImage ? nextImage.image_url : null })
        .eq('id', productId)
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/admin/products')
  revalidateProductStorefront()
  return { success: true }
}

export async function setFeaturedImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({ featured_image_url: imageUrl })
    .eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/admin/products')
  revalidateProductStorefront()
  return { success: true }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('product_images')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
      .eq('product_id', productId)

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}

// ─── Product Variant CRUD ────────────────────────────────

// Shipping parcel (weight kg, size cm) for a variant. Blank fields fall back to the
// pack-size defaults so every variant always has usable numbers for courier booking.
function readParcelFields(formData: FormData, variantName: string):
  | { parcel: { weight_kg: number; length_cm: number; width_cm: number; height_cm: number } }
  | { error: string } {
  const defaults = defaultParcelFor(variantName)
  const read = (key: keyof typeof defaults, max: number) => {
    const raw = String(formData.get(key) ?? '').trim()
    if (!raw) return defaults[key]
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 && n <= max ? n : NaN
  }

  const parcel = {
    weight_kg: read('weight_kg', 100),
    length_cm: read('length_cm', 200),
    width_cm: read('width_cm', 200),
    height_cm: read('height_cm', 200),
  }

  if (Object.values(parcel).some((n) => Number.isNaN(n))) {
    return { error: 'Parcel weight must be 0-100 kg and each dimension 0-200 cm.' }
  }
  return { parcel }
}

export async function createProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await getAdminDb()
  if (!supabase) return { error: UNAUTHORIZED_ERROR }

  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!productId || !variantName || !price) {
    return { error: 'Product ID, Variant Name, and Price are required' }
  }

  const parsedPrice = Number(price)
  const parsedOriginalPrice = originalPrice ? Number(originalPrice) : null
  const parsedStockQuantity = Number(stockQuantity || '0')

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Price must be a non-negative number.' }
  }
  if (parsedOriginalPrice !== null && (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
    return { error: 'Original price must be a non-negative number.' }
  }
  if (parsedOriginalPrice !== null && parsedOriginalPrice < parsedPrice) {
    return { error: 'Original price cannot be lower than the selling price.' }
  }
  if (!Number.isInteger(parsedStockQuantity) || parsedStockQuantity < 0) {
    return { error: 'Stock quantity must be a non-negative whole number.' }
  }

  const parcelResult = readParcelFields(formData, variantName)
  if ('error' in parcelResult) return { error: parcelResult.error }

  const { error } = await supabase.from('product_variants').insert({
    product_id: productId,
    variant_name: variantName,
    price: parsedPrice,
    original_price: parsedOriginalPrice,
    stock_quantity: parsedStockQuantity,
    is_active: isActive,
    ...parcelResult.parcel,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}

export async function updateProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await getAdminDb()
  if (!supabase) return { error: UNAUTHORIZED_ERROR }

  const id = formData.get('id') as string
  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!id || !variantName || !price) {
    return { error: 'Variant ID, Name, and Price are required' }
  }

  const parsedPrice = Number(price)
  const parsedOriginalPrice = originalPrice ? Number(originalPrice) : null
  const parsedStockQuantity = Number(stockQuantity || '0')

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Price must be a non-negative number.' }
  }
  if (parsedOriginalPrice !== null && (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
    return { error: 'Original price must be a non-negative number.' }
  }
  if (parsedOriginalPrice !== null && parsedOriginalPrice < parsedPrice) {
    return { error: 'Original price cannot be lower than the selling price.' }
  }
  if (!Number.isInteger(parsedStockQuantity) || parsedStockQuantity < 0) {
    return { error: 'Stock quantity must be a non-negative whole number.' }
  }

  const parcelResult = readParcelFields(formData, variantName)
  if ('error' in parcelResult) return { error: parcelResult.error }

  const { error } = await supabase
    .from('product_variants')
    .update({
      variant_name: variantName,
      price: parsedPrice,
      original_price: parsedOriginalPrice,
      stock_quantity: parsedStockQuantity,
      is_active: isActive,
      ...parcelResult.parcel,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}

export async function deleteProductVariant(
  id: string,
  productId: string
): Promise<ActionResult> {
  const supabase = await getAdminDb()
  if (!supabase) return { error: UNAUTHORIZED_ERROR }

  const { error } = await supabase.from('product_variants').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}


export async function saveProductFaqs(
  productId: string,
  items: { id?: string; question: string; answer: string; display_order: number }[]
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: UNAUTHORIZED_ERROR }
  }
  const supabase = createAdminClient()

  // Delete existing FAQs and re-insert
  const { error: deleteError } = await supabase
    .from('product_faqs')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      question: item.question,
      answer: item.answer,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_faqs')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidateProductStorefront()
  return { success: true }
}
