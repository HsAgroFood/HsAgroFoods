'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  MapPin,
  FileCheck,
  ChevronDown,
  X,
  Check,
} from 'lucide-react'
import { SPICE_ASSETS } from '@/constants/assets'

// 1. Regional Sourcing Origins with Assets
const ORIGIN_REGIONS = [
  {
    id: 'salem',
    state: 'Salem & Erode, Tamil Nadu',
    spice: 'High-Curcumin Turmeric',
    tag: '5.2% Active Curcumin',
    badgeColor: 'bg-[#FDF0E6] text-[#E07B0C] border-[#FADCC3]',
    image: '/images/about/region-salem.jpg',
    desc: 'Known as the gold capital of Indian turmeric. The fertile Cauvery river belt yields turmeric rhizomes with exceptionally high natural curcumin content and deep golden healing potency.',
    features: ['Direct farmer buyback', 'Sun-cured on earthen yards', 'Rich medicinal grade'],
  },
  {
    id: 'guntur',
    state: 'Guntur & Byadgi, Southern India',
    spice: 'Stemless Red Chillies',
    tag: 'Deep Crimson & Balanced Heat',
    badgeColor: 'bg-[#FDF0E6] text-[#E07B0C] border-[#FADCC3]',
    image: '/images/about/region-guntur.jpg',
    desc: 'A master blend of Byadgi chillies (for rich natural red oil and color) and select Guntur chillies (for zesty punch). 100% stemless to ensure zero bitterness and pure unadulterated spice.',
    features: ['100% stem-removed', 'Zero artificial Sudan dyes', 'Cold-process pulverized'],
  },
  {
    id: 'gujarat',
    state: 'Saurashtra, Gujarat',
    spice: 'Aromatic Cumin (Jeera)',
    tag: 'Essential Oil Rich',
    badgeColor: 'bg-[#FAF3E8] text-[#B87024] border-[#EDE4D9]',
    image: '/images/about/region-gujarat.jpg',
    desc: 'The dry, arid soil of Saurashtra produces dense, uniform cumin seeds packed with natural thymol. Slowly roasted to release earthy, nutty warmth in every pinch.',
    features: ['Machine cleaned (Sortex grade)', 'Slow toasted', 'Rich digestive enzymes'],
  },
  {
    id: 'kerala',
    state: 'Idukki & Wayanad, Kerala',
    spice: 'Shahi Garam Masala & Raw Banana',
    tag: 'Royal Blends & Fruit Powders',
    badgeColor: 'bg-[#EAF5ED] text-[#144D29] border-[#CFE3D3]',
    image: '/images/about/region-kerala.jpg',
    desc: 'Nestled in the misty Western Ghats, these spice gardens provide whole cardamom, cloves, and mace for our Shahi Garam Masala alongside nutrient-rich green bananas for our Raw Banana Powder.',
    features: ['Single-estate harvest', 'High volatile oil retention', 'Prebiotic & heirloom nutrition'],
  },
  {
    id: 'dehydrated',
    state: 'Nashik, Pune & North Indian Farms',
    spice: 'Dehydrated Veg & Fruit Powders',
    tag: '100% Natural Low-Temp Dehydrated',
    badgeColor: 'bg-[#FDF0E6] text-[#E07B0C] border-[#FADCC3]',
    image: '/images/products/beetroot-powder.png',
    desc: 'Farm-fresh red beetroots, vine-ripened tomatoes, crisp carrots, white radishes, and garlic cloves gently dehydrated at low temperatures to lock in natural color, vitamins, and flavor without preservatives.',
    features: ['Zero artificial colors', 'Instant culinary convenience', 'Peak vitamin & mineral retention'],
  },
]

// 2. Interactive Farm-to-Kitchen Steps
const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Ethical Direct Harvest',
    short: 'Sourcing',
    stat: '100% Single Origin',
    image: '/images/about/about-farmers.jpg',
    desc: 'We bypass industrial aggregators and source directly from generational Indian farmers at fair premium prices.',
    detail: 'Only top 5% grade-A whole crops are selected after strict moisture and density checks at farm gates.',
  },
  {
    step: '02',
    title: 'Natural Solar Curing',
    short: 'Sun-Drying',
    stat: '0% Artificial Heat',
    image: '/images/about/region-guntur.jpg',
    desc: 'Whole spices are air-cleaned, destoned, and naturally sun-cured under hygienic poly-tunnels.',
    detail: 'Preserves the delicate botanical oils and enzymes that industrial high-speed ovens incinerate.',
  },
  {
    step: '03',
    title: 'Cryo-Cold Grinding',
    short: 'Aroma-Lock',
    stat: '< 40°C Temperature',
    image: '/images/about/about-grinding.jpg',
    desc: 'Traditional stone-mill inspired slow grinding under controlled low temperature prevents aroma degradation.',
    detail: 'Locks in 100% of the natural volatile spice oils, delivering that intoxicating burst when you open the seal.',
  },
  {
    step: '04',
    title: 'Nitrogen-Flushed Pack',
    short: 'Packaging',
    stat: '12 Months Freshness',
    image: '/images/about/about-hero.jpg',
    desc: 'Hygienically packed in multi-barrier airtight zipper pouches within 24 hours of grinding.',
    detail: 'Prevents oxidation, humidity clumping, and keeps the spice as fresh as the day it was ground.',
  },
]

// 3. Comparison Matrix
const COMPARISON_POINTS = [
  {
    feature: 'Grinding Method',
    regular: 'High-speed industrial pulverizers (burns natural essential oils)',
    jaandaar: 'Cold-process slow grinding (locks in volatile oils & true aroma)',
  },
  {
    feature: 'Artificial Color & Dyes',
    regular: 'Often adulterated with synthetic red/yellow dyes (Sudan, Tartrazine)',
    jaandaar: '100% Natural Hue — zero colors, zero chemicals, pure botanical pigment',
  },
  {
    feature: 'Fillers & Bulking Agents',
    regular: 'Starch, sawdust, spent spices, or salt added for weight',
    jaandaar: 'Zero fillers, zero additives — 100% pure spices & dehydrated veg/fruit powders',
  },
  {
    feature: 'Packaging & Shelf Aroma',
    regular: 'Thin plastic bags prone to moisture loss and oxidation',
    jaandaar: 'Multi-layer aroma-barrier pouches with zipper lock',
  },
  {
    feature: 'Lab Quality Testing',
    regular: 'Rare batch tests, mass aggregated',
    jaandaar: 'Every single batch tested for heavy metals & purity standards',
  },
]

// 4. FAQ List
const FAQS = [
  {
    q: 'How does Cold-Process Grinding make a difference to my food?',
    a: 'Normal commercial grinders run at extreme speeds and generate temperatures above 80°C, which evaporates volatile spice oils (responsible for flavor and aroma). HS AgroFoods uses controlled low-temperature grinding below 40°C, keeping the medicinal curcumin in haldi and the natural capsaicin in chillies fully intact.',
  },
  {
    q: 'Why does your Red Chilly look naturally deeper rather than fluorescent red?',
    a: 'Mass-market chillies often use synthetic water-soluble dyes to appear unnaturally bright red. We use pure stemless Byadgi & Guntur red chillies whose deep crimson hue comes purely from natural capsaicin and natural oils — just honest, authentic color.',
  },
  {
    q: 'Are your spices tested for heavy metals and pesticide safety?',
    a: 'Yes, absolutely. Every production lot is tested by NABL-accredited laboratories to verify zero adulteration, zero heavy metals (Lead, Cadmium), and zero chemical pesticides before packaging.',
  },
  {
    q: 'How should I store HS AgroFoods once opened?',
    a: 'Keep the spices in our resealable aroma-protection pouches or transfer them into clean, dry airtight glass/steel jars away from direct sunlight and stove heat to maintain peak fragrance.',
  },
]

export default function AboutPage() {
  const [activeRegion, setActiveRegion] = useState(ORIGIN_REGIONS[0].id)
  const [activeStep, setActiveStep] = useState(0)
  const [labModalOpen, setLabModalOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const currentRegion = ORIGIN_REGIONS.find((r) => r.id === activeRegion) || ORIGIN_REGIONS[0]

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#14361F] relative overflow-hidden">
      {/* ── Ambient Background Lighting ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[650px] pointer-events-none select-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 15%, rgba(224, 123, 12, 0.08) 0%, rgba(20, 77, 41, 0.04) 45%, transparent 75%)',
        }}
      />

      {/* Decorative Corner Asset: Top Left Natural Spice Leaves Accent */}
      <div className="absolute top-0 left-0 w-44 h-44 sm:w-64 sm:h-64 lg:w-96 lg:h-96 pointer-events-none select-none mix-blend-multiply opacity-75 z-0 -scale-x-100">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spice Leaves Accent"
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
          alt="Natural Spice Leaves Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 176px, 384px"
          priority={false}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          1. Hero Header Section — Matching Home Page Style & Sizing
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 border-b border-[#EDE4D9]/80 z-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E07B0C]" />
                <span>Our Heritage &amp; Purity Promise</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14361F] leading-[1.15]">
                Pure Spice. <br />
                <span className="text-[#E07B0C]">Real Taste.</span> <br />
                Trusted Every Time.
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-[#5A433B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                HS AgroFoods was born from a timeless conviction: your family deserves pure, unadulterated spices and natural dehydrated vegetable &amp; fruit powders — crafted with rich aroma, vibrant nutrition, and zero shortcuts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md shadow-[#E07B0C]/25 hover:shadow-lg transition-all active:scale-95"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setLabModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[5px] bg-white hover:bg-[#FAF3EB] border border-[#EDE4D9] text-[#14361F] text-xs sm:text-sm font-bold tracking-wide shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-[#E07B0C]" />
                  <span>View Lab Certificate</span>
                </button>
              </div>
            </div>

            {/* Right Hero Visual Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-[5px] overflow-hidden shadow-xl border border-[#EDE4D9] bg-white p-3 group">
                <div className="relative w-full h-[320px] sm:h-[400px] rounded-[5px] overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src="/images/about/about-hero.jpg"
                    alt="Artisanal Indian Organic Spice Farm Harvest"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[#E07B0C] text-white px-2.5 py-0.5 rounded-[5px] inline-block mb-1.5 shadow-xs">
                      Farm Harvest
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold leading-tight drop-shadow-xs">
                      100% Single Origin Sun-Drying
                    </h4>
                    <p className="text-[11px] text-white/85 mt-0.5">
                      Direct from generational Indian heritage farms
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          2. Trust Metrics Counter Strip (Overlapping Modern Card)
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto">
          <div className="bg-white rounded-[5px] p-6 sm:p-8 shadow-md border border-[#EDE4D9] grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D9]">
            
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E07B0C]">100%</span>
              <span className="text-xs sm:text-sm font-bold text-[#14361F] mt-1.5">Single Origin Harvests</span>
              <span className="text-[11px] sm:text-xs text-[#7A6458] mt-0.5">Directly farm-sourced</span>
            </div>

            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E07B0C]">0%</span>
              <span className="text-xs sm:text-sm font-bold text-[#14361F] mt-1.5">Artificial Dyes or Fillers</span>
              <span className="text-[11px] sm:text-xs text-[#7A6458] mt-0.5">Zero Sudan or chemical colors</span>
            </div>

            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E07B0C]">&lt; 40°C</span>
              <span className="text-xs sm:text-sm font-bold text-[#14361F] mt-1.5">Cold-Process Grinding</span>
              <span className="text-[11px] sm:text-xs text-[#7A6458] mt-0.5">Preserves aroma &amp; volatile oils</span>
            </div>

            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E07B0C]">50,000+</span>
              <span className="text-xs sm:text-sm font-bold text-[#14361F] mt-1.5">Happy Kitchens</span>
              <span className="text-[11px] sm:text-xs text-[#7A6458] mt-0.5">Trusted across India</span>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          3. Brand Roots & Heritage Story (2 Columns)
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Story Narrative */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
                <Leaf className="w-3 h-3 text-[#144D29] fill-[#144D29]/20" />
                <span>Our Roots &amp; Heritage</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#14361F] leading-[1.2]">
                The Story Behind Our <span className="text-[#E07B0C]">Purity</span>
              </h2>

              <div className="w-12 h-0.5 bg-[#E07B0C]/50 rounded-[5px] mx-auto lg:mx-0" />

              <div className="space-y-4 text-sm sm:text-base text-[#5A433B] leading-relaxed">
                <p>
                  In traditional Indian households, spices are more than just cooking ingredients — they are the heartbeat of family feasts, ancestral healing remedies, and lifelong memories.
                </p>
                <p>
                  Yet, modern mass-produced powders often lose their natural oils and potency through harsh high-heat pulverization, artificial colors, and added starches. At <strong>HS AgroFoods</strong>, we set out to restore that lost culinary glory.
                </p>
                <p>
                  We partner directly with generational farmers across India. Every batch of our Turmeric, Red Chilli, Coriander, Zeera, Shahi Garam Masala, Chaat Masala, and our Dehydrated Beetroot, Tomato, Banana, Garlic, Carrot &amp; Radish Powders is processed at controlled low temperatures — locking in natural antioxidants, vitamins, and unmistakable aroma.
                </p>
              </div>

              {/* 2 Feature Pillar Badges */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3.5 p-4 rounded-[5px] bg-white border border-[#EDE4D9] shadow-2xs flex-1">
                  <div className="w-11 h-11 rounded-[5px] bg-[#FDF0E6] border border-[#FADCC3] flex items-center justify-center text-[#E07B0C] shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-[#14361F]">Direct Farmer Sourcing</p>
                    <p className="text-[11px] sm:text-xs text-[#7A6458]">Fair-trade ethical harvest</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-[5px] bg-white border border-[#EDE4D9] shadow-2xs flex-1">
                  <div className="w-11 h-11 rounded-[5px] bg-[#EAF5ED] border border-[#CFE3D3] flex items-center justify-center text-[#144D29] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-[#14361F]">FSSAI &amp; AGMARK Certified</p>
                    <p className="text-[11px] sm:text-xs text-[#7A6458]">NABL Lab-Tested Batches</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card with Authentic Farmer Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-[5px] overflow-hidden shadow-xl border border-[#EDE4D9] bg-white group p-3">
                <div className="relative w-full h-[320px] sm:h-[420px] rounded-[5px] overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src="/images/about/about-farmers.jpg"
                    alt="Indian farmer holding raw golden turmeric and red chillies"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Floating Quality Seal Pill */}
                <div className="absolute bottom-6 left-6 right-6 rounded-[5px] bg-white/95 backdrop-blur-md p-4 border border-[#EDE4D9] shadow-lg flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-[5px] overflow-hidden shrink-0 border border-[#E07B0C]/40 shadow-2xs bg-[#FAF7F2]">
                    <Image
                      src={SPICE_ASSETS.qualitySeal}
                      alt="Quality Seal"
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#14361F]">100% Raw &amp; Untainted</h4>
                    <p className="text-xs text-[#7A6458]">Handpicked directly from generational Indian farms.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          4. Interactive Regional Sourcing Explorer ("Farm-to-Pouch Traceability")
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#F5EFE6]/50 border-y border-[#EDE4D9] relative z-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#FDF0E6] border border-[#FADCC3] text-[#E07B0C] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>Farm-to-Pouch Traceability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-[#14361F] tracking-tight">
              Where Our <span className="text-[#E07B0C]">Spices</span> Originate
            </h2>
            <p className="text-sm sm:text-base text-[#615147] leading-relaxed">
              Select any region to explore its single-origin harvest, terroir, and artisanal spice profile.
            </p>
          </div>

          {/* Region Tabs (Pill Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10">
            {ORIGIN_REGIONS.map((region) => {
              const isActive = activeRegion === region.id
              return (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[5px] text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[#E07B0C] text-white shadow-md shadow-[#E07B0C]/25 ring-2 ring-[#E07B0C]/30'
                      : 'bg-white hover:bg-[#FAF3EB] text-[#14361F] border border-[#EDE4D9] shadow-2xs'
                  }`}
                >
                  <div className="relative w-6 h-6 rounded-[5px] overflow-hidden border border-white/60 shadow-2xs shrink-0 bg-[#FAF7F2]">
                    <Image
                      src={region.image}
                      alt={region.spice}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span>{region.spice}</span>
                </button>
              )
            })}
          </div>

          {/* Active Region Showcase Card */}
          <div className="bg-white rounded-[5px] p-6 sm:p-10 border border-[#EDE4D9] shadow-md transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Region Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-[5px] text-xs font-bold border ${currentRegion.badgeColor}`}>
                    {currentRegion.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#7A6458] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#E07B0C]" />
                    <span>{currentRegion.state}</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">
                  {currentRegion.spice}
                </h3>

                <p className="text-sm sm:text-base text-[#5A433B] leading-relaxed">
                  {currentRegion.desc}
                </p>

                {/* 3 Key Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {currentRegion.features.map((feat) => (
                    <div
                      key={feat}
                      className="p-3.5 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] flex items-center gap-2.5 text-xs font-semibold text-[#14361F]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#144D29] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E07B0C] hover:text-[#144D29] hover:underline"
                  >
                    <span>Shop {currentRegion.spice} Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Region Harvest Photo Frame */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm h-[260px] sm:h-[320px] rounded-[5px] overflow-hidden shadow-md border border-[#EDE4D9] bg-[#FAF7F2] group">
                  <Image
                    src={currentRegion.image}
                    alt={currentRegion.spice}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="inline-block px-3.5 py-1 rounded-[5px] bg-white/95 backdrop-blur-md text-[#14361F] text-xs font-bold shadow-2xs">
                      📍 {currentRegion.state}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          5. Interactive 4-Step Cold-Grinding Process ("The Culinary Science")
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>The Culinary Science</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-[#14361F] tracking-tight">
              From Farm To Kitchen
            </h2>
            <p className="text-sm sm:text-base text-[#615147] leading-relaxed">
              Click each step to see how traditional slow stone-grinding protects fragile volatile spice oils.
            </p>
          </div>

          {/* 4 Interactive Step Selector Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {PROCESS_STEPS.map((step, idx) => {
              const isActive = activeStep === idx
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 sm:p-4 lg:p-5 rounded-[5px] text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#E07B0C] ring-2 ring-[#E07B0C]/20 shadow-md -translate-y-0.5'
                      : 'bg-white/80 hover:bg-white text-[#14361F] border-[#EDE4D9] shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-1.5 w-full">
                    <span className={`font-serif text-xl sm:text-2xl font-black ${isActive ? 'text-[#E07B0C]' : 'text-[#7A6458]'}`}>
                      {step.step}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-[4px] self-start xs:self-auto ${
                        isActive
                          ? 'bg-[#FDF0E6] text-[#E07B0C] border border-[#FADCC3]'
                          : 'bg-[#FAF7F2] text-[#7A6458]'
                      }`}
                    >
                      {step.stat}
                    </span>
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm lg:text-base font-bold mt-2 sm:mt-4 text-[#14361F] leading-tight">
                    {step.title}
                  </h4>
                </button>
              )
            })}
          </div>

          {/* Active Step Detailed Card */}
          <div className="bg-white rounded-[5px] p-4 sm:p-6 lg:p-8 border border-[#EDE4D9] shadow-md grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center">
            
            <div className="md:col-span-8 space-y-3">
              <span className="text-[11px] sm:text-xs font-bold text-[#E07B0C] uppercase tracking-widest">
                Step {PROCESS_STEPS[activeStep].step}: {PROCESS_STEPS[activeStep].short}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#14361F]">
                {PROCESS_STEPS[activeStep].title}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-[#5A433B] leading-relaxed">
                {PROCESS_STEPS[activeStep].desc}
              </p>
              
              <div className="p-3 sm:p-3.5 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] text-xs sm:text-sm text-[#14361F]">
                <strong className="text-[#E07B0C]">✦ Culinary Impact:</strong> {PROCESS_STEPS[activeStep].detail}
              </div>

              {/* Previous / Next Navigation Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-[5px] border border-[#EDE4D9] bg-white text-xs font-bold text-[#14361F] disabled:opacity-40 hover:bg-[#FAF3EB] cursor-pointer transition-colors shadow-2xs active:scale-95"
                >
                  Previous
                </button>
                <button
                  disabled={activeStep === PROCESS_STEPS.length - 1}
                  onClick={() => setActiveStep((prev) => Math.min(PROCESS_STEPS.length - 1, prev + 1))}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-[5px] bg-[#14361F] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#0E2816] cursor-pointer transition-colors shadow-2xs active:scale-95"
                >
                  Next Step
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px] h-[180px] sm:h-[210px] rounded-[5px] overflow-hidden shadow-md border border-[#EDE4D9] bg-[#FAF7F2]">
                <Image
                  src={PROCESS_STEPS[activeStep].image}
                  alt={PROCESS_STEPS[activeStep].title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 280px"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          6. The Purity Showdown: Ordinary Spices vs. HS AgroFoods
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#F5EFE6]/50 border-y border-[#EDE4D9] relative z-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#FDF0E6] border border-[#FADCC3] text-[#E07B0C] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>The Honest Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-[#14361F] tracking-tight">
              Ordinary Spices vs. <span className="text-[#E07B0C]">HS AgroFoods</span>
            </h2>
            <p className="text-sm sm:text-base text-[#615147] leading-relaxed">
              See why switching to honest, cold-ground spices makes every meal healthier and tastier.
            </p>
          </div>

          {/* Comparison Matrix Table Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-[5px] overflow-hidden border border-[#EDE4D9] shadow-md">
            
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#EDE4D9] text-xs font-bold uppercase tracking-wider text-[#7A6458]">
              <div className="md:col-span-4 hidden md:block">Quality Parameter</div>
              <div className="md:col-span-4 text-rose-800 font-bold">Standard Market Brands</div>
              <div className="md:col-span-4 text-[#144D29] font-black">HS AgroFoods Guaranteed</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#EDE4D9]">
              {COMPARISON_POINTS.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 items-center hover:bg-[#FAF7F2]/50 transition-colors"
                >
                  <div className="md:col-span-4 font-serif font-bold text-sm text-[#14361F]">
                    {item.feature}
                  </div>
                  
                  {/* Standard Brands */}
                  <div className="md:col-span-4 flex items-start gap-2.5 text-xs text-[#8C4A4A] bg-rose-50/70 p-3 rounded-[5px] border border-rose-100">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{item.regular}</span>
                  </div>

                  {/* HS AgroFoods */}
                  <div className="md:col-span-4 flex items-start gap-2.5 text-xs text-[#14361F] bg-[#EAF5ED]/70 p-3 rounded-[5px] border border-[#CFE3D3] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#144D29] shrink-0 mt-0.5" />
                    <span>{item.jaandaar}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          7. Interactive FAQ Section
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E07B0C]" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#14361F]">
              Purity &amp; Quality FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[5px] border border-[#EDE4D9] overflow-hidden transition-all shadow-2xs hover:border-[#D8C7B5]"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-[#14361F] hover:text-[#E07B0C] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#E07B0C] transition-transform duration-200 shrink-0 ml-3 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5A433B] leading-relaxed border-t border-[#EDE4D9]/80 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          8. Bottom CTA Banner (Warm Forest Green & Saffron)
         ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto">
          <div className="relative rounded-[5px] overflow-hidden bg-gradient-to-br from-[#14361F] via-[#144D29] to-[#0E2816] text-white p-8 sm:p-12 lg:p-16 text-center shadow-xl border border-[#235835]">
            
            {/* Ambient Radial Accent */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 30%, rgba(224, 123, 12, 0.22) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#F5C284]">
                ✦ 100% Pure &amp; Artisanal Spices
              </span>
              
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Bring Home The Taste of <span className="text-[#E07B0C]">Purity</span>
              </h2>
              
              <p className="text-sm sm:text-base text-[#D4E4D8] leading-relaxed font-normal">
                Taste the honest aroma of generational Indian spices, stone-ground with passion and sealed with integrity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] px-8 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-lg shadow-[#E07B0C]/25 transition-all active:scale-95"
                >
                  <span>Shop All Products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-[5px] border border-white/30 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-2xs transition-all active:scale-95 backdrop-blur-xs"
                >
                  Contact Our Team
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          9. Interactive Lab Test Certificate Modal
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {labModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setLabModalOpen(false)}
          />

          <div className="relative bg-[#FAF7F2] rounded-[5px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EDE4D9] z-10 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D9]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#E07B0C]" />
                <h3 className="font-serif text-lg font-bold text-[#14361F]">
                  Sample Purity Certificate
                </h3>
              </div>
              <button
                onClick={() => setLabModalOpen(false)}
                className="p-1.5 rounded-[5px] bg-white text-[#7A6458] hover:text-[#E07B0C] border border-[#EDE4D9] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 text-xs text-[#5A433B]">
              <div className="p-3.5 bg-white rounded-[5px] border border-[#EDE4D9] space-y-1">
                <div className="flex justify-between font-semibold text-[#14361F]">
                  <span>Batch: AS-SALEM-2026-09</span>
                  <span className="text-emerald-700 font-bold">STATUS: PASSED ✓</span>
                </div>
                <p className="text-[11px] text-[#7A6458]">Certified by NABL Accredited Testing Facility</p>
              </div>

              <div className="bg-white rounded-[5px] p-4 border border-[#EDE4D9] space-y-2.5">
                <div className="flex justify-between py-1 border-b border-[#EDE4D9]">
                  <span>Active Curcumin Content</span>
                  <strong className="text-[#E07B0C]">5.21% (Grade A+)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EDE4D9]">
                  <span>Volatile Essential Oils</span>
                  <strong className="text-[#E07B0C]">4.85 ml / 100g</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EDE4D9]">
                  <span>Artificial Dyes (Sudan I-IV)</span>
                  <strong className="text-emerald-700">NOT DETECTED (0.00%)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EDE4D9]">
                  <span>Heavy Metals (Pb, Cd, As)</span>
                  <strong className="text-emerald-700">Below Limits of Detection</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Moisture Level</span>
                  <strong className="text-[#14361F]">6.4% (Optimal Purity)</strong>
                </div>
              </div>

              <p className="text-[11px] text-[#7A6458] italic text-center">
                * Every batch of HS AgroFoods is tested to exceed stringent FSSAI and AGMARK standards.
              </p>
            </div>

            <button
              onClick={() => setLabModalOpen(false)}
              className="w-full py-3 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer transition-colors"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
