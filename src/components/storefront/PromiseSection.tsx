'use client'

import Image from 'next/image'
import { Leaf, FlaskConical, Trophy, Heart, ShieldCheck } from 'lucide-react'
import { SPICE_ASSETS } from '@/constants/assets'

export function PromiseSection() {
  // 4 Feature Pillars in the 2x2 Grid (Right Column)
  const promiseCards = [
    {
      id: 'natural',
      title: '100% Natural',
      desc: 'Nothing artificial, Just pure spices.',
      Icon: Leaf,
      iconColor: 'text-[#227B44]',
      iconBg: 'bg-[#EAF5ED]',
    },
    {
      id: 'preservatives',
      title: 'No Preservatives',
      desc: 'No chemicals, no compromise.',
      Icon: FlaskConical,
      iconColor: 'text-[#D96B1C]',
      iconBg: 'bg-[#FDF0E6]',
    },
    {
      id: 'quality',
      title: 'Finest Quality',
      desc: 'Carefully selected & ground.',
      Icon: Trophy,
      iconColor: 'text-[#B87024]',
      iconBg: 'bg-[#FAF3E8]',
    },
    {
      id: 'trusted',
      title: 'Trusted by Thousands',
      desc: 'Customer trust is our biggest reward.',
      Icon: Heart,
      iconColor: 'text-[#D96B1C]',
      iconBg: 'bg-[#FDF0E6]',
    },
  ]

  // 4 Mini Trust Highlights under left description
  const leftMiniBadges = [
    {
      label: '100% Natural',
      Icon: Leaf,
      color: 'text-[#144D29]',
    },
    {
      label: 'No Preservatives',
      Icon: FlaskConical,
      color: 'text-[#D97706]',
    },
    {
      label: 'Premium Quality',
      Icon: ShieldCheck,
      color: 'text-[#144D29]',
    },
    {
      label: 'Trusted by Thousands',
      Icon: Heart,
      color: 'text-[#D97706]',
    },
  ]

  return (
    <section
      id="our-promise"
      className="relative overflow-hidden py-10 sm:py-14 lg:py-16 bg-[#FAF7F2] text-[#14361F]"
    >
      {/* ─── Ambient Decorative Side Backgrounds from images_010 ─── */}
      {/* Left Decor: Turmeric Bowl & Golden Spice Dust */}
      <div className="absolute top-0 bottom-[-50px] left-[-170px] w-44 sm:w-64 md:w-80 lg:w-96 xl:w-[420px] pointer-events-none select-none z-0 mix-blend-multiply opacity-80 sm:opacity-90">
        <Image
          src="/images/images_010/left.png"
          alt="Turmeric & Spices Left Decor"
          fill
          className="object-contain object-left"
          sizes="(max-width: 768px) 192px, 420px"
          priority={false}
        />
      </div>

      {/* Right Decor: Red Chilli Bowl & Fiery Spices Dust */}
      <div className="absolute top-0 bottom-0 right-[-30px] w-44 sm:w-64 md:w-80 lg:w-96 xl:w-[420px] pointer-events-none select-none z-0 mix-blend-multiply opacity-80 sm:opacity-90">
        <Image
          src="/images/images_010/right.png"
          alt="Chilli & Spices Right Decor"
          fill
          className="object-contain object-right"
          sizes="(max-width: 768px) 192px, 420px"
          priority={false}
        />
      </div>

      {/* Soft Center Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.75) 0%, transparent 75%)
          `,
        }}
      />

      <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-8 items-center">

          {/* ─── Column 1: Left Headline, Description & 4 Mini Badges ─── */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 text-center lg:text-left lg:ml-[20px] relative z-10">
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Leaf className="w-3 h-3 text-[#144D29] fill-[#144D29]/20" />
              <span>NATURAL • HEALTHY • PURE</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14361F] leading-[1.15]">
              Our Promise<br />
              Pure. Natural. <span className="text-[#E07B0C]">Trusted.</span>
            </h2>

            {/* Small Organic Green Accent Line */}
            <div className="w-10 h-1 bg-[#2E6B3E] rounded-full mx-auto lg:mx-0 my-2" />

            {/* Description Subtitle */}
            <p className="text-sm sm:text-base bg-[#FAF7F2] text-[#5A433B] leading-relaxed max-w-sm mx-auto lg:mx-0 font-medium px-4 py-4 rounded-[20px]">
              At HS AgroFoods, we promise to deliver pure Indian spices and dehydrated vegetable &amp; fruit powders that are 100% natural &amp; free from harmful additives.
            </p>

          
          </div>

          {/* ─── Column 2: Center Circular Heritage Seal with Rotating Animation & Spice Wreath ─── */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center my-4 lg:my-0 relative z-10 group">
            {/* Outer Seal Container (Enlarged, Native 1278/1230 Aspect Ratio & Fully Responsive) */}
            <div className="relative w-80 xs:w-[350px] sm:w-[400px] md:w-[430px] lg:w-[400px] xl:w-[450px] 2xl:w-[480px] aspect-[1278/1230] flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.02]">

              {/* 1. Behind Hole: Animated Rotating Heritage Seal & Logo (100% concentric with circle.png hole) */}
              <div
                className="absolute rounded-full flex items-center justify-center select-none z-0"
                style={{
                  top: '47.4%',
                  left: '50.15%',
                  width: '50.55%',
                  aspectRatio: '1 / 1',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Vintage Warm Base Background & Rim */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF4ED] to-[#F5ECE1] border border-[#D97706]/40 shadow-inner" />

                {/* Secondary Delicate Dashed Ring */}
                <div className="absolute inset-[3px] sm:inset-[5px] rounded-full border border-dashed border-[#E07B0C]/35" />

                {/* Rotating Circular Typography */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full animate-spin-slow group-hover:[animation-duration:12s] transition-all"
                >
                  <defs>
                    <path
                      id="promise-heritage-text-path"
                      d="M 100, 100 m -73, 0 a 73,73 0 1,1 146,0 a 73,73 0 1,1 -146,0"
                    />
                  </defs>

                  <text
                    className="text-[9.5px] font-extrabold uppercase fill-[#14361F]"
                    style={{ letterSpacing: '0.22em' }}
                  >
                    <textPath href="#promise-heritage-text-path" startOffset="0%">
                      ★ HS AGROFOODS ★ 100% PURE &amp; NATURAL ★ TRADITIONAL TASTE ★
                    </textPath>
                  </text>
                </svg>

                {/* Centerpiece: Brand Logo with Gold Ring */}
                <div className="relative w-[54%] h-[54%] rounded-full overflow-hidden shadow-md ring-2 ring-[#E07B0C] ring-offset-2 ring-offset-[#FFFDF9] bg-white transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6">
                  <Image
                    src={SPICE_ASSETS.logo}
                    alt="HS AgroFoods Logo"
                    fill
                    sizes="(max-width: 768px) 130px, 180px"
                    className="object-cover"
                    priority={false}
                  />
                  {/* Subtle Glass Gloss Shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60 pointer-events-none" />
                </div>
              </div>

              {/* 2. Over Seal: Authentic Spice Wreath from images_010/circle.png */}
              <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
                <Image
                  src="/images/images_010/circle.png"
                  alt="HS AgroFoods Spice Wreath"
                  fill
                  className="object-contain drop-shadow-md"
                  sizes="(max-width: 640px) 350px, (max-width: 1024px) 430px, 480px"
                  priority={false}
                />
              </div>

            </div>

            {/* 3. HERITAGE SEAL Pill Badge Under Circle */}
            <div className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full bg-[#C8762D] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md -mt-4 sm:mt-2 relative z-20">
              <Leaf className="w-3.5 h-3.5 text-white fill-white/30" />
              <span>HERITAGE SEAL</span>
            </div>
          </div>

          {/* ─── Column 3: Right 2x2 Grid of 4 Trust Feature Cards ─── */}
          <div className="lg:col-span-3 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-3.5">
              {promiseCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[5px] border border-[#EDE2D4] p-2 sm:p-3.5 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3"
                >
                  {/* Circular Icon */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <card.Icon className="w-5 h-5" />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#14361F] leading-tight">
                      {card.title}
                    </h3>

                    {/* Small Warm Orange Dash */}
                    <div className="w-4 h-0.5 bg-[#E07B0C] my-1.5 rounded-full" />

                    <p className="text-[11px] sm:text-xs text-[#6B5E55] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
