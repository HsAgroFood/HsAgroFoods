'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Mail,
  ArrowRight,
  Check,
  Tag,
  Gift,
  Lock,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { subscribeNewsletter } from '@/actions/newsletter'

// Realistic Botanical Leaf SVG from User
function RealisticLeaf({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nbLeafGradDark" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4A8F44" />
          <stop offset="50%" stopColor="#2D6A28" />
          <stop offset="100%" stopColor="#1B4D1A" />
        </linearGradient>
        <linearGradient id="nbLeafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DB85A" />
          <stop offset="100%" stopColor="#387A32" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 C30 30 15 65 18 105 C20 125 35 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#nbLeafGradDark)"
      />
      <path
        d="M50 10 C70 30 85 65 82 105 C80 125 65 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#nbLeafGradLight)"
        opacity="0.95"
      />
      <path
        d="M50 10 Q50 85 50 155"
        stroke="#8FE073"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d="M50 35 Q35 45 28 55" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 40 Q65 50 72 60" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 65 Q32 75 24 90" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 70 Q68 80 76 95" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 95 Q35 108 28 122" stroke="#8FE073" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 100 Q65 112 72 125" stroke="#B1F29B" strokeWidth="1.2" opacity="0.45" />
      <path d="M50 155 Q49 165 46 172" stroke="#2D6A28" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function BottomBanner() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.trim()) return

    setLoading(true)
    setErrorMsg('')
    const res = await subscribeNewsletter(email)
    setLoading(false)

    if (res.success) {
      setSuccess(true)
      setEmail('')
    } else {
      setErrorMsg(res.error || 'Subscription failed. Please try again.')
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF6F0] text-[#14361F] pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-14 lg:pb-16 border-t border-[#EDE4D9]/80">
      
      {/* ── Soft Ambient Radial Glow Behind Center Content ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.85) 0%, rgba(250, 246, 240, 0.4) 60%, transparent 85%)
          `,
        }}
      />

      {/* ── Realistic Floating Decorative Leaves (from User SVG) ── */}
      {/* Top Left Leaf (Floating above Turmeric bowl) */}
      <div className="hidden sm:block absolute top-5 left-[20%] lg:left-[23%] xl:left-[25%] w-7 h-11 lg:w-8 lg:h-13 -rotate-45 opacity-85 pointer-events-none select-none z-10 drop-shadow-sm">
        <RealisticLeaf className="w-full h-full" />
      </div>

      {/* Top Right Leaf (Floating beside the Headline) */}
      <div className="absolute top-6 sm:top-8 right-[8%] sm:right-[18%] lg:right-[22%] xl:right-[24%] w-6 h-10 lg:w-8 lg:h-13 rotate-35 opacity-90 pointer-events-none select-none z-10 drop-shadow-sm">
        <RealisticLeaf className="w-full h-full" />
      </div>

      {/* Mid Right Leaf (Floating beside Subtitle & chillies) */}
      <div className="hidden sm:block absolute top-[44%] right-[14%] lg:right-[18%] xl:right-[20%] w-6 h-10 -rotate-20 opacity-80 pointer-events-none select-none z-10 drop-shadow-sm">
        <RealisticLeaf className="w-full h-full" />
      </div>

      {/* Bottom Left Leaf (Floating near the curved base) */}
      <div className="hidden sm:block absolute bottom-12 left-[18%] lg:left-[22%] xl:left-[24%] w-6 h-10 rotate-50 opacity-85 pointer-events-none select-none z-10 drop-shadow-sm">
        <RealisticLeaf className="w-full h-full" />
      </div>

      {/* ── Left Artwork: Turmeric Bowl & Spices Flatlay (newsletter1.png) ── */}
      <div className="absolute left-[-30px] xs:left-[-20px] sm:left-[-15px] md:left-0 lg:left-[-20px] xl:left-[-10px] 2xl:left-0 bottom-[-10px] sm:bottom-[-20px] lg:bottom-[-28px] w-[200px] xs:w-[240px] sm:w-[310px] md:w-[370px] lg:w-[430px] xl:w-[490px] 2xl:w-[530px] aspect-[1536/1024] pointer-events-none select-none z-10 transition-transform duration-500 opacity-35 sm:opacity-100">
        <Image
          src="/images/newsletter/newsletter1.png"
          alt="Golden Salem Turmeric, star anise, peppercorns and whole spices"
          fill
          priority
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 380px, 530px"
          className="object-contain object-left-bottom drop-shadow-sm"
        />
      </div>

      {/* ── Right Artwork: Red Chilly Bowl & Spices Flatlay (newsletter2.png) ── */}
      <div className="absolute right-[-30px] xs:right-[-20px] sm:right-[-15px] md:right-0 lg:right-[-20px] xl:right-[-10px] 2xl:right-0 bottom-[-10px] sm:bottom-[-20px] lg:bottom-[-28px] w-[200px] xs:w-[240px] sm:w-[310px] md:w-[370px] lg:w-[430px] xl:w-[490px] 2xl:w-[530px] aspect-[1536/1024] pointer-events-none select-none z-10 transition-transform duration-500 opacity-35 sm:opacity-100">
        <Image
          src="/images/newsletter/newsletter2.png"
          alt="Vibrant Red Chilly powder, whole dried chillies, cinnamon, peppercorns and garlic"
          fill
          priority
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 380px, 530px"
          className="object-contain object-right-bottom drop-shadow-sm"
        />
      </div>

      {/* ── Center Content Container (Exact Match to User Reference) ── */}
      <div className="relative z-20 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          

          {/* 2. Newsletter Heading Tag with Left & Right Dashes */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <div className="w-8 sm:w-14 h-px bg-[#7A6458]/40" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#7A6458]">
              NEWSLETTER
            </span>
            <div className="w-8 sm:w-14 h-px bg-[#7A6458]/40" />
          </div>

          {/* 3. Main Headline */}
          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#14361F] leading-[1.2]">
            <span>Stay Updated with</span> <br />
            <span className="text-[#E07B0C]">Our Latest Spices &amp; Offers</span>
          </h2>

          {/* 4. Subtitle Description */}
          <p className="mt-2 text-xs sm:text-sm lg:text-[15px] text-[#5A433B] max-w-lg mx-auto leading-relaxed font-normal">
            Join our newsletter and be the first to know about new products, special offers and healthy living tips.
          </p>

          {/* 5. Email Subscription Form Box */}
          <div className="mt-5 sm:mt-6 max-w-lg mx-auto">
            {success ? (
              <div className="bg-white rounded-[5px] p-2 sm:p-[15px] border border-[#EDE4D9] shadow-md flex items-center justify-center gap-2.5 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>You&apos;re subscribed! Check your inbox for exclusive perks.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <div className="bg-white rounded-[5px] p-1.5 sm:p-[5px] pl-4 sm:pl-5 border border-[#EDE4D9] shadow-lg shadow-black/[0.03] flex flex-col sm:flex-row items-center gap-2 sm:gap-0 focus-within:ring-2 focus-within:ring-[#E07B0C]/25 focus-within:border-[#E07B0C] transition-all">
                  
                  {/* Left Mail Icon & Input */}
                  <div className="flex items-center gap-3 w-full flex-1 py-1 sm:py-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#9C8A7F] shrink-0" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-transparent text-xs sm:text-sm text-[#14361F] placeholder:text-[#9C8A7F] outline-none"
                    />
                  </div>

                  {/* Subscribe Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-[5px] bg-gradient-to-r from-[#F09819] to-[#E07B0C] hover:from-[#DF870D] hover:to-[#C96B06] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#E07B0C]/25 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-[11px] sm:text-xs text-red-600 mt-2 text-center font-medium">
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* 6. Three Value Propositions (Exclusive Offers | New Arrivals | Healthy Living Tips) */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-5 text-xs sm:text-[13px] text-[#5A433B] font-medium">
            
            {/* Value 1: Exclusive Offers */}
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border border-[#E07B0C]/40 bg-[#FAF3EB] flex items-center justify-center text-[#E07B0C] shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-[#3A2A22]">Exclusive Offers</span>
            </div>

            {/* Divider 1 */}
            <div className="hidden sm:block w-px h-3.5 bg-[#DDD3C7]" />

            {/* Value 2: New Arrivals */}
            <div className="inline-flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E07B0C] shrink-0" />
              <span className="text-[#3A2A22]">New Arrivals</span>
            </div>

            {/* Divider 2 */}
            <div className="hidden sm:block w-px h-3.5 bg-[#DDD3C7]" />

            {/* Value 3: Healthy Living Tips */}
            <div className="inline-flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E07B0C] shrink-0" />
              <span className="text-[#3A2A22]">Healthy Living Tips</span>
            </div>

          </div>

          {/* 7. Privacy Guarantee Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#7A6458] mt-3 sm:mt-3.5">
            <Lock className="w-3 h-3 text-[#7A6458]" />
            <span>Your email is safe with us. No spam, ever.</span>
          </div>

        </div>
      </div>

      {/* ── 8. Bottom Curved Wave Scoop with Dark Forest Green Base & Golden Stroke Accent ── */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 70"
          className="relative block w-full h-[26px] sm:h-[40px] lg:h-[52px]"
          preserveAspectRatio="none"
        >
          {/* Warm Sandalwood Linen curve scoop matching Footer */}
          <path
            d="M0,70 L0,18 Q720,68 1440,18 L1440,70 Z"
            fill="#F7F3EB"
          />
          {/* Subtle golden-amber accent curve stroke */}
          <path
            d="M0,18 Q720,68 1440,18"
            fill="none"
            stroke="#D4A373"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

    </section>
  )
}
