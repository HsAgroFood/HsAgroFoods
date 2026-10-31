import Link from 'next/link'
import Image from 'next/image'
import { Leaf, Zap, Heart, Activity } from 'lucide-react'
import { SPICE_ASSETS } from '@/constants/assets'

// Realistic Botanical Leaf SVG for Ambient Decor
function RealisticLeaf({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hbLeafGradDark" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4A8F44" />
          <stop offset="50%" stopColor="#2D6A28" />
          <stop offset="100%" stopColor="#1B4D1A" />
        </linearGradient>
        <linearGradient id="hbLeafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DB85A" />
          <stop offset="100%" stopColor="#387A32" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 C30 30 15 65 18 105 C20 125 35 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#hbLeafGradDark)"
      />
      <path
        d="M50 10 C70 30 85 65 82 105 C80 125 65 145 50 155 C50 110 50 50 50 10 Z"
        fill="url(#hbLeafGradLight)"
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

export function HealthBenefitsSection() {
  const benefits = [
    {
      line1: 'Boosts',
      line2: 'Immunity',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#144D29]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      line1: 'Aids',
      line2: 'Digestion',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#A6632B]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2c0 2 2 3.5 3 5 1.5 2.2 1.5 5.5 0 8-1.5 2.5-4 3-7 3-3.5 0-6-1.5-6-5 0-3 2-4.5 3.5-6 1-1 1.5-2 1.5-4V4z" />
          <path d="M9 11c1 1 3 1 4 0" />
        </svg>
      ),
    },
    {
      line1: 'Rich in',
      line2: 'Antioxidants',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#144D29]"
          fill="currentColor"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
        </svg>
      ),
    },
    {
      line1: 'Anti-inflammatory',
      line2: 'Properties',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#A6632B]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
  ]

  const recipeCards = [
    {
      id: 'energy',
      title: 'Energy Booster',
      desc: 'Natural nutrition for an active lifestyle.',
      image: SPICE_ASSETS.recipes.energyBooster,
      Icon: Zap,
      badgeBg: 'bg-[#A6632B]',
      href: '/product/turmeric-powder',
    },
    {
      id: 'digestion',
      title: 'Better Digestion',
      desc: 'Supports a healthy digestive system.',
      image: SPICE_ASSETS.recipes.betterDigestion,
      Icon: Activity,
      badgeBg: 'bg-[#2A6543]',
      href: '/product/zeera-powder',
    },
    {
      id: 'heart',
      title: 'Healthy Heart',
      desc: 'Goodness of natural spices for a stronger heart.',
      image: SPICE_ASSETS.recipes.healthyHeart,
      Icon: Heart,
      badgeBg: 'bg-[#944A24]',
      href: '/product/coriander-powder',
    },
    {
      id: 'healing',
      title: 'Natural Healing',
      desc: 'Powered by nature for a healthier you.',
      image: SPICE_ASSETS.recipes.naturalHealing,
      Icon: Leaf,
      badgeBg: 'bg-[#1D5636]',
      href: '/product/turmeric-powder',
    },
  ]

  return (
    <section
      id="uses"
      className="relative overflow-hidden py-10 sm:py-14 lg:py-16 bg-[#FAF4EA] text-[#14361F]"
    >
      {/* ─── Organic Background Curved Sweeps (Matching Reference Image) ─── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Soft Golden & Herbal Ambient Radial Glows */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(240, 152, 25, 0.09) 0%, transparent 45%),
              radial-gradient(circle at 50% 60%, rgba(20, 77, 41, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(20, 77, 41, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        {/* Dynamic Curved Forest Green Wave Behind Right Cards (Desktop & Large Screens) */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[58%] overflow-hidden">
          <svg
            viewBox="0 0 600 500"
            className="w-full h-full object-cover object-right"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Saffron Ribbon Accent Border */}
            <path
              d="M140 0 C240 160 80 340 180 500 L600 500 L600 0 Z"
              fill="#D97706"
              opacity="0.9"
            />
            {/* Deep Rich Forest Green Sweep */}
            <path
              d="M175 0 C275 160 115 340 215 500 L600 500 L600 0 Z"
              fill="#144D29"
            />
          </svg>
        </div>

        {/* Mobile / Tablet Curved Background Overlay */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#144D29]/90 via-[#144D29]/40 to-transparent pointer-events-none" />
      </div>

      {/* Decorative Bay Leaves & Spices Top-Right Accent */}
      <div className="absolute top-0 right-0 w-36 h-36 sm:w-56 sm:h-56 pointer-events-none select-none mix-blend-multiply opacity-80 z-0">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Fresh Leaves Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 144px, 224px"
        />
      </div>


      {/* Floating Realistic Botanical Leaves on Left & Center */}
      <div className="absolute left-4 top-4 sm:left-10 sm:top-6 w-7 h-12 rotate-45 opacity-80 pointer-events-none z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>
      <div className="hidden lg:block absolute left-[26%] top-8 w-6 h-10 -rotate-25 opacity-75 pointer-events-none z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>
      <div className="hidden lg:block absolute left-[44%] top-5 w-7 h-12 rotate-40 opacity-75 pointer-events-none z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>
      <div className="hidden lg:block absolute left-[41%] bottom-6 w-8 h-14 -rotate-30 opacity-75 pointer-events-none z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>
      <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 w-9 h-16 rotate-12 opacity-80 pointer-events-none z-0">
        <RealisticLeaf className="w-full h-full" />
      </div>

      <div className="mx-auto max-w-[1330px] px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* ─── Left Column: Title, Subtitle & 4 Health Benefit Circular Badges ─── */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left relative lg:pl-2">

            {/* 100% PURE & NATURAL Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3EC] border border-[#CFE4D4] text-[#144D29] text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-[#144D29] fill-[#144D29]/20" />
              <span>100% PURE &amp; NATURAL</span>
            </div>

            {/* Main Headline (Exact Line Breaks and Styling from Screenshot) */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl  font-extrabold tracking-tight text-[#14361F] leading-[1.12]">
              <span>Nature&apos;s Goodness</span><br />
              <span>In Every </span><span className="text-[#E07B0C]">Pinch &amp;</span><br />
              <span className="text-[#E07B0C]">Spoon</span>{' '}
              <svg
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 sm:w-8 sm:h-8 text-[#144D29] fill-[#144D29] transform -rotate-12 -mt-1 ml-1 drop-shadow-xs"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
              </svg>
            </h2>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-[#5A453D] leading-relaxed max-w-md mx-auto lg:mx-0 font-medium">
              From high-curcumin Salem turmeric and aromatic spice blends to nutrient-dense Beetroot, Tomato &amp; Banana powders — crafted for healthy everyday living.
            </p>

            {/* 4 Health Benefit Circular Badges (Responsive 2x2 on Mobile, 4 in a row on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 pt-2 mx-auto lg:mx-0 max-w-[280px] xs:max-w-xs sm:max-w-md">
              {benefits.map((b) => (
                <div key={b.line1 + b.line2} className="flex flex-col items-center text-center space-y-2 sm:space-y-2.5 group cursor-default">
                  {/* Beige Soft Circle */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EAE1D3] border border-[#DDD1BF] flex items-center justify-center shadow-2xs group-hover:bg-[#E07B0C] group-hover:text-white group-hover:border-[#E07B0C] transition-all duration-300">
                    <div className="scale-90 sm:scale-90 group-hover:text-white transition-colors">
                      {b.icon}
                    </div>
                  </div>

                  {/* 2-Line Label */}
                  <div className="text-[11px] sm:text-xs font-bold text-[#14361F] text-center leading-tight">
                    <div>{b.line1}</div>
                    <div>{b.line2}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ─── Right Column: 4 Vertical Recipe Culinary Cards ─── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4">
              {recipeCards.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={recipe.href}
                  className="group relative rounded-[5px] overflow-hidden border border-white/25 shadow-xl bg-[#111A13] flex flex-col justify-between transform hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  {/* Top Half: Culinary Dish Photography */}
                  <div className="relative aspect-4/5 sm:aspect-3.5/4 w-full overflow-hidden bg-[#1D2B1F]">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {/* Gradient transition to dark lower card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111A13] via-transparent to-black/10" />
                  </div>

                  {/* Bottom Half: Solid Dark Card with Icon, Serif Title & Short Subtitle */}
                  <div className="p-3 sm:p-3.5 bg-[#111A13] flex flex-col justify-between flex-1 relative z-10 -mt-2">
                    {/* Floating Circular Icon Badge */}
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${recipe.badgeBg} text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                      <recipe.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>

                    {/* Card Title */}
                    <h3 className="font-serif text-xs sm:text-sm lg:text-base font-bold text-white leading-tight group-hover:text-[#F09819] transition-colors">
                      {recipe.title}
                    </h3>

                    {/* Card Subtitle */}
                    <p className="text-[10px] sm:text-[11px] text-gray-300 mt-1 leading-snug line-clamp-2">
                      {recipe.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
