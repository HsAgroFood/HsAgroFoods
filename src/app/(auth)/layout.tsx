import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CornerAccentImage, CornerAccentsProvider } from '@/components/storefront/CornerAccents'
import { getCornerAccents } from '@/lib/cornerAccents'
import { NO_INDEX } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in or create an account with HS AgroFoods for 100% pure authentic spices and dehydrated powders.',
  robots: NO_INDEX,
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cornerAccents = await getCornerAccents()

  return (
    <CornerAccentsProvider accents={cornerAccents}>
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6">
      {/* ── Ambient Background Lighting Gradients (Matching Home Page) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(240, 152, 25, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 92% 15%, rgba(224, 123, 12, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 8% 85%, rgba(20, 77, 41, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Right Dried Chillies (flipped so they hang from the top) */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 pointer-events-none select-none mix-blend-multiply z-0 -scale-100 opacity-100">
        <CornerAccentImage
          kind="chillies"
          alt="Dried Chillies Accent"
          fill
          className="object-contain object-bottom-left"
          sizes="(max-width: 768px) 128px, 256px"
          priority={false}
        />
      </div>

      {/* Top Navigation Bar: Back to Store */}
      <div className="w-full max-w-[450px] flex items-center justify-between mb-4 sm:mb-5 relative z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14361F] hover:text-[#E07B0C] transition-colors rounded-[5px] bg-white border border-[#EDE4D9] px-3.5 py-1.5 shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Store</span>
        </Link>

        <span className="text-xs sm:text-[13px] font-semibold text-[#7A6458] tracking-wide">
          100% Pure Spices
        </span>
      </div>

      {/* Main Form Content Container */}
      <div className="relative z-10 w-full max-w-[450px]">
        {children}
      </div>
    </div>
    </CornerAccentsProvider>
  )
}
