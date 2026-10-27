'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Check, Loader2, MapPin, Phone, Mail } from 'lucide-react'
import { subscribeNewsletter } from '@/actions/newsletter'

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setErrorMsg('')
    const res = await subscribeNewsletter(email)
    setLoading(false)
    if (res.success) {
      setSubscribed(true)
      setEmail('')
    } else {
      setErrorMsg(res.error || 'Subscription failed')
    }
  }
  return (
    <footer className="bg-gradient-to-b from-[#FFF5E4] via-[#FFE9C4] to-[#FDDCA9] text-[#14361F] pt-16 pb-28 lg:pb-12 border-t-2 border-[#F09819]/40 relative overflow-hidden">
      {/* Subtle Ambient Saffron & Leaf Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F09819]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#144D29]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-[#E5C697]">
          
          {/* Brand, Contact Details & Socials */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center justify-center sm:justify-start gap-3 group">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png"
                  alt="HS AgroFoods Logo"
                  fill
                  unoptimized
                  className="object-contain drop-shadow-xs"
                  sizes="72px"
                />
              </div>
              <div className="text-left">
                <span className="font-serif text-2xl font-extrabold tracking-tight text-[#144D29] block leading-none">
                  HS <span className="text-[#E07B0C]">AgroFoods</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6248] mt-1 block">
                  Pure • Natural • Trusted
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#4A3B2C] leading-relaxed max-w-sm mx-auto sm:mx-0 font-medium">
              Bringing the authentic aroma of pure Indian spices and nutrient-rich dehydrated fruit &amp; vegetable powders straight to your kitchen.
            </p>

            {/* Direct Contact Info */}
            <div className="space-y-2 text-xs text-[#4A3B2C] font-medium max-w-sm mx-auto sm:mx-0 pt-1">
              <div className="flex items-start justify-center sm:justify-start gap-2">
                <MapPin className="w-4 h-4 text-[#E07B0C] shrink-0 mt-0.5" />
                <span>4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana – 500048</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-[#E07B0C] shrink-0" />
                <span>
                  <a href="tel:+919493184110" className="hover:text-[#E07B0C] transition-colors">+91 94931 84110</a>
                  {' / '}
                  <a href="tel:+919100939110" className="hover:text-[#E07B0C] transition-colors">+91 91009 39110</a>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-[#E07B0C] shrink-0" />
                <a href="mailto:Hs.foodofficial@gmail.com" className="hover:text-[#E07B0C] transition-colors">
                  Hs.foodofficial@gmail.com
                </a>
              </div>
            </div>

            <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs text-[#144D29] font-bold bg-white/80 border border-[#EBCFA6] px-3.5 py-1.5 rounded-full shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#E07B0C]" />
              <span>100% Lab Tested &amp; FSSAI Certified</span>
            </div>
          </div>

          {/* Quick Links & Spice Categories Container */}
          <div className="grid grid-cols-2 gap-6 sm:col-span-2 lg:col-span-5">
            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#144D29] tracking-wider uppercase">
                Explore
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/shop" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Shop All Products</Link>
                </li>
                <li>
                  <Link href="/shop?category=ground-spices" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Ground Spices</Link>
                </li>
                <li>
                  <Link href="/shop?category=blended-spices" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Blended Masale</Link>
                </li>
                <li>
                  <Link href="/shop?category=dehydrated-powders" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Dehydrated Veg &amp; Fruit Powders</Link>
                </li>
                <li>
                  <Link href="/about" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Contact Us</Link>
                </li>
              </ul>
            </div>

            {/* Spice Direct Products */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#144D29] tracking-wider uppercase">
                Signature Range
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/product/turmeric-powder" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Turmeric Powder (Haldi)</Link>
                </li>
                <li>
                  <Link href="/product/red-chilli-powder" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Red Chilli Powder</Link>
                </li>
                <li>
                  <Link href="/product/shahi-garam-masala" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Shahi Garam Masala</Link>
                </li>
                <li>
                  <Link href="/product/chat-masala" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Tangy Chaat Masala</Link>
                </li>
                <li>
                  <Link href="/product/beetroot-powder" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Pure Beetroot Powder</Link>
                </li>
                <li>
                  <Link href="/product/tomato-powder" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Dehydrated Tomato Powder</Link>
                </li>
                <li>
                  <Link href="/product/banana-powder" className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors">Raw Banana Powder</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter & Social Media */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-4">
            <div className="space-y-3">
              <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#144D29] tracking-wider uppercase">
                Stay Connected
              </h3>
              <p className="text-xs text-[#4A3B2C] leading-relaxed font-medium">
                Subscribe to get exclusive festival recipe cards &amp; special discounts.
              </p>
              {subscribed ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-500/40 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Welcome to Purity Club! Check your inbox soon. 🎉</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-full bg-white border border-[#E5C697] px-4 py-2.5 text-xs text-[#14361F] placeholder:text-[#8A7256] focus:outline-none focus:ring-2 focus:ring-[#F09819] shadow-inner"
                  />
                  {errorMsg && <p className="text-[11px] text-rose-600 font-semibold px-1">{errorMsg}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-gradient-to-r from-[#F09819] to-[#E07B0C] py-2.5 text-xs font-bold text-white shadow-md hover:from-[#DF870D] hover:to-[#C96B06] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{loading ? 'Subscribing...' : 'Join Purity Club'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Social Media Links */}
            <div className="pt-2 space-y-2.5 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#144D29]">
                Follow Us
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <a
                  href="https://www.instagram.com/hs_agro_foods?srtk=eXNkaGNxb2gxYWZr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HS AgroFoods on Instagram"
                  className="w-9 h-9 rounded-full bg-white/90 border border-[#E5C697] flex items-center justify-center text-[#144D29] hover:bg-[#E07B0C] hover:text-white hover:border-[#E07B0C] transition-all shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="w-9 h-9 rounded-full bg-white/90 border border-[#E5C697] flex items-center justify-center text-[#144D29] hover:bg-[#E07B0C] hover:text-white hover:border-[#E07B0C] transition-all shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/1A5kcJC8iR/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HS AgroFoods on Facebook"
                  className="w-9 h-9 rounded-full bg-white/90 border border-[#E5C697] flex items-center justify-center text-[#144D29] hover:bg-[#E07B0C] hover:text-white hover:border-[#E07B0C] transition-all shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & legal strip */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C4934] text-center sm:text-left font-medium">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} <strong className="text-[#144D29] font-bold">HS AgroFoods</strong>. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-semibold">
            <Link 
              href="/privacy" 
              className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <span className="text-[#C8A878]">•</span>
            <Link 
              href="/terms" 
              className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <span className="text-[#C8A878]">•</span>
            <Link 
              href="/contact" 
              className="text-[#4A3B2C] hover:text-[#E07B0C] transition-colors py-1 hover:underline underline-offset-4"
            >
              Customer Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
