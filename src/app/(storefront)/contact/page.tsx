import { Mail, Phone, MapPin, Clock, PackageCheck, Truck, ShieldCheck } from 'lucide-react'
import { ContactForm } from '@/components/storefront/ContactForm'

export const metadata = {
  title: 'Contact Us — We Are Here To Help | HS AgroFoods',
  description: 'Get in touch with the HS AgroFoods customer care team for product queries, wholesale & bulk orders, or shipping assistance.',
}

export default function ContactPage() {
  const contactDetails = [
    {
      title: 'Our Store & Experience Hub',
      desc: '4-11-92/3/A, M.M. Pahadi, Attapur, Hyderabad, Telangana 500048',
      actionText: 'Get Directions',
      actionHref: 'https://maps.google.com/?q=4-11-92/3/A+M.M.pahadi+Attapur+Hyderabad+Telangana+500048',
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
    },
  ]

  const supportCards = [
    {
      title: 'Wholesale & Bulk Orders',
      desc: 'Special B2B pricing and packaging for restaurants, caterers, and retail stores.',
      icon: <PackageCheck className="w-6 h-6" />,
    },
    {
      title: 'All-India Express Delivery',
      desc: 'Reliable doorstep delivery across all pin codes in India with live tracking.',
      icon: <Truck className="w-6 h-6" />,
    },
    {
      title: '100% Purity Guarantee',
      desc: 'Every spice and dehydrated powder batch is lab tested and sealed fresh for authentic aroma and nutrition.',
      icon: <ShieldCheck className="w-6 h-6" />,
    },
  ]

  return (
    <div className="bg-[#FFF9F0] min-h-screen text-[#14361F] overflow-hidden">
      
      {/* 1. Hero Header — Warm Cream & Saffron */}
      <section className="relative bg-gradient-to-br from-[#FFF9F0] via-[#FFEDD2] to-[#FCE0B4] text-[#14361F] py-14 sm:py-20 lg:py-24 overflow-hidden border-b border-[#F2DCBA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-[#F09819]/50 px-4 py-1 text-xs sm:text-sm font-bold tracking-wider text-[#B85D0B] uppercase shadow-2xs">
            <span>✦</span>
            <span>We&apos;re Here For You</span>
            <span>✦</span>
          </div>

          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight text-[#144D29] leading-[1.15]">
            Get In <span className="text-[#E07B0C]">Touch</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#4A3B2C] max-w-xl mx-auto leading-relaxed font-medium">
            Have a question about our pure spices, dehydrated vegetable &amp; fruit powders, or bulk wholesale orders? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* 2. Main Content: Info & Form */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E07B0C]">Contact Channels</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#144D29]">
                  How Can We Help You?
                </h2>
                <p className="text-xs sm:text-sm text-[#4A3B2C] leading-relaxed">
                  Reach out to us through any of the channels below or fill out the form, and our team will get in touch promptly.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {contactDetails.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-white p-5 border border-[#F0DEC2] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#FFF8EB] border border-[#F09819]/40 flex items-center justify-center text-[#E07B0C] shrink-0 mt-0.5 shadow-xs">
                      {item.icon}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#144D29]">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C4934] leading-relaxed break-words">
                        {item.desc}
                      </p>
                      {item.actionText && item.actionHref && (
                        <a
                          href={item.actionHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-bold text-[#E07B0C] hover:text-[#144D29] hover:underline pt-1 transition-colors"
                        >
                          {item.actionText} →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Official Social Media Accounts */}
              <div className="rounded-2xl bg-white p-5 border border-[#F0DEC2] shadow-sm space-y-3">
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#144D29]">
                  Follow HS AgroFoods On Social Media
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFF8EB] border border-[#F09819]/40 text-xs font-bold text-[#144D29] transition-all ${social.color}`}
                    >
                      {social.icon}
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      {/* 3. Three Quick Support Pillars */}
      <section className="py-12 sm:py-16 bg-[#FFF3DF] border-t border-[#F2DCBA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportCards.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-white p-6 border border-[#F0DEC2] shadow-sm flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF8EB] border border-[#F09819]/40 flex items-center justify-center text-[#E07B0C] shadow-xs">
                  {c.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-[#144D29]">{c.title}</h3>
                <p className="text-xs text-[#5C4934] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
