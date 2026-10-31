'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
  Truck,
  Leaf,
} from 'lucide-react'
import { subscribeNewsletter } from '@/actions/newsletter'

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.trim()) return

    setLoading(true)
    setErrorMsg('')
    const res = await subscribeNewsletter(email)
    setLoading(false)

    if (res.success) {
      setSubscribed(true)
      setEmail('')
    } else {
      setErrorMsg(res.error || 'Subscription failed. Please try again.')
    }
  }

  return (
    <footer className="relative bg-[#F7F3EB] text-[#14361F] pt-8 sm:pt-12 pb-20 lg:pb-10 border-t border-[#EDE4D9] overflow-hidden">
      {/* ── Soft Ambient Warm Saffron & Herb Lighting ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(240, 152, 25, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 90% 60%, rgba(20, 54, 31, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(224, 123, 12, 0.06) 0%, transparent 45%)
          `,
        }}
      />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── 1. Top Value Pillars Strip (Pure White Heritage Cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-12 lg:mb-14 p-2.5 sm:p-4 lg:p-5 rounded-[5px] bg-white border border-[#EDE4D9] shadow-2xs">
          
          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[4px] hover:bg-[#FAF7F2] transition-colors min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[5px] bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] shrink-0 shadow-2xs">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-[#14361F] leading-tight">100% Pure &amp; Natural</h4>
              <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] text-[#7A6458] mt-0.5 leading-snug">Cold-ground, no additives</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[4px] hover:bg-[#FAF7F2] transition-colors min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[5px] bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-[#14361F] leading-tight">FSSAI Certified</h4>
              <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] text-[#7A6458] mt-0.5 leading-snug">Zero adulteration tested</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[4px] hover:bg-[#FAF7F2] transition-colors min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[5px] bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] shrink-0 shadow-2xs">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-[#14361F] leading-tight">Free Delivery &gt; ₹499</h4>
              <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] text-[#7A6458] mt-0.5 leading-snug">Safe pan-India dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[4px] hover:bg-[#FAF7F2] transition-colors min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[5px] bg-[#FAF3EB] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] shrink-0 shadow-2xs">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07B0C]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-[#14361F] leading-tight">100% Secure Checkout</h4>
              <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] text-[#7A6458] mt-0.5 leading-snug">UPI, cards &amp; net banking</p>
            </div>
          </div>

        </div>

        {/* ── 2. Main Footer Multi-Column Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 sm:pb-10 border-b border-[#EDE4D9]">
          
          {/* ── Column 1: Brand Info & Direct Contact (lg:col-span-4) ── */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            
            {/* Logo & Brand Name (Identical styling to Header) */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-white rounded-[5px] p-1.5 border border-[#EDE4D9] shadow-2xs">
                <Image
                  src="/images/logo.png"
                  alt="HS AgroFoods Logo"
                  fill
                  unoptimized
                  className="object-contain p-0.5"
                  sizes="64px"
                />
              </div>
              <div className="text-left">
                <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-[#14361F] block leading-none">
                  HS <span className="text-[#E07B0C]">AgroFoods</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6458] mt-1 block">
                  Pure • Natural • Trusted
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-[13px] text-[#5A433B] leading-relaxed font-normal max-w-sm">
              Bringing the authentic aroma of pure Indian spices and nutrient-rich dehydrated fruit &amp; vegetable powders straight to your kitchen.
            </p>

            {/* Direct Contact Info List */}
            <div className="space-y-2.5 text-xs text-[#5A433B] pt-1 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E07B0C] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana – 500048
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E07B0C] shrink-0" />
                <span>
                  <a href="tel:+919493184110" className="text-[#14361F] hover:text-[#E07B0C] transition-colors font-semibold">
                    +91 94931 84110
                  </a>
                  {' / '}
                  <a href="tel:+919100939110" className="text-[#14361F] hover:text-[#E07B0C] transition-colors font-semibold">
                    +91 91009 39110
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E07B0C] shrink-0" />
                <a
                  href="mailto:Hs.foodofficial@gmail.com"
                  className="text-[#14361F] hover:text-[#E07B0C] transition-colors font-semibold underline-offset-2 hover:underline"
                >
                  Hs.foodofficial@gmail.com
                </a>
              </div>
            </div>

            {/* FSSAI Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#144D29] bg-[#EBF3ED] border border-[#CFE3D3] px-3.5 py-1.5 rounded-[5px] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#144D29]" />
              <span>100% Lab Tested &amp; FSSAI Certified</span>
            </div>

          </div>

          {/* ── Column 2: Explore Quick Links (lg:col-span-2) ── */}
          <div className="space-y-3.5 lg:col-span-2">
            <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#14361F] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#E07B0C] rounded-[2px]" />
              <span>Explore</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-[#5A433B]">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Shop All Products</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=ground-spices"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Ground Spices</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=blended-spices"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Blended Masale</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=dehydrated-powders"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Dehydrated Powders</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 3: Signature Range (lg:col-span-3) ── */}
          <div className="space-y-3.5 lg:col-span-3">
            <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#14361F] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#E07B0C] rounded-[2px]" />
              <span>Signature Range</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-[#5A433B]">
              <li>
                <Link
                  href="/product/turmeric-powder"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Turmeric Powder (Haldi)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/red-chilli-powder"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Red Chilli Powder</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/shahi-garam-masala"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Shahi Garam Masala</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/chat-masala"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Tangy Chaat Masala</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/beetroot-powder"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Pure Beetroot Powder</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/tomato-powder"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Dehydrated Tomato Powder</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/banana-powder"
                  className="inline-flex items-center gap-1.5 hover:text-[#E07B0C] hover:translate-x-1 transition-all py-0.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#E07B0C]" />
                  <span>Raw Banana Powder</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 4: Newsletter & Socials (lg:col-span-3) ── */}
          <div className="space-y-4 lg:col-span-3 sm:col-span-2">
            <div className="space-y-3">
              <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#14361F] tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#E07B0C] rounded-[2px]" />
                <span>Stay Connected</span>
              </h3>
              <p className="text-xs text-[#5A433B] leading-relaxed font-normal">
                Subscribe to get exclusive festival recipe cards &amp; special discounts.
              </p>

              {subscribed ? (
                <div className="p-3.5 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-xs font-semibold flex items-center gap-2 shadow-2xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Welcome to Purity Club! Check your inbox soon. 🎉</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-[5px] bg-white border border-[#EDE4D9] px-3.5 py-2.5 text-xs text-[#14361F] placeholder:text-[#9C8A7F] focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all shadow-2xs"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-600 font-semibold px-1">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[5px] bg-[#E07B0C] hover:bg-[#C86A08] py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{loading ? 'Subscribing...' : 'Join Purity Club'}</span>
                    {!loading && <Sparkles className="w-3.5 h-3.5 text-amber-200" />}
                  </button>
                </form>
              )}
            </div>

            {/* Social Media Links (Circular Action Buttons matching Header) */}
            <div className="pt-2 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#14361F]">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/hs_agro_foods?srtk=eXNkaGNxb2gxYWZr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HS AgroFoods on Instagram"
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#FDF0E6] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] hover:border-[#FADCC3] flex items-center justify-center shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:scale-110 transition-transform"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                <a
                  href="https://youtube.com/@hsagrofoods?si=KEc9fwnvsNcZ7778"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HS AgroFoods on YouTube"
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#FDF0E6] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] hover:border-[#FADCC3] flex items-center justify-center shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:scale-110 transition-transform"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/share/1A5kcJC8iR/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HS AgroFoods on Facebook"
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#FDF0E6] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] hover:border-[#FADCC3] flex items-center justify-center shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:scale-110 transition-transform"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* ── 3. Bottom Copyright & Legal Strip ── */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6458] text-center sm:text-left font-normal">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()}{' '}
            <strong className="text-[#14361F] font-bold">HS AgroFoods</strong>. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-medium">
            <Link
              href="/privacy"
              className="text-[#5A433B] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <span className="text-[#C8B8AB]">•</span>
            <Link
              href="/terms"
              className="text-[#5A433B] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <span className="text-[#C8B8AB]">•</span>
            <Link
              href="/contact"
              className="text-[#5A433B] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Customer Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
