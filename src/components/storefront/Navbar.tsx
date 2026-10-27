'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, User, Menu, X, ChevronDown, Search, ArrowRight, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

type NavLink = {
  name: string
  href: string
  hasDropdown?: boolean
  subItems?: { name: string; href: string }[]
}

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
  user?: { name: string; email: string } | null
  categories?: { name: string; slug: string }[]
}) {
  const dynamicSubItems = categories.length > 0
    ? [
        { name: 'All Products', href: '/shop' },
        ...categories.map((c) => ({ name: c.name, href: `/shop?category=${c.slug}` })),
      ]
    : defaultCategoryItems

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Live Search Suggestion State
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Live search debounce effect
  useEffect(() => {
    const trimmed = desktopSearchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        const json = await res.json()
        setSearchResults(json.results || [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 200)

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

  // Scroll to top when clicking Home / Brand Logo
  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setCategoriesDropdownOpen(false)
  }, [pathname])

  // Body scroll lock & ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFF9F0]/95 backdrop-blur-md text-[#14361F] shadow-sm border-b border-[#F2DEC0] transition-all">
        <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-[68px] sm:h-20 items-center justify-between">

            {/* Brand Logo (Transparent PNG on Warm Cream Header + Brand Name) */}
            <div className="flex items-center">
              <Link href="/" onClick={handleHomeClick} className="group flex items-center gap-2 sm:gap-2.5" aria-label="HS AgroFoods">
                <div className="relative w-16 h-16 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] group-hover:scale-105 transition-transform shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="HS AgroFoods Logo"
                    fill
                    priority
                    unoptimized
                    className="object-contain drop-shadow-xs"
                    sizes="(max-width: 1024px) 64px, 72px"
                  />
                </div>
                <div className="flex flex-col leading-none whitespace-nowrap shrink-0">
                  <span className="font-serif text-[17px] sm:text-lg lg:text-xl font-extrabold tracking-tight text-[#144D29]">
                    HS <span className="text-[#E07B0C]">AgroFoods</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#7A6248] mt-0.5">
                    100% Pure &amp; Natural
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:items-center lg:gap-5 xl:gap-7 shrink-0">
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
                        className="flex items-center gap-1.5 text-[15px] font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            categoriesDropdownOpen ? 'rotate-180 text-[#E07B0C]' : 'text-[#144D29]'
                          }`}
                        />
                      </button>
                      {categoriesDropdownOpen && (
                        <div className="absolute top-full left-0 mt-0.5 w-60 rounded-2xl bg-[#FFFDF9] text-[#14361F] shadow-2xl border border-[#F0DEC2] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                          <div className="px-4 py-2 border-b border-[#F5E6CE] bg-[#FFF6E6]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A6B32]">
                              Spice Categories
                            </span>
                          </div>
                          {link.subItems?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setCategoriesDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-sm text-[#14361F] hover:bg-[#FFF5E4] hover:text-[#E07B0C] font-medium transition-colors group/item"
                            >
                              <span>{subItem.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/item:text-[#E07B0C] group-hover/item:translate-x-0.5 transition-all" />
                            </Link>
                          ))}
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
                      } else if (link.href.startsWith('/#')) {
                        const targetId = link.href.replace('/#', '')
                        const el = document.getElementById(targetId)
                        if (el) {
                          e.preventDefault()
                          el.scrollIntoView({ behavior: 'smooth' })
                          window.history.replaceState(null, '', `/#${targetId}`)
                        }
                      }
                    }}
                    className="text-[15px] font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            {/* Right Side: Desktop Search & Actions + Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Desktop Search Bar with Live Auto-complete Suggestions (Hidden on Mobile) */}
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
                    onChange={(e) => {
                      setDesktopSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search spices, fruit & veg powders..."
                    className="w-44 xl:w-60 pl-10 pr-9 py-2 rounded-full bg-white hover:bg-[#FFFCF6] border border-[#EBCFA6] text-sm text-[#14361F] placeholder-[#8A7256] focus:outline-none focus:ring-2 focus:ring-[#F09819]/35 focus:border-[#F09819] focus:bg-white focus:w-64 transition-all shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-[#E07B0C] group-focus-within:text-[#144D29] absolute left-3.5 pointer-events-none transition-colors" />
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#E07B0C] animate-spin absolute right-3.5" />
                  ) : desktopSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setDesktopSearchQuery('')
                        setSearchResults([])
                      }}
                      className="absolute right-3 text-[#8A7256] hover:text-[#14361F]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Floating Live Suggestions Dropdown */}
                {showSuggestions && desktopSearchQuery.trim().length >= 2 && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-[#14361F] shadow-2xl border border-[#F0DEC2] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 bg-[#FFF6E6] border-b border-[#F0DEC2] flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-[#9A6B32]">
                        Products ({searchResults.length})
                      </span>
                      <span className="text-[11px] text-[#8A7256]">Press enter to view all</span>
                    </div>

                    {searchResults.length === 0 && !isSearching ? (
                      <div className="p-6 text-center text-sm text-[#8A7256]">
                        No spices found for &ldquo;<span className="font-bold text-[#14361F]">{desktopSearchQuery}</span>&rdquo;
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F5E6CE] max-h-80 overflow-y-auto">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-3 hover:bg-[#FFF6E6] transition-colors group"
                          >
                            <div className="w-11 h-11 relative rounded-xl overflow-hidden bg-[#FFF9F0] shrink-0 border border-[#F0DEC2]">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="44px"
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
                        className="block text-center py-2.5 bg-[#FFF6E6] hover:bg-[#FDEBC8] text-xs font-bold text-[#144D29] border-t border-[#F0DEC2] transition-colors"
                      >
                        View all results for &ldquo;{desktopSearchQuery}&rdquo; →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop "Shop Now" Pill Button (Vibrant Saffron-Orange matching Logo) */}
              <Link
                href="/shop"
                className="hidden lg:inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F09819] to-[#E07B0C] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#F09819]/25 hover:from-[#DF870D] hover:to-[#C96B06] hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                Shop Now
              </Link>

              {/* Cart Icon (Middle - Left of Profile) */}
              <Link
                href="/cart"
                className="relative p-2 text-[#144D29] hover:text-[#E07B0C] transition-colors hidden lg:block shrink-0"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E07B0C] px-1 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              </Link>

              {/* Account Link (Far Right: Compact Circular Avatar Badge when Logged In) */}
              {isLoggedIn && user ? (
                <Link
                  href="/account"
                  className="relative hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-[#144D29] hover:bg-[#E07B0C] text-white font-bold text-sm ring-2 ring-[#F09819]/50 hover:ring-[#E07B0C] transition-all shadow-sm shrink-0"
                  title={`My Account (${user.name || user.email})`}
                  aria-label="My Account"
                >
                  {(user.name?.trim() ? user.name.trim().split(' ')[0] : 'U').charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#FFF9F0]" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-[#144D29] hover:text-[#E07B0C] transition-colors rounded-full hover:bg-[#FFF3E0] hidden lg:block shrink-0"
                  title="Sign In"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* Mobile Right: Quick Search Button & Hamburger Menu */}
              <div className="flex items-center gap-1 lg:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(true)
                    setShowSuggestions(true)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[#144D29] hover:text-[#E07B0C] hover:bg-[#FFF3E0] active:scale-90 transition-all cursor-pointer"
                  aria-label="Search Spices"
                >
                  <Search className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[#144D29] hover:text-[#E07B0C] hover:bg-[#FFF3E0] active:scale-90 transition-all focus:outline-none cursor-pointer"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Live Search Modal */}
      {mounted && mobileSearchOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSearchOpen(false)}
          />

          <div className="fixed top-0 inset-x-0 bg-[#FFF9F0] text-[#14361F] p-4 shadow-2xl z-[100000] border-b border-[#EBCFA6]">
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
                <Search className="w-4 h-4 text-[#E07B0C] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  autoComplete="off"
                  value={desktopSearchQuery}
                  onChange={(e) => {
                    setDesktopSearchQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  placeholder="Search pure spices, blends..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-[#EBCFA6] text-sm text-[#14361F] placeholder-[#8A7256] focus:outline-none focus:ring-2 focus:ring-[#F09819]"
                />
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-[#E07B0C] animate-spin absolute right-3" />
                ) : desktopSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopSearchQuery('')
                      setSearchResults([])
                    }}
                    className="absolute right-3 text-[#8A7256] hover:text-[#14361F]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-[#144D29] hover:text-[#E07B0C] text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            {/* Live Search Suggestions Dropdown */}
            {desktopSearchQuery.trim().length >= 2 && (
              <div className="mt-3 bg-white rounded-2xl text-[#14361F] overflow-hidden shadow-xl border border-[#F0DEC2] max-h-72 overflow-y-auto">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-xs text-[#8A7256]">
                    No spices found for &ldquo;<strong>{desktopSearchQuery}</strong>&rdquo;
                  </div>
                ) : (
                  <div className="divide-y divide-[#F5E6CE]">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        onClick={() => {
                          setMobileSearchOpen(false)
                          setDesktopSearchQuery('')
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#FFF6E6] transition-colors"
                      >
                        <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-[#FFF9F0] shrink-0 border border-[#F0DEC2]">
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

      {/* Render Mobile Drawer via Portal if mounted and open */}
      {mounted && mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content (Warm Cream & Saffron Drawer) */}
          <div className="fixed inset-y-0 right-0 z-[100000] w-[85%] max-w-xs bg-[#FFF9F0] text-[#14361F] p-6 shadow-2xl border-l border-[#F0DEC2] overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-250 ease-out">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F0DEC2] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-12 h-12 shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="HS AgroFoods Logo"
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <span className="font-serif text-lg font-extrabold text-[#144D29]">
                    HS <span className="text-[#E07B0C]">AgroFoods</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#144D29] hover:text-[#E07B0C] hover:bg-[#FFF0D6] transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-6 flex flex-col space-y-2">
                <Link
                  href="/"
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleHomeClick(e)
                  }}
                  className="block text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2"
                >
                  Home
                </Link>

                {/* Categories Collapsible Accordion */}
                <div className="border-y border-[#F0DEC2] py-1">
                  <button
                    type="button"
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="w-full flex items-center justify-between text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2 cursor-pointer"
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#144D29] transition-transform duration-200 ${
                        mobileCategoriesOpen ? 'rotate-180 text-[#E07B0C]' : ''
                      }`}
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <div className="pl-3 pr-1 pb-2 space-y-1.5 animate-in fade-in duration-150">
                      {dynamicSubItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-sm text-[#4A3B2C] hover:text-[#E07B0C] hover:bg-[#FFF0D6] transition-colors"
                        >
                          <span>{subItem.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#E07B0C]" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2"
                >
                  All Spices
                </Link>

                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2"
                >
                  Your Orders
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2"
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-semibold text-[#14361F] hover:text-[#E07B0C] transition-colors py-2"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Bottom CTA Buttons & User Profile */}
            <div className="mt-8 pt-6 border-t border-[#F0DEC2] space-y-3">
              {isLoggedIn && user && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F0DEC2] mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#144D29] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {(user.name?.trim() ? user.name.trim().split(' ')[0] : 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#14361F] truncate">{user.name || 'Customer'}</p>
                    <p className="text-[11px] text-[#7A6248] truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center rounded-full bg-gradient-to-r from-[#F09819] to-[#E07B0C] py-3 text-sm font-bold text-white shadow-md hover:from-[#DF870D] hover:to-[#C96B06] transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href={isLoggedIn ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center rounded-full border border-[#144D29]/30 py-2.5 text-sm font-semibold text-[#144D29] hover:bg-[#FFF0D6] transition-colors"
              >
                {isLoggedIn ? `My Account (${user?.name?.trim() ? user.name.trim().split(' ')[0] : 'Profile'})` : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
