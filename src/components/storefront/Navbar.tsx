'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Search,
  ArrowRight,
  Loader2,
  Heart,
  Home,
  LayoutGrid,
  Sparkles,
  Store,
  Package,
  Leaf,
  Phone,
  LogOut,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { useCart } from '@/contexts/CartContext'
import { FALLBACK_PRODUCTS } from '@/constants/fallbackProducts'
import { getWishlistCount } from '@/lib/wishlist'

// Quick Trending Spices for Instant Mobile Search
const POPULAR_MOBILE_TAGS = [
  'Red Chilli',
  'Turmeric Powder',
  'Garam Masala',
  'Coriander',
  'Cumin',
  'Dehydrated Powders',
]

// Fast Local Catalog Index for 0ms Instant Client-Side Search
const LOCAL_SEARCH_INDEX = Object.values(FALLBACK_PRODUCTS).map((p) => {
  const activeVariants = p.product_variants?.filter((v) => v.is_active) || []
  const prices = activeVariants.map((v) => v.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.featured_image_url || '/images/products/red-chilli-powder.png',
    price: minPrice,
    searchString: `${p.name} ${p.short_description} ${p.slug}`.toLowerCase(),
  }
})

// Bilingual Spice Keywords mapping for instant 0ms matching
const BILINGUAL_SYNONYMS: Record<string, string[]> = {
  haldi: ['turmeric', 'haldi', 'curcumin'],
  turmeric: ['haldi', 'turmeric', 'curcumin'],
  mirch: ['chilli', 'mirch', 'chili', 'lal mirch'],
  mirchi: ['chilli', 'mirch', 'chili'],
  chilli: ['mirch', 'chilli', 'chili'],
  chili: ['mirch', 'chilli', 'chili'],
  dhaniya: ['coriander', 'dhaniya', 'dhania'],
  coriander: ['dhaniya', 'coriander'],
  jeera: ['cumin', 'jeera', 'zeera'],
  zeera: ['cumin', 'jeera', 'zeera'],
  cumin: ['jeera', 'zeera', 'cumin'],
  garam: ['shahi garam masala', 'garam masala'],
  masala: ['garam masala', 'chaat masala', 'fruit chaat masala'],
  chaat: ['chaat masala', 'fruit chaat masala'],
  chat: ['chaat masala', 'fruit chaat masala'],
  amchur: ['mango', 'amchur', 'dry mango'],
  mango: ['amchur', 'mango'],
  beetroot: ['beetroot', 'chukandar'],
  chukandar: ['beetroot', 'chukandar'],
  tomato: ['tomato', 'tamatar'],
  tamatar: ['tomato', 'tamatar'],
  banana: ['banana', 'kela', 'raw banana'],
  kela: ['banana', 'kela', 'raw banana'],
  garlic: ['garlic', 'lehsun', 'lasun'],
  lehsun: ['garlic', 'lehsun', 'lasun'],
  carrot: ['carrot', 'gajar'],
  radish: ['radish', 'mooli'],
}

function searchCatalogInstantly(rawQuery: string) {
  if (!rawQuery || !rawQuery.trim()) return []
  const q = rawQuery.trim().toLowerCase()
  
  const terms = new Set<string>([q])
  for (const [key, synonyms] of Object.entries(BILINGUAL_SYNONYMS)) {
    if (q.includes(key) || key.includes(q)) {
      synonyms.forEach((s) => terms.add(s.toLowerCase()))
    }
  }

  return LOCAL_SEARCH_INDEX.filter((item) => {
    for (const term of terms) {
      if (item.searchString.includes(term)) return true
    }
    return false
  }).slice(0, 6)
}

type NavLink = {
  name: string
  href: string
  hasDropdown?: boolean
  subItems?: { name: string; href: string }[]
}

export const SHOP_CATEGORY_METADATA: Record<
  string,
  {
    name: string
    subtext: string
    badge: string
    image: string
    icon: string
  }
> = {
  'ground-spices': {
    name: 'Ground Spices',
    subtext: 'Pure Salem Haldi, Guntur Mirch, Dhaniya & Jeera',
    badge: '100% Pure',
    image: '/images/products/turmeric-powder.png',
    icon: '🌶️',
  },
  'pure-ground-spices': {
    name: 'Ground Spices',
    subtext: 'Pure Salem Haldi, Guntur Mirch, Dhaniya & Jeera',
    badge: '100% Pure',
    image: '/images/products/turmeric-powder.png',
    icon: '🌶️',
  },
  'blended-spices': {
    name: 'Blended Masale',
    subtext: 'Authentic Shahi Garam Masala, Kitchen King & Chaat Blends',
    badge: 'Royal Recipes',
    image: '/images/products/shahi-garam-masala.jpeg',
    icon: '🥣',
  },
  'blended-masalas': {
    name: 'Blended Masale',
    subtext: 'Authentic Shahi Garam Masala, Kitchen King & Chaat Blends',
    badge: 'Royal Recipes',
    image: '/images/products/shahi-garam-masala.jpeg',
    icon: '🥣',
  },
  'dehydrated-powders': {
    name: 'Dehydrated Veg & Fruit Powders',
    subtext: 'Beetroot, Tomato, Raw Banana, Garlic & Carrot Powders',
    badge: 'Zero Additives',
    image: '/images/products/banana-powder.png',
    icon: '🌿',
  },
}

export const FEATURED_DROPDOWN_RANGES = [
  {
    name: 'Ground Spices',
    slug: 'ground-spices',
    subtext: 'Pure Salem Haldi, Guntur Mirch, Dhaniya & Jeera',
    href: '/shop?category=ground-spices',
    badge: '100% Pure',
    image: '/images/products/turmeric-powder.png',
    icon: '🌶️',
  },
  {
    name: 'Blended Masale',
    slug: 'blended-spices',
    subtext: 'Authentic Shahi Garam Masala, Kitchen King & Chaat Blends',
    href: '/shop?category=blended-spices',
    badge: 'Royal Recipes',
    image: '/images/products/shahi-garam-masala.jpeg',
    icon: '🥣',
  },
  {
    name: 'Dehydrated Veg & Fruit Powders',
    slug: 'dehydrated-powders',
    subtext: 'Beetroot, Tomato, Raw Banana, Garlic & Carrot Powders',
    badge: 'Zero Additives',
    image: '/images/products/banana-powder.png',
    icon: '🌿',
  },
]

const defaultCategoryItems = [
  { name: 'All Products', href: '/shop' },
  { name: 'Ground Spices', href: '/shop?category=ground-spices' },
  { name: 'Blended Masale', href: '/shop?category=blended-spices' },
  { name: 'Dehydrated Veg & Fruit Powders', href: '/shop?category=dehydrated-powders' },
]

export function Navbar({
  isLoggedIn = false,
  user = null,
  categories = [],
}: {
  isLoggedIn?: boolean
  user?: { name: string; email: string; role?: string } | null
  categories?: { name: string; slug: string; description?: string | null; image_url?: string | null }[]
}) {
  const resolvedShopCategories = (
    categories.length > 0
      ? categories
      : [
          { name: 'Ground Spices', slug: 'ground-spices' },
          { name: 'Blended Masale', slug: 'blended-spices' },
          { name: 'Dehydrated Veg & Fruit Powders', slug: 'dehydrated-powders' },
        ]
  ).map((c) => {
    const meta = SHOP_CATEGORY_METADATA[c.slug] || {
      name: c.name,
      subtext: c.description || '100% pure cold-ground spices',
      badge: 'Cold-Ground',
      image: c.image_url || '/images/products/turmeric-powder.png',
      icon: '🌿',
    }
    return {
      name: c.name,
      slug: c.slug,
      href: `/shop?category=${c.slug}`,
      subtext: c.description || meta.subtext,
      badge: meta.badge,
      image: c.image_url || meta.image,
      icon: meta.icon,
    }
  })

  const dynamicSubItems = [
    { name: 'All Products', href: '/shop' },
    ...resolvedShopCategories.map((c) => ({ name: c.name, href: c.href })),
  ]

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/' },
    {
      name: 'Categories',
      href: '/shop',
      hasDropdown: true,
      subItems: dynamicSubItems,
    },
    { name: 'Shop All', href: '/shop' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const { itemCount } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  // State Management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        return
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Live Search State
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Client hydration check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Live Wishlist Count Sync (Local Storage & Custom Event with Canonical Deduplication)
  useEffect(() => {
    const updateWishlistCount = () => {
      setWishlistCount(getWishlistCount())
    }

    updateWishlistCount()
    window.addEventListener('storage', updateWishlistCount)
    window.addEventListener('hs_wishlist_updated', updateWishlistCount)
    return () => {
      window.removeEventListener('storage', updateWishlistCount)
      window.removeEventListener('hs_wishlist_updated', updateWishlistCount)
    }
  }, [])

  // Instant Search Handler (0ms instant response)
  const handleSearchChange = (val: string) => {
    setDesktopSearchQuery(val)
    const trimmed = val.trim()
    if (trimmed.length >= 1) {
      setShowSuggestions(true)
      // 0ms instant local results
      const instantResults = searchCatalogInstantly(trimmed)
      setSearchResults(instantResults)
    } else {
      setSearchResults([])
      setShowSuggestions(false)
    }
  }

  // Live Search Background Sync (updates if backend has more products)
  useEffect(() => {
    const trimmed = desktopSearchQuery.trim()
    if (!trimmed) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        const json = await res.json()
        if (json.results && json.results.length > 0) {
          setSearchResults(json.results)
        }
      } catch {
        // Keep existing instant results
      } finally {
        setIsSearching(false)
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [desktopSearchQuery])

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer and search on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSearchOpen(false)
    setCategoriesDropdownOpen(false)
    setShowSuggestions(false)
  }, [pathname])

  // Scroll to top when clicking Home / Brand Logo
  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Body scroll lock on mobile drawer & mobile search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setMobileSearchOpen(false)
      }
    }
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen, mobileSearchOpen])

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md text-[#14361F] shadow-sm border-b border-[#EDE4D9] transition-all">
        <nav className="mx-auto max-w-[1360px] px-3 sm:px-6 lg:px-8">
          <div className="flex h-[70px] sm:h-20 items-center justify-between gap-2 sm:gap-4">

            {/* ── Brand Logo (Restored to Original Sizing) ── */}
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                onClick={handleHomeClick}
                className="group flex items-center gap-2 sm:gap-2.5"
                aria-label="HS AgroFoods"
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] group-hover:scale-105 transition-transform shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="HS AgroFoods Logo"
                    fill
                    priority
                    unoptimized
                    className="object-contain drop-shadow-2xs"
                    sizes="(max-width: 1024px) 60px, 68px"
                  />
                </div>
                <div className="flex flex-col leading-none whitespace-nowrap shrink-0">
                  <span className="font-serif text-[17px] sm:text-lg lg:text-xl font-extrabold tracking-tight text-[#14361F]">
                    HS <span className="text-[#E07B0C]">AgroFoods</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A6458] mt-0.5">
                    100% Pure &amp; Natural
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Desktop Navigation Links (Original Menu Restored) ── */}
            <div className="hidden lg:flex lg:items-center lg:gap-6 xl:gap-8 shrink-0">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative py-2"
                      ref={dropdownRef}
                      onMouseEnter={() => setCategoriesDropdownOpen(true)}
                      onMouseLeave={() => setCategoriesDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                        className={`inline-flex items-center gap-1.5 text-sm xl:text-[15px] font-semibold transition-colors py-1 cursor-pointer whitespace-nowrap ${
                          categoriesDropdownOpen ? 'text-[#E07B0C]' : 'text-[#14361F] hover:text-[#E07B0C]'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            categoriesDropdownOpen ? 'rotate-180 text-[#E07B0C]' : 'text-[#7A6458]'
                          }`}
                        />
                      </button>

                      {/* Modern Categories Dropdown with Exact Showcase Card */}
                      {categoriesDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[560px] xl:w-[600px] rounded-[5px] bg-[#FFFDF9] text-[#14361F] shadow-2xl border border-[#EDE4D9] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                          <div className="grid grid-cols-12 gap-4">
                            {/* Left: Categories List (7 cols) */}
                            <div className="col-span-7 space-y-1">
                              <div className="px-3 py-1.5 border-b border-[#EDE4D9] bg-[#FAF7F2] rounded-[3px] mb-2 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A6458]">
                                  Spice Categories
                                </span>
                                <Link
                                  href="/shop"
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="text-[10px] font-bold text-[#E07B0C] hover:underline"
                                >
                                  View All Categories →
                                </Link>
                              </div>

                              {/* 1. All Products Option Card (Matching Mobile View) */}
                              <Link
                                href="/shop"
                                onClick={() => setCategoriesDropdownOpen(false)}
                                className="flex items-center justify-between p-2 rounded-[5px] text-xs font-semibold text-[#14361F] hover:bg-[#FAF7F2] hover:text-[#E07B0C] transition-all group/item"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-[4px] bg-[#FAF5EE] border border-[#EDE4D9] flex items-center justify-center shrink-0 shadow-2xs text-base">
                                    ✨
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#14361F] group-hover/item:text-[#E07B0C] truncate block">
                                        All Products
                                      </span>
                                      <span className="text-[8.5px] uppercase font-bold text-[#E07B0C] bg-[#FFF3E6] border border-[#E07B0C]/20 px-1.5 py-0.5 rounded-[3px] shrink-0">
                                        Full Catalog
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#7A6458] truncate block leading-tight mt-0.5">
                                      Explore complete collection of pure spices &amp; powders
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/item:text-[#E07B0C] group-hover/item:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                              </Link>

                              {/* 2. Admin & Store Categories */}
                              {resolvedShopCategories.map((cat) => (
                                <Link
                                  key={cat.name}
                                  href={cat.href}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-[5px] text-xs font-semibold text-[#14361F] hover:bg-[#FAF7F2] hover:text-[#E07B0C] transition-all group/item"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative w-9 h-9 rounded-[4px] bg-[#FAF5EE] border border-[#EDE4D9] shrink-0 overflow-hidden shadow-2xs">
                                      <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        sizes="36px"
                                        className="object-cover group-hover/item:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-[#14361F] group-hover/item:text-[#E07B0C] truncate block">
                                          {cat.name}
                                        </span>
                                        <span className="text-[8.5px] uppercase font-bold text-[#E07B0C] bg-[#FFF3E6] border border-[#E07B0C]/20 px-1.5 py-0.5 rounded-[3px] shrink-0">
                                          {cat.badge}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-[#7A6458] truncate block leading-tight mt-0.5">
                                        {cat.subtext}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/item:text-[#E07B0C] group-hover/item:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                                </Link>
                              ))}
                            </div>

                            {/* Right: Category Showcase Card (5 cols) */}
                            <div className="col-span-5 bg-[#FAF7F2] rounded-[5px] p-3 border border-[#EDE4D9] flex flex-col justify-between shadow-2xs">
                              <div>
                                <div className="relative w-full h-28 rounded-[5px] overflow-hidden mb-2.5 bg-[#EBF3ED]">
                                  <Image
                                    src="/images/about/about-hero.jpg"
                                    alt="Traditional Cryo-Grinding"
                                    fill
                                    sizes="220px"
                                    className="object-cover"
                                  />
                                  <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#E07B0C] text-white px-2 py-0.5 rounded-[3px] shadow-2xs">
                                    Single Origin
                                  </span>
                                </div>
                                <h4 className="font-serif text-xs sm:text-sm font-bold text-[#14361F] leading-tight">
                                  Traditional Cryo-Grinding
                                </h4>
                                <p className="text-[10.5px] text-[#7A6458] leading-tight mt-1">
                                  Ground below 40°C to lock in 100% of volatile medicinal aroma and pure essential oils.
                                </p>
                              </div>

                              <Link
                                href="/shop"
                                onClick={() => setCategoriesDropdownOpen(false)}
                                className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-[5px] bg-[#14361F] hover:bg-[#0E2816] text-white text-[11px] font-bold transition-all shadow-2xs"
                              >
                                <span>Browse All Categories</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>

                          {/* Bottom Shipping Strip */}
                          <div className="mt-3 pt-2.5 border-t border-[#EDE4D9] flex items-center justify-center text-[11px] font-semibold text-[#14361F]">
                            <span>🚚 Free Shipping Across India Above ₹499</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href === '/') {
                        handleHomeClick(e)
                      }
                    }}
                    className="text-sm xl:text-[15px] font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            {/* ── Right Side Actions: Live Search, Circular Wishlist, Cart & Profile ── */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Desktop Live Autocomplete Search Input */}
              <div className="hidden lg:block relative" ref={searchContainerRef}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (desktopSearchQuery.trim()) {
                      setShowSuggestions(false)
                      router.push(`/shop?q=${encodeURIComponent(desktopSearchQuery.trim())}`)
                    }
                  }}
                  className="flex items-center relative group"
                >
                  <input
                    name="q"
                    type="text"
                    autoComplete="off"
                    value={desktopSearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                      if (desktopSearchQuery.trim()) {
                        setShowSuggestions(true)
                      }
                    }}
                    placeholder="Search pure spices, powders..."
                    className="w-40 xl:w-56 pl-9 pr-8 py-2 rounded-[5px] bg-white hover:bg-[#FAF7F2] border border-[#EDE4D9] text-xs sm:text-sm text-[#14361F] placeholder-[#9C8A7F] focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/25 focus:border-[#E07B0C] focus:bg-white focus:w-60 transition-all shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute left-1.5 p-1 text-[#E07B0C] hover:text-[#144D29] transition-colors cursor-pointer"
                    title="Search"
                    aria-label="Search spices"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#E07B0C] animate-spin absolute right-2.5 pointer-events-none" />
                  ) : desktopSearchQuery && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2.5 text-[#9C8A7F] hover:text-[#14361F] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Live Suggestions Dropdown */}
                {showSuggestions && desktopSearchQuery.trim().length >= 1 && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-[5px] bg-white text-[#14361F] shadow-2xl border border-[#EDE4D9] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EDE4D9] flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-[#E07B0C]">
                        Products ({searchResults.length})
                      </span>
                      <span className="text-[11px] text-[#7A6458]">Press enter to view all</span>
                    </div>

                    {searchResults.length === 0 && !isSearching ? (
                      <div className="p-6 text-center text-sm text-[#7A6458]">
                        No spices found for &ldquo;<span className="font-bold text-[#14361F]">{desktopSearchQuery}</span>&rdquo;
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EDE4D9] max-h-80 overflow-y-auto">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-3 hover:bg-[#FAF7F2] transition-colors group"
                          >
                            <div className="w-10 h-10 relative rounded-[5px] overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EDE4D9]">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="40px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-[#14361F] truncate group-hover:text-[#E07B0C] transition-colors">
                                {item.name}
                              </h4>
                              {item.price && (
                                <p className="text-[11px] font-bold text-[#144D29]">
                                  From ₹{item.price}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#E07B0C] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <Link
                        href={`/shop?q=${encodeURIComponent(desktopSearchQuery.trim())}`}
                        onClick={() => setShowSuggestions(false)}
                        className="block text-center py-2.5 bg-[#FAF7F2] hover:bg-[#FDF0E6] text-xs font-bold text-[#14361F] border-t border-[#EDE4D9] transition-colors"
                      >
                        View all results for &ldquo;{desktopSearchQuery}&rdquo; →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Search Button (Circular) */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(true)
                  setShowSuggestions(true)
                }}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-[#FAF7F2] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* ── Modern Circular Wishlist Icon with Red Badge (Mobile & Desktop) ── */}
              <Link
                href="/wishlist"
                className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-[#FDF0E6] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] hover:border-[#FADCC3] shadow-2xs hover:shadow-xs transition-all active:scale-95 group shrink-0"
                aria-label="Wishlist"
                title={wishlistCount > 0 ? `${wishlistCount} items saved in wishlist` : 'Your Wishlist'}
              >
                <Heart className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white animate-in zoom-in-75">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* ── Modern Circular Cart Icon with Saffron Badge (Desktop Only) ── */}
              <Link
                href="/cart"
                className="hidden lg:flex relative w-10 h-10 rounded-full items-center justify-center bg-white hover:bg-[#FDF0E6] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] hover:border-[#FADCC3] shadow-2xs hover:shadow-xs transition-all active:scale-95 group shrink-0"
                aria-label="Shopping Cart"
                title={`${itemCount} items in cart`}
              >
                <ShoppingCart className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E07B0C] px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white animate-in zoom-in-75">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* ── Modern Circular Account Icon (Desktop Only) with Hover Dropdown ── */}
              {isLoggedIn && user ? (
                <div
                  className="relative hidden lg:block"
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <Link
                    href="/account"
                    className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#144D29] hover:bg-[#E07B0C] text-white font-bold text-xs sm:text-sm ring-2 ring-[#EDE4D9] hover:ring-[#E07B0C]/40 shadow-2xs transition-all active:scale-95 shrink-0"
                    title={`My Account (${user.name || user.email})`}
                    aria-label="My Account"
                  >
                    {(user.name?.trim() ? user.name.trim().split(' ')[0] : 'U').charAt(0).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </Link>

                  {/* Desktop Dropdown Menu on Hover */}
                  <div
                    className={`absolute right-0 top-full pt-2 w-64 z-50 transition-all duration-200 ${
                      accountDropdownOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                    }`}
                  >
                    <div className="bg-white rounded-[5px] border border-[#EDE4D9] shadow-xl overflow-hidden text-[#14361F]">
                      {/* User Header */}
                      <div className="p-3.5 bg-[#FAF7F2] border-b border-[#EDE4D9]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E07B0C] to-[#D1491B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-[#F09819]/40">
                            {(user.name?.trim() ? user.name.trim().split(' ')[0] : 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#14361F] truncate">
                              {user.name || 'Customer'}
                            </p>
                            <p className="text-[10px] text-[#7A6458] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EDE4D9] text-[9px] font-bold text-[#E07B0C] uppercase tracking-wider">
                            <span>✦</span>
                            <span>{user.role === 'admin' ? 'Store Administrator' : 'Verified Member'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1 divide-y divide-[#F2E8DC]/60 text-xs">
                        <div className="py-1">
                          <Link
                            href="/account"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[#14361F] hover:bg-[#FAF7F2] hover:text-[#E07B0C] font-semibold transition-colors"
                          >
                            <User className="w-4 h-4 text-[#8C7567]" />
                            <span>My Profile & Details</span>
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[#14361F] hover:bg-[#FAF7F2] hover:text-[#E07B0C] font-semibold transition-colors"
                          >
                            <Package className="w-4 h-4 text-[#8C7567]" />
                            <span>My Orders & Tracking</span>
                          </Link>
                          <Link
                            href="/account/addresses"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[#14361F] hover:bg-[#FAF7F2] hover:text-[#E07B0C] font-semibold transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-[#8C7567]" />
                            <span>Saved Addresses</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 font-bold transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        {/* Sign Out Button */}
                        <div className="p-1.5">
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-xs font-bold text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer disabled:opacity-60 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4 text-rose-600" />
                              <span>Sign Out</span>
                            </div>
                            {isLoggingOut && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="relative hidden lg:block"
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <Link
                    href="/login"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-[#EAF5ED] text-[#14361F] hover:text-[#144D29] border border-[#EDE4D9] hover:border-[#CFE3D3] shadow-2xs hover:shadow-xs transition-all active:scale-95 group shrink-0"
                    title="Sign In / Account"
                    aria-label="Sign In"
                  >
                    <User className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                  </Link>

                  <div
                    className={`absolute right-0 top-full pt-2 w-60 z-50 transition-all duration-200 ${
                      accountDropdownOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                    }`}
                  >
                    <div className="bg-white rounded-[5px] border border-[#EDE4D9] shadow-xl p-3.5 text-[#14361F]">
                      <p className="text-xs font-bold text-[#14361F]">Welcome to HS AgroFoods</p>
                      <p className="text-[11px] text-[#7A6458] mt-0.5 leading-snug">
                        Sign in to track spice orders, view wishlists & saved addresses.
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[5px] bg-gradient-to-r from-[#E07B0C] to-[#D1491B] text-white text-xs font-bold hover:from-[#2D1409] hover:to-[#E07B0C] shadow-xs transition-all"
                      >
                        <span>Sign In / Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button (Circular) */}
              <button
                type="button"
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-[#FAF7F2] text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] shadow-2xs active:scale-95 transition-all focus:outline-none cursor-pointer shrink-0"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

            </div>

          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          Mobile Live Search Portal Modal
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {mounted && mobileSearchOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSearchOpen(false)}
          />

          <div className="fixed top-0 inset-x-0 bg-[#FAF7F2] text-[#14361F] p-4 shadow-2xl z-[100000] border-b border-[#EDE4D9]">
            <div className="flex items-center gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (desktopSearchQuery.trim()) {
                    setMobileSearchOpen(false)
                    router.push(`/shop?q=${encodeURIComponent(desktopSearchQuery.trim())}`)
                  }
                }}
                className="flex-1 relative flex items-center"
              >
                <button
                  type="submit"
                  className="absolute left-2.5 p-1 text-[#E07B0C] hover:text-[#144D29] cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  autoFocus
                  autoComplete="off"
                  value={desktopSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search pure spices, masalas..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-[5px] bg-white border border-[#EDE4D9] text-sm text-[#14361F] placeholder-[#9C8A7F] focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/25"
                />
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-[#E07B0C] animate-spin absolute right-3 pointer-events-none" />
                ) : desktopSearchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 text-[#9C8A7F] hover:text-[#14361F] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-[#14361F] hover:text-[#E07B0C] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Quick Popular Keywords Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
              <span className="text-[10px] font-bold text-[#7A6458] shrink-0 uppercase tracking-wider">
                Popular:
              </span>
              {['Haldi', 'Red Chilli', 'Garam Masala', 'Beetroot', 'Jeera', 'Tomato'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchChange(term)}
                  className="px-2.5 py-1 rounded-[4px] bg-white hover:bg-[#FAF7F2] text-[#14361F] text-xs font-semibold border border-[#EDE4D9] shrink-0 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {desktopSearchQuery.trim().length >= 1 && (
              <div className="mt-3 bg-white rounded-[5px] text-[#14361F] overflow-hidden shadow-xl border border-[#EDE4D9] max-h-72 overflow-y-auto">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-xs text-[#7A6458]">
                    No spices found for &ldquo;<strong>{desktopSearchQuery}</strong>&rdquo;
                  </div>
                ) : (
                  <div className="divide-y divide-[#EDE4D9]">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        onClick={() => {
                          setMobileSearchOpen(false)
                          setDesktopSearchQuery('')
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#FAF7F2] transition-colors"
                      >
                        <div className="w-10 h-10 relative rounded-[5px] overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EDE4D9]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#14361F] truncate">
                            {item.name}
                          </h4>
                          {item.price && (
                            <p className="text-[11px] font-bold text-[#144D29]">
                              From ₹{item.price}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          Mobile Drawer Portal
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {mounted && mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 z-[100000] w-[85%] max-w-[320px] sm:max-w-[340px] bg-[#FAF7F2] text-[#14361F] p-4 sm:p-5 shadow-2xl border-l border-[#EDE4D9] overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-250 ease-out">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-[#EDE4D9] pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="HS AgroFoods Logo"
                      fill
                      className="object-contain"
                      sizes="36px"
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-serif text-base font-extrabold text-[#14361F]">
                      HS <span className="text-[#E07B0C]">AgroFoods</span>
                    </span>
                    <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7A6458] mt-0.5">
                      Pure &amp; Natural Spices
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#14361F] hover:text-[#E07B0C] hover:bg-white border border-[#EDE4D9] transition-colors cursor-pointer active:scale-95"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Profile / Greeting Card at Top */}
              <div className="mt-3">
                {isLoggedIn && user ? (
                  <div className="p-3.5 rounded-[5px] bg-white border border-[#EDE4D9] shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E07B0C] to-[#D1491B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-[#F09819]/40">
                        {(user.name?.trim() ? user.name.trim().split(' ')[0] : 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#14361F] truncate">{user.name || 'Customer'}</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[10px] text-[#7A6458] truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#EDE4D9] grid grid-cols-2 gap-1.5">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-1.5 px-2 rounded-[5px] bg-[#FAF7F2] hover:bg-[#FDF0E6] text-[11px] font-semibold text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] transition-colors truncate"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-1.5 px-2 rounded-[5px] bg-[#FAF7F2] hover:bg-[#FDF0E6] text-[11px] font-semibold text-[#14361F] hover:text-[#E07B0C] border border-[#EDE4D9] transition-colors truncate"
                      >
                        My Orders
                      </Link>
                    </div>
                    {/* Modern Sign Out Button inside Profile Greeting Card */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                      disabled={isLoggingOut}
                      type="button"
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[5px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-[5px] bg-gradient-to-r from-[#FAF5EE] via-[#FFF8F0] to-[#FAF5EE] border border-[#EDE4D9] flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#14361F]">Welcome to HS AgroFoods</p>
                      <p className="text-[10px] text-[#7A6458] truncate">Sign in to track orders & wishlist</p>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-[5px] bg-[#14361F] hover:bg-[#E07B0C] text-white text-[11px] font-bold transition-colors shrink-0 shadow-xs active:scale-95"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links with Icons */}
              <nav className="mt-3.5 flex flex-col space-y-1">
                {/* 1. Home */}
                <Link
                  href="/"
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleHomeClick(e)
                  }}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0 text-[#E07B0C]" />
                  <span>Home</span>
                </Link>

                {/* 2. Categories Accordion */}
                <div className="rounded-[5px] border border-[#EDE4D9] bg-white overflow-hidden my-0.5">
                  <button
                    type="button"
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="w-full flex items-center justify-between py-2 px-2.5 text-xs font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4 text-[#144D29] shrink-0" />
                      <span>Spice Categories</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#7A6458] transition-transform duration-200 ${
                        mobileCategoriesOpen ? 'rotate-180 text-[#E07B0C]' : ''
                      }`}
                    />
                  </button>

                  {mobileCategoriesOpen && (
                    <div className="p-2 space-y-1.5 bg-[#FAF7F2] border-t border-[#EDE4D9] animate-in fade-in duration-150">
                      {resolvedShopCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-[5px] bg-white hover:bg-[#FDF0E6] border border-[#EDE4D9] hover:border-[#E07B0C]/40 transition-all group active:scale-[0.99] shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-9 h-9 rounded-[4px] bg-[#FAF5EE] border border-[#EDE4D9] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                sizes="36px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#14361F] group-hover:text-[#E07B0C] transition-colors truncate block">
                                  {cat.name}
                                </span>
                                <span className="text-[8px] uppercase font-bold text-[#E07B0C] bg-[#FFF3E6] border border-[#E07B0C]/20 px-1 py-0.2 rounded-[2px] shrink-0">
                                  {cat.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#7A6458] truncate block leading-tight mt-0.5">
                                {cat.subtext}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#E07B0C] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                        </Link>
                      ))}

                      {/* View All Categories Link */}
                      <Link
                        href="/shop"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-[5px] bg-[#14361F] text-white text-xs font-bold transition-colors mt-1 shadow-2xs"
                      >
                        <span>Browse All Categories</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Shop All Spices */}
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/shop' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 shrink-0 text-[#E07B0C]" />
                    <span>Shop All Spices</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-[3px] bg-[#E07B0C] text-white">
                    Pure
                  </span>
                </Link>

                {/* 4. Saved Wishlist */}
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/wishlist' ? 'bg-rose-50 text-rose-600' : 'text-[#14361F] hover:bg-white hover:text-rose-600'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Saved Wishlist</span>
                  </span>
                  {wishlistCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                      {wishlistCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#9C8A7F]">0 items</span>
                  )}
                </Link>

                {/* 5. My Orders */}
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/account/orders' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0 text-[#144D29]" />
                  <span>My Orders</span>
                </Link>

                {/* 5b. Saved Addresses (When Logged In) */}
                {isLoggedIn && (
                  <Link
                    href="/account/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                      pathname === '/account/addresses' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-[#144D29]" />
                    <span>Saved Addresses</span>
                  </Link>
                )}

                {/* 6. About Us */}
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/about' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                  }`}
                >
                  <Leaf className="w-4 h-4 shrink-0 text-[#144D29]" />
                  <span>About Us</span>
                </Link>

                {/* 7. Contact Us */}
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[5px] text-xs font-semibold transition-colors ${
                    pathname === '/contact' ? 'bg-[#FFF3E6] text-[#E07B0C]' : 'text-[#14361F] hover:bg-white hover:text-[#E07B0C]'
                  }`}
                >
                  <Phone className="w-4 h-4 shrink-0 text-[#E07B0C]" />
                  <span>Contact</span>
                </Link>

                {/* Modern Sign Out Action in Mobile Menu */}
                {isLoggedIn && (
                  <div className="pt-2 mt-1 border-t border-[#EDE4D9]/80">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                      disabled={isLoggingOut}
                      type="button"
                      className="w-full flex items-center justify-between py-2 px-2.5 rounded-[5px] text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer disabled:opacity-60 text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isLoggingOut ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                      </div>
                      <span className="text-[10px] text-rose-500 font-medium">Leave session</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>

            {/* Bottom Drawer Actions & Purity Guarantee */}
            <div className="mt-4 pt-3 border-t border-[#EDE4D9] space-y-2">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all active:scale-95"
              >
                <span>Shop Fresh Spices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="py-1 px-2 rounded-[5px] bg-white border border-[#EDE4D9] text-center text-[10px] font-medium text-[#7A6458]">
                🚚 Free Shipping Across India Above ₹499
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
