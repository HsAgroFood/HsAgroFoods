export function PillarsBar() {
  const pillars = [
    {
      title: 'Sourced with Care',
      desc: 'Handpicked from the best farms across India.',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a9 9 0 0 1 9 9c0 4.5-4 8.5-9 11C7 19.5 3 15.5 3 11a9 9 0 0 1 9-9z" />
          <path d="M12 7v8" />
          <path d="M9.5 10.5L12 8l2.5 2.5" />
        </svg>
      ),
    },
    {
      title: 'Rich in Aroma & Flavor',
      desc: 'Finely ground to lock in natural oils and taste.',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3z" />
          <path d="M8 8c0-2 1-3 2-4" />
          <path d="M12 8c0-2 1-3 2-4" />
          <path d="M16 8c0-2 1-3 2-4" />
        </svg>
      ),
    },
    {
      title: 'Hygienically Packed',
      desc: 'Advanced packaging to ensure purity & freshness.',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Lab Tested',
      desc: 'Every batch is tested for purity & safety.',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.5a2.5 2.5 0 0 1-.5 1.5L4.5 18a2 2 0 0 0 1.5 3h12a2 2 0 0 0 1.5-3L14.5 11a2.5 2.5 0 0 1-.5-1.5V2" />
          <path d="M8 2h8" />
          <path d="M6 17h12" />
        </svg>
      ),
    },
  ]

  return (
    <section className="mt-4 sm:mt-8 lg:mt-12 relative z-30 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mb-8 sm:mb-12">
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFD5] shadow-xl shadow-stone-900/5 p-4 sm:p-6 lg:p-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-6 lg:gap-8 lg:divide-x divide-[#E8DFD5]">
          {pillars.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center text-center space-y-1.5 sm:space-y-3 ${
                index !== 0 ? 'lg:pl-6' : ''
              } px-1 sm:px-2`}
            >
              {/* Circular Emblem Icon */}
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#FAF3EB] border border-[#E8DFD5] flex items-center justify-center text-[#431D0D] shadow-xs shrink-0">
                {item.icon}
              </div>

              {/* Title & Description */}
              <h3 className="font-serif text-xs sm:text-base lg:text-lg font-bold text-[#14361F] tracking-tight leading-snug">
                {item.title}
              </h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-[#6E5951] leading-relaxed max-w-[200px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
