'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resolveFaqIcon } from '@/lib/faqIcons'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'
import { resolveHomeIcon } from '@/lib/homeIcons'
import {
  Clock,
  HelpCircle,
  Leaf,
  Plus,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'

type Faq = { id: string; question: string; answer: string; icon?: string | null }

/** The official WhatsApp logo (same glyph as the floating contact button). */
function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

const TRUST_ICONS: LucideIcon[] = [Leaf, ShieldCheck, Truck]

export function HomeFaqSection({
  faqs,
  content = HOME_DEFAULTS.faq,
}: {
  faqs: Faq[]
  content?: HomeContent['faq']
}) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)

  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <section id="faqs" className="relative overflow-hidden bg-[#FAF4EA] py-14 sm:py-20 lg:py-24 text-[#14361F]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Ambient saffron + herbal glows with a faint dotted texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0% 8%, rgba(240, 152, 25, 0.16) 0%, transparent 42%),
            radial-gradient(circle at 100% 95%, rgba(20, 77, 41, 0.12) 0%, transparent 45%),
            radial-gradient(rgba(20, 77, 41, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: 'auto, auto, 22px 22px',
        }}
      />

      {/* Giant faded question mark */}
      <HelpCircle
        className="pointer-events-none absolute -left-16 bottom-4 hidden h-72 w-72 text-[#144D29]/[0.045] lg:block"
        strokeWidth={1}
      />

      <div className="relative z-10 mx-auto max-w-[1330px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left: heading, trust badges, help card */}
          <div className="lg:col-span-5">
            <div className="space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE4D4] bg-[#EAF3EC] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#144D29] sm:text-xs">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{content.badge}</span>
              </div>

              <h2 className="font-serif text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]">
                {content.titleLine1} <br className="hidden sm:block" />
                {content.titleLine2}{' '}
                <span className="relative inline-block text-[#E07B0C]">
                  {content.titleHighlight}
                  <svg
                    viewBox="0 0 120 10"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 h-2 w-full text-[#F09819]"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M2 7c25-6 55-6 116-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>

              <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-[#5A453D] sm:text-base lg:mx-0">
                {content.subtitle}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {content.trustBadges.map(({ label, icon }, index) => {
                  const Icon = resolveHomeIcon(icon, TRUST_ICONS[index % TRUST_ICONS.length])
                  return (
                  <span
                    key={`${label}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#144D29] shadow-sm backdrop-blur-sm"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#E07B0C]" />
                    {label}
                  </span>
                  )
                })}
              </div>

              {/* Help card */}
              <div className="relative mx-auto mt-3 max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B6B38] via-[#144D29] to-[#0C3A1D] p-6 text-left text-white shadow-2xl shadow-[#144D29]/25 lg:mx-0">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#F09819]/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <p className="font-serif text-xl font-bold">{content.helpTitle}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/75">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#F6C177]" />
                    {content.helpHours}
                  </p>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <a
                      href={`https://wa.me/${content.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#1FBE5B]"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      {content.whatsappText}
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
                    >
                      {content.contactText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="space-y-3.5 lg:col-span-7">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id
              const Icon = resolveFaqIcon(faq.icon, faq.question)

              return (
                <div
                  key={faq.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-[#144D29] bg-gradient-to-br from-[#1A6234] to-[#0F3F22] shadow-2xl shadow-[#144D29]/25'
                      : 'border-[#EADFCB] bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#E07B0C]/40 hover:shadow-lg'
                  }`}
                >
                  {/* Saffron accent bar */}
                  <span
                    className={`absolute inset-y-0 left-0 w-1 bg-[#E07B0C] transition-opacity duration-300 ${
                      isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    className="flex w-full cursor-pointer items-center gap-3.5 p-4 text-left sm:gap-4 sm:p-5"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isOpen
                          ? 'bg-[#E07B0C] text-white'
                          : 'bg-[#EAF3EC] text-[#144D29] group-hover:bg-[#FFF1DC] group-hover:text-[#E07B0C]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${
                          isOpen ? 'text-[#F6C177]' : 'text-[#E07B0C]'
                        }`}
                      >
                        Q{String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`mt-0.5 block font-serif text-[15px] font-bold leading-snug sm:text-lg ${
                          isOpen ? 'text-white' : 'text-[#14361F]'
                        }`}
                      >
                        {faq.question}
                      </span>
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 border-white/30 bg-white/15 text-white'
                          : 'border-[#EADFCB] text-[#E07B0C] group-hover:border-[#E07B0C] group-hover:bg-[#E07B0C] group-hover:text-white'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${faq.id}`}
                    role="region"
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mx-4 border-t border-white/15 pb-5 pt-4 sm:mx-5 sm:pl-[60px]">
                        <p className="text-sm leading-relaxed text-white/85 sm:text-[15px]">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
