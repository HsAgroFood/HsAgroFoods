'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/userAuth'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  error?: string
  success?: boolean
}

export async function submitReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getEffectiveUser()
    if (!user) {
      return { error: 'You must be logged in to submit a review.' }
    }

    const productId = formData.get('product_id') as string
    const rating = parseInt(formData.get('rating') as string)
    const reviewText = formData.get('review_text') as string

    if (!productId) {
      return { error: 'Product ID is required.' }
    }
    
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { error: 'Please select a valid rating between 1 and 5.' }
    }

    const adminClient = createAdminClient()

    // Insert as pending: reviews only appear on the storefront after admin approval
    const { error: insertError } = await adminClient
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        review_text: reviewText ? reviewText.trim() : null,
        is_approved: false, // Hidden until an admin approves it in /admin/reviews
      })

    if (insertError) {
      console.error('Error submitting review:', insertError)
      return { error: 'Failed to submit review. Please try again later.' }
    }

    // Ratings/review_count only count approved reviews, so nothing to recalculate until an admin approves it.
    revalidatePath('/', 'layout')
    revalidatePath('/admin/reviews')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error submitting review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
