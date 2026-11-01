import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NO_INDEX,
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
