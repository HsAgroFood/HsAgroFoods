import Image from 'next/image'

export function PillarsBar() {
  const pillars = [
    {
      id: 'sourced',
      titleFirst: 'Sourced with ',
      titleHighlight: 'Care',
      desc: 'Handpicked from the best farms across India.',
      dashColor: 'bg-[#4E8D42]',
      blobBg: 'bg-[#EAF4ED]',
      icon: (
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
          {/* Organic Blob Shape */}
          <div className="absolute inset-0 rounded-[46%_54%_58%_42%/48%_45%_55%_52%] bg-[#EAF4ED] transition-transform duration-300 group-hover:scale-105" />
          
          {/* Floating Leaf Accent */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -top-1 -right-0.5 w-4 h-4 text-[#529342] transform rotate-12 drop-shadow-xs transition-transform duration-300 group-hover:rotate-45"
            fill="currentColor"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
          </svg>

          {/* Sprout & Tilled Soil SVG */}
          <svg
            viewBox="0 0 44 44"
            className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 text-[#144D29]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Seedling Stem */}
            <path d="M22 30V15" strokeWidth="2.4" />
            {/* Left Leaf */}
            <path d="M22 20C18 16 12 16 12 21C16 23 20 21 22 20Z" fill="#144D29" />
            {/* Right Leaf */}
            <path d="M22 17C26 13 32 13 32 18C28 20 24 18 22 17Z" fill="#144D29" />
            {/* Soil Arcs */}
            <path d="M12 30C15 28 18 28 22 30C26 32 29 32 32 30" strokeWidth="2.2" />
            <path d="M14 34C17 32 19 32 22 34C25 36 27 36 30 34" strokeWidth="2.2" />
            <path d="M17 38C19 37 21 37 22 38C23 39 25 39 27 38" strokeWidth="2.2" />
          </svg>
        </div>
      ),
    },
    {
      id: 'aroma',
      titleFirst: 'Rich in Aroma & ',
      titleHighlight: 'Flavor',
      desc: 'Finely ground to lock in natural oils and taste.',
      dashColor: 'bg-[#E07B0C]',
      blobBg: 'bg-[#FDF2E4]',
      icon: (
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
          {/* Organic Blob Shape */}
          <div className="absolute inset-0 rounded-[52%_48%_45%_55%/50%_54%_46%_50%] bg-[#FDF2E4] transition-transform duration-300 group-hover:scale-105" />
          
          {/* Floating Leaf Accent */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -top-1 -right-0.5 w-4 h-4 text-[#529342] transform rotate-12 drop-shadow-xs transition-transform duration-300 group-hover:rotate-45"
            fill="currentColor"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
          </svg>

          {/* Mortar & Pestle SVG */}
          <svg
            viewBox="0 0 44 44"
            className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 text-[#144D29]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Pestle Handle */}
            <path d="M30 11L22 22" strokeWidth="2.8" />
            {/* Mortar Bowl */}
            <path d="M11 20H33C33 29 27 33 22 33C17 33 11 29 11 20Z" strokeWidth="2.4" />
            {/* Mortar Base */}
            <path d="M16 33H28" strokeWidth="2.6" />
            {/* Fresh Herb Sprig */}
            <path d="M16 18C15 14 12 13 12 17C14 18 15 18 16 18Z" fill="#144D29" />
          </svg>
        </div>
      ),
    },
    {
      id: 'hygienic',
      titleFirst: 'Hygienically ',
      titleHighlight: 'Packed',
      desc: 'Advanced packaging to ensure purity & freshness.',
      dashColor: 'bg-[#4E8D42]',
      blobBg: 'bg-[#EAF4ED]',
      icon: (
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
          {/* Organic Blob Shape */}
          <div className="absolute inset-0 rounded-[48%_52%_55%_45%/46%_50%_50%_54%] bg-[#EAF4ED] transition-transform duration-300 group-hover:scale-105" />
          
          {/* Floating Leaf Accent */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -top-1 -right-0.5 w-4 h-4 text-[#529342] transform rotate-12 drop-shadow-xs transition-transform duration-300 group-hover:rotate-45"
            fill="currentColor"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
          </svg>

          {/* Shield with Leaf SVG */}
          <svg
            viewBox="0 0 44 44"
            className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 text-[#144D29]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Shield Frame */}
            <path d="M22 10L32 14V22C32 29 27 34 22 36C17 34 12 29 12 22V14L22 10Z" strokeWidth="2.4" />
            {/* Leaf Inside Shield */}
            <path d="M22 16C18 20 18 25 22 28C26 25 26 20 22 16Z" fill="#144D29" />
            <path d="M22 18V26" stroke="#EAF4ED" strokeWidth="1.5" />
          </svg>
        </div>
      ),
    },
    {
      id: 'tested',
      titleFirst: 'Lab ',
      titleHighlight: 'Tested',
      desc: 'Every batch is tested for purity & safety.',
      dashColor: 'bg-[#E07B0C]',
      blobBg: 'bg-[#FDF2E4]',
      icon: (
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
          {/* Organic Blob Shape */}
          <div className="absolute inset-0 rounded-[50%_50%_45%_55%/52%_47%_53%_48%] bg-[#FDF2E4] transition-transform duration-300 group-hover:scale-105" />
          
          {/* Floating Leaf Accent */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -top-1 -right-0.5 w-4 h-4 text-[#529342] transform rotate-12 drop-shadow-xs transition-transform duration-300 group-hover:rotate-45"
            fill="currentColor"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6 1.5-1.5 3-4 3.5-7 1 1 2.5 1.5 4 1.5 5.5 0 10-4.5 10-10-2.5 0-6.5 1.5-10-.5z" />
          </svg>

          {/* Chemical Flask with Checkmark Seal SVG */}
          <svg
            viewBox="0 0 44 44"
            className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 text-[#144D29]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Flask Lip & Neck */}
            <path d="M18 10H26" strokeWidth="2.4" />
            <path d="M20 10V16L12 29C10.8 31 12.2 34 14.8 34H28" strokeWidth="2.4" />
            <path d="M24 10V16L27 21" strokeWidth="2.4" />
            {/* Fluid Indicator */}
            <path d="M15 29H27" strokeWidth="1.8" strokeDasharray="2 2" />
            {/* Verification Checkmark Badge */}
            <circle cx="29.5" cy="29.5" r="5.5" fill="#144D29" stroke="none" />
            <path d="M27.5 29.5L29 31L32 28" stroke="#FDF2E4" strokeWidth="1.6" />
          </svg>
        </div>
      ),
    },
  ]

  return (
    <section className="relative z-30 mx-auto max-w-full py-8 sm:py-12 lg:py-16">
    

     <div className="max-w-[1450px] mx-auto">
       {/* Main Floating White Card */}
      <div className="relative z-10 rounded-[5px] bg-white border border-[#EFE7DC] shadow-[0_10px_35px_rgba(45,20,9,0.06)] p-5 sm:p-7 lg:py-8 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 lg:gap-0 lg:divide-x divide-[#EFE7DC]">
          {pillars.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center text-center space-y-2.5 px-1.5 sm:px-3 lg:px-4 cursor-default"
            >
              {/* Organic Icon Badge */}
              <div className="mb-6">
                {item.icon}
              </div>

              {/* Two-Tone Serif Headline */}
              <h3 className="font-serif text-sm sm:text-base lg:text-[18px] font-bold text-[#144D29] tracking-tight leading-snug">
                <span>{item.titleFirst}</span>
                <span className="text-[#E07B0C]">{item.titleHighlight}</span>
              </h3>

              {/* Accent Dash Line */}
              <span className={`block w-7 h-[2px] ${item.dashColor} rounded-full mx-auto my-1.5`} />

              {/* Clean Description */}
              <p className="text-sm sm:text-base lg:text-[16px] text-[#6E5951] leading-relaxed max-w-[210px] mx-auto font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
     </div>
    </section>
  )
}
