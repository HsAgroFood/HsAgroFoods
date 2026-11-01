import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: NO_INDEX,
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
