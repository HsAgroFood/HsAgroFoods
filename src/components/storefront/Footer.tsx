'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useShippingConfig } from '@/contexts/ShippingConfigContext'
import { shippingCopy } from '@/lib/shippingText'
import {
  ShieldCheck,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Send,
  Lock,
  Truck,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { subscribeNewsletter } from '@/actions/newsletter'

type FooterLinkItem = { name: string; slug: string }

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 py-1 text-[13px] font-medium text-[#5A433B] transition-colors hover:text-[#E07B0C]"
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0 -ml-1 text-[#E07B0C] opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
        <span className="transition-transform group-hover:translate-x-0.5">{children}</span>
      </Link>
    </li>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2.5 font-serif text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#14361F]">
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#F09819] to-[#E07B0C]" />
      {children}
    </h3>
  )
}

function Pillar({ Icon, title, text }: { Icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF3E6] to-[#FDE3C8] text-[#E07B0C] sm:h-11 sm:w-11">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h4 className="text-[12px] font-bold leading-tight text-[#14361F] sm:text-[13px]">{title}</h4>
        <p className="mt-0.5 text-[10.5px] leading-snug text-[#7A6458] sm:text-[11px]">{text}</p>
      </div>
    </div>
  )
}

function ContactRow({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#FADCC3] bg-[#FAF3EB] text-[#E07B0C]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 pt-1 text-[13px] leading-snug text-[#5A433B]">{children}</div>
    </div>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE4D9] bg-white text-[#14361F] shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#E07B0C] hover:bg-[#E07B0C] hover:text-white active:scale-95"
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
      >
        {children}
      </svg>
    </a>
  )
}

export function Footer({
  categories = [],
  signatureProducts = [],
}: {
  /** Shop categories from the database (Explore column) */
  categories?: FooterLinkItem[]
  /** Featured products from the database (Signature Range column) */
  signatureProducts?: FooterLinkItem[]
}) {
  const shipping = shippingCopy(useShippingConfig())
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
    <footer className="relative overflow-hidden border-t border-[#EDE4D9] bg-[#F7F3EB] pb-24 pt-10 text-[#14361F] sm:pt-14 lg:pb-8">
      {/* Soft saffron and herb glows on the deep green */}
      <div
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(240, 152, 25, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 90% 60%, rgba(20, 54, 31, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(224, 123, 12, 0.06) 0%, transparent 45%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#E07B0C]/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* ── 1. Trust strip ── */}
        <div className="mb-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#EDE4D9] bg-white shadow-sm lg:mb-16 lg:grid-cols-4 lg:divide-x lg:divide-[#F2E8DC]">
          <Pillar Icon={Leaf} title="100% Pure & Natural" text="Cold-ground, no additives" />
          <Pillar Icon={ShieldCheck} title="FSSAI Certified" text="Zero adulteration tested" />
          <Pillar Icon={Truck} title={shipping.deliveryShort} text="Safe pan-India dispatch" />
          <Pillar Icon={Lock} title="100% Secure Checkout" text="UPI, cards & net banking" />
        </div>

        {/* ── 2. Main grid ── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-[#EDE4D9] pb-12 lg:grid-cols-12 lg:gap-x-10">
          {/* Brand and contact */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3.5">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#EDE4D9] bg-white p-1.5 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="HS AgroFoods Logo"
                  fill
                  unoptimized
                  className="object-contain p-1"
                  sizes="64px"
                />
              </span>
              <span className="text-left">
                <span className="block font-serif text-2xl font-extrabold leading-none tracking-tight text-[#14361F]">
                  HS <span className="text-[#E07B0C]">AgroFoods</span>
                </span>
                <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[#7A6458]">
                  Pure • Natural • Trusted
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-[#5A433B]">
              Bringing the authentic aroma of pure Indian spices and nutrient-rich dehydrated fruit &amp; vegetable powders
              straight to your kitchen.
            </p>

            <div className="mt-5 space-y-3">
              <ContactRow Icon={MapPin}>4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana – 500048</ContactRow>
              <ContactRow Icon={Phone}>
                <a href="tel:+919493184110" className="font-semibold text-[#14361F] transition-colors hover:text-[#E07B0C]">
                  +91 94931 84110
                </a>
                <span className="mx-1.5 text-[#C8B8AB]">/</span>
                <a href="tel:+919100939110" className="font-semibold text-[#14361F] transition-colors hover:text-[#E07B0C]">
                  +91 91009 39110
                </a>
              </ContactRow>
              <ContactRow Icon={Mail}>
                <a
                  href="mailto:Hs.foodofficial@gmail.com"
                  className="break-all font-semibold text-[#14361F] transition-colors hover:text-[#E07B0C]"
                >
                  Hs.foodofficial@gmail.com
                </a>
              </ContactRow>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#CFE3D3] bg-[#EBF3ED] px-3.5 py-1.5 text-xs font-bold text-[#144D29]">
              <ShieldCheck className="h-4 w-4" />
              100% Lab Tested &amp; FSSAI Certified
            </div>
          </div>

          {/* Explore */}
          <div className="col-span-1 lg:col-span-2">
            <FooterHeading>Explore</FooterHeading>
            <ul>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/shop">Shop All Products</FooterLink>
              {categories.map((category) => (
                <FooterLink key={category.slug} href={`/shop?category=${category.slug}`}>
                  {category.name}
                </FooterLink>
              ))}
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Signature range */}
          <div className="col-span-1 lg:col-span-3">
            <FooterHeading>Signature Range</FooterHeading>
            <ul>
              {signatureProducts.map((product) => (
                <FooterLink key={product.slug} href={`/product/${product.slug}`}>
                  {product.name}
                </FooterLink>
              ))}
              {signatureProducts.length === 0 && <FooterLink href="/shop">Browse all products</FooterLink>}
            </ul>
          </div>

          {/* Newsletter and socials */}
          <div className="col-span-2 lg:col-span-3">
            <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm">
              <FooterHeading>Stay Connected</FooterHeading>
              <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-[#5A433B]">
                Subscribe to get exclusive festival recipe cards &amp; special discounts.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-[#CFE3D3] bg-[#EBF3ED] p-3.5 text-xs font-semibold text-[#144D29]">
                  <Check className="h-4 w-4 shrink-0" />
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
                    className="w-full rounded-xl border border-[#EDE4D9] bg-[#FAF7F2] px-4 py-3 text-[13px] text-[#14361F] placeholder:text-[#9C8A7F] transition-all focus:border-[#E07B0C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/20"
                  />

                  {errorMsg && <p className="px-1 text-[11px] font-semibold text-rose-600">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E07B0C] to-[#D1491B] py-3 text-[13px] font-bold text-white shadow-md shadow-[#E07B0C]/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? 'Subscribing...' : 'Join Purity Club'}
                  </button>
                </form>
              )}

              <div className="mt-5 border-t border-[#F2E8DC] pt-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#14361F]">Follow Us</p>
                <div className="flex items-center gap-2.5">
                  <SocialLink href="https://www.instagram.com/hs_agro_foods?srtk=eXNkaGNxb2gxYWZr" label="HS AgroFoods on Instagram">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </SocialLink>
                  <SocialLink href="https://youtube.com/@hsagrofoods?si=KEc9fwnvsNcZ7778" label="HS AgroFoods on YouTube">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </SocialLink>
                  <SocialLink href="https://www.facebook.com/share/1A5kcJC8iR/" label="HS AgroFoods on Facebook">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom strip ── */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-center text-xs text-[#7A6458] sm:flex-row sm:text-left">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} <strong className="font-bold text-[#14361F]">HS AgroFoods</strong>. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-medium">
            <Link href="/privacy" className="py-1 text-[#5A433B] underline-offset-4 transition-colors hover:text-[#E07B0C] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="py-1 text-[#5A433B] underline-offset-4 transition-colors hover:text-[#E07B0C] hover:underline">
              Terms of Service
            </Link>
            <Link href="/contact" className="py-1 text-[#5A433B] underline-offset-4 transition-colors hover:text-[#E07B0C] hover:underline">
              Customer Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
