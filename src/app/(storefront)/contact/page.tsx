import Image from 'next/image'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  PackageCheck,
  Truck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react'
import { ContactForm } from '@/components/storefront/ContactForm'

export const metadata = {
  title: 'Contact Us — We Are Here To Help | HS AgroFoods',
  description:
    'Get in touch with the HS AgroFoods customer care team for product queries, wholesale & bulk orders, or shipping assistance.',
}

export default function ContactPage() {
  const contactDetails = [
    {
      title: 'Our Store & Experience Hub',
      desc: '4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana 500048',
      actionText: 'Get Directions',
      actionHref:
        'https://maps.google.com/?q=4-11-92/3/A+M.M.pahadi+Attapur+Hyderabad+Telangana+500048',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      title: 'Call & WhatsApp Support',
      desc: '+91 94931 84110 / +91 91009 39110 (Mon – Sat, 9:00 AM – 7:00 PM IST)',
      actionText: 'Chat on WhatsApp',
      actionHref: 'https://wa.me/919493184110',
      icon: <Phone className="w-5 h-5" />,
    },
    {
      title: 'Email Inquiries',
      desc: 'Hs.foodofficial@gmail.com (We respond within 24 business hours)',
      actionText: 'Send an Email',
      actionHref: 'mailto:Hs.foodofficial@gmail.com',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      title: 'Working Hours',
      desc: 'Monday to Saturday: 9:00 AM – 7:00 PM IST (Sunday Closed)',
      actionText: null,
      actionHref: null,
      icon: <Clock className="w-5 h-5" />,
    },
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@hs_agro_foods',
      href: 'https://www.instagram.com/hs_agro_foods?srtk=eXNkaGNxb2gxYWZr',
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
      color: 'hover:bg-pink-600 hover:text-white hover:border-pink-600',
    },
    {
      name: 'YouTube',
      handle: '@hsagrofoods',
      href: 'https://youtube.com/@hsagrofoods?si=KEc9fwnvsNcZ7778',
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      ),
      color: 'hover:bg-red-600 hover:text-white hover:border-red-600',
    },
    {
      name: 'Facebook',
      handle: 'HS AgroFoods',
      href: 'https://www.facebook.com/share/1A5kcJC8iR/',
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
    },
  ]

  const supportCards = [
    {
      title: 'Wholesale & Bulk Orders',
      desc: 'Special B2B pricing and packaging for restaurants, caterers, cloud kitchens, and retail stores.',
      icon: <PackageCheck className="w-6 h-6" />,
      tag: 'B2B Supply',
    },
    {
      title: 'All-India Express Delivery',
      desc: 'Reliable doorstep delivery across all pin codes in India with multi-layer fresh aroma packaging.',
      icon: <Truck className="w-6 h-6" />,
      tag: 'Doorstep Courier',
    },
    {
      title: '100% Purity Guarantee',
      desc: 'Every spice and dehydrated powder batch is NABL lab tested and sealed fresh with zero dyes or fillers.',
      icon: <ShieldCheck className="w-6 h-6" />,
      tag: 'Certified Purity',
    },
  ]

  const quickHighlights = [
    { label: '< 24h Response Time', icon: Clock },
    { label: 'Direct WhatsApp Assistance', icon: MessageCircle },
    { label: 'Hyderabad Experience Hub', icon: MapPin },
    { label: 'All-India Express Shipping', icon: Truck },
  ]

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] relative overflow-hidden">
      {/* ── Ambient Background Lighting ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[550px] pointer-events-none select-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 15%, rgba(224, 123, 12, 0.08) 0%, rgba(20, 77, 41, 0.04) 45%, transparent 75%)',
        }}
      />

      {/* Decorative Corner Asset: Top Left Natural Spices Accent */}
      <div className="absolute top-0 left-0 w-44 h-44 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply opacity-75 z-0 -scale-x-100">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spices Leaves Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 176px, 384px"
          priority={false}
        />
      </div>

      {/* Decorative Corner Asset: Top Right Spices Accent */}
      <div className="absolute top-0 right-0 w-44 h-44 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply opacity-75 z-0">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spices Leaves Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 176px, 384px"
          priority={false}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          1. Hero Header Section — Exact padding: py-10 sm:py-14 lg:py-16
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-10 sm:py-14 lg:py-16 border-b border-[#EDE4D9]/80 z-10">
        <div className="mx-auto max-w-[1370px] px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 sm:space-y-5">
          
          {/* Category Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E07B0C]" />
            <span>We&apos;re Here For You</span>
            <span className="text-[#E07B0C]">✦</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14361F] leading-[1.15]">
            Get In <span className="text-[#E07B0C]">Touch</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#5A433B] max-w-2xl mx-auto leading-relaxed font-normal">
            Have a question about our pure spices, cold-ground masalas, dehydrated vegetable &amp; fruit powders, or bulk wholesale orders? We are here to help your kitchen thrive.
          </p>

          {/* 4 Mini Trust Highlights Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {quickHighlights.map((hl) => {
              const Icon = hl.icon
              return (
                <div
                  key={hl.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-white border border-[#EDE4D9] text-[#14361F] text-xs font-semibold shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[#E07B0C]" />
                  <span>{hl.label}</span>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          2. Main Content: Info Channels & Contact Form — Exact padding: py-10 sm:py-14 lg:py-16
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Contact Channels (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="space-y-2">
                <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E07B0C]">
                  Contact Channels
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">
                  How Can We Help You?
                </h2>
                <p className="text-xs sm:text-sm text-[#5A433B] leading-relaxed">
                  Reach out to us through any of the channels below or fill out the inquiry form, and our spice care team will get in touch promptly.
                </p>
              </div>

              {/* 4 Detailed Contact Channel Cards */}
              <div className="space-y-3.5 pt-1">
                {contactDetails.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[5px] bg-white p-4 sm:p-5 border border-[#EDE4D9] shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] flex items-center justify-center text-[#E07B0C] shrink-0 mt-0.5 shadow-2xs">
                      {item.icon}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#14361F]">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5A433B] leading-relaxed break-words">
                        {item.desc}
                      </p>
                      {item.actionText && item.actionHref && (
                        <a
                          href={item.actionHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#E07B0C] hover:text-[#14361F] hover:underline pt-1 transition-colors"
                        >
                          <span>{item.actionText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Official Social Media Card */}
              <div className="rounded-[5px] bg-white p-5 border border-[#EDE4D9] shadow-2xs space-y-3">
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#14361F]">
                  Follow HS AgroFoods On Social Media
                </h3>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] text-xs font-bold text-[#14361F] transition-all shadow-2xs ${social.color}`}
                    >
                      {social.icon}
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Contact Inquiry Form (7 cols) */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          3. Three Quick Support Pillars — Exact padding: py-10 sm:py-14 lg:py-16
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#F5EFE6]/50 border-t border-[#EDE4D9] relative z-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E07B0C]">
              Wholesale &amp; Direct Support
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14361F]">
              Dedicated Service For Every Order
            </h2>
            <p className="text-xs sm:text-sm text-[#615147] leading-relaxed">
              Whether you are an everyday home cook or a bulk food business, we ensure pure unadulterated quality every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportCards.map((c) => (
              <div
                key={c.title}
                className="rounded-[5px] bg-white p-6 sm:p-8 border border-[#EDE4D9] shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] flex items-center justify-center text-[#E07B0C] shadow-2xs">
                  {c.icon}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[5px] bg-[#FDF0E6] text-[#E07B0C] border border-[#FADCC3]">
                  {c.tag}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#14361F]">{c.title}</h3>
                <p className="text-xs sm:text-sm text-[#5A433B] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          4. Experience Hub Location Card & Banner — Exact padding: py-10 sm:py-14 lg:py-16
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 border-t border-[#EDE4D9] relative z-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[5px] bg-white border border-[#EDE4D9] shadow-md p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Location Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#E07B0C]" />
                <span>Hyderabad Headquarters &amp; Experience Hub</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14361F]">
                Visit Us in <span className="text-[#E07B0C]">Attapur, Hyderabad</span>
              </h2>

              <p className="text-sm sm:text-base text-[#5A433B] leading-relaxed">
                Experience the authentic aromas of stone-ground single-origin spices and explore our full range of 100% natural dehydrated vegetable &amp; fruit powders in person.
              </p>

              <div className="space-y-2 text-xs sm:text-sm text-[#5A433B] pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#144D29] shrink-0" />
                  <span><strong>Address:</strong> 4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana 500048</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#144D29] shrink-0" />
                  <span><strong>Timings:</strong> Monday to Saturday: 9:00 AM – 7:00 PM IST (Sunday Closed)</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=4-11-92/3/A+M.M.pahadi+Attapur+Hyderabad+Telangana+500048"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md shadow-[#E07B0C]/25 transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href="https://wa.me/919493184110"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[5px] bg-white hover:bg-[#FAF7F2] border border-[#EDE4D9] text-[#14361F] text-xs sm:text-sm font-bold tracking-wide shadow-2xs transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-[#E07B0C]" />
                  <span>WhatsApp: +91 94931 84110</span>
                </a>
              </div>
            </div>

            {/* Right Map Visual / Directions Card */}
            <div className="lg:col-span-5">
              <div className="rounded-[5px] overflow-hidden border border-[#EDE4D9] bg-[#FAF7F2] p-4 text-center space-y-4 shadow-2xs">
                <div className="relative w-full h-[220px] sm:h-[260px] rounded-[5px] overflow-hidden border border-[#EDE4D9] bg-[#EBF3ED] flex items-center justify-center group">
                  <iframe
                    title="HS AgroFoods Hyderabad Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.204362143719!2d78.4312!3d17.3534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIxJzEyLjIiTiA3OMKwMjUnNTIuMyJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[#7A6458] px-1">
                  <span>📍 Attapur, Hyderabad</span>
                  <span className="font-semibold text-[#144D29]">Open Mon–Sat 9AM–7PM</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
