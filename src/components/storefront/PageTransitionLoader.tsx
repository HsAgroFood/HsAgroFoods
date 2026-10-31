'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageLoadingSpinner } from './PageLoadingSpinner'

/**
 * Programmatic helper to trigger the 1.3s page transition loader from any client component
 * (e.g. before router.push or form submissions).
 */
export function triggerPageTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hs-page-transition-start'))
  }
}

function PageTransitionLoaderInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const startTimeRef = useRef<number>(0)
  const lastPathnameRef = useRef<string>(pathname)
  const lastSearchRef = useRef<string>(searchParams?.toString() || '')
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Start transition helper
  const startTransition = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

    startTimeRef.current = Date.now()
    setIsFading(false)
    setIsLoading(true)

    // Safety timeout: auto dismiss after 5s so page never gets permanently stuck
    safetyTimerRef.current = setTimeout(() => {
      setIsFading(true)
      setTimeout(() => {
        setIsLoading(false)
        setIsFading(false)
        startTimeRef.current = 0
      }, 250)
    }, 1200)
  }

  // Intercept document link clicks & popstate
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modified clicks (Ctrl, Cmd, Shift, Alt)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.defaultPrevented) return

      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Skip mailto, tel, javascript, hash-only
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) {
        return
      }

      // Skip new tab or download
      if (target.getAttribute('target') === '_blank' || target.hasAttribute('download')) {
        return
      }

      try {
        const targetUrl = new URL(target.href, window.location.origin)
        // Skip external domains
        if (targetUrl.origin !== window.location.origin) return

        const currentPath = window.location.pathname
        const currentSearch = window.location.search

        // Skip same-page in-page anchor jumps (e.g. /#spice-range)
        if (targetUrl.pathname === currentPath && targetUrl.hash) return

        // Skip clicking current page with same query
        if (targetUrl.pathname === currentPath && targetUrl.search === currentSearch) return

        // Valid internal route navigation -> Start branded loader
        startTransition()
      } catch {
        // Safe ignore
      }
    }

    const handlePopState = () => {
      startTransition()
    }

    const handleCustomTrigger = () => {
      startTransition()
    }

    document.addEventListener('click', handleClick, { capture: true })
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hs-page-transition-start', handleCustomTrigger)

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hs-page-transition-start', handleCustomTrigger)
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [])

  // Detect route change completion and enforce 1.3s (1300ms) minimum display duration
  useEffect(() => {
    const currentSearch = searchParams?.toString() || ''
    const routeChanged =
      pathname !== lastPathnameRef.current || currentSearch !== lastSearchRef.current

    lastPathnameRef.current = pathname
    lastSearchRef.current = currentSearch

    if (routeChanged && (isLoading || startTimeRef.current > 0)) {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

      const elapsed = Date.now() - startTimeRef.current
      const MIN_DURATION = 1300 // Exactly 1.3 seconds as requested
      const remainingTime = Math.max(0, MIN_DURATION - elapsed)

      dismissTimerRef.current = setTimeout(() => {
        setIsFading(true)
        setTimeout(() => {
          setIsLoading(false)
          setIsFading(false)
          startTimeRef.current = 0
        }, 250)
      }, remainingTime)
    }
  }, [pathname, searchParams, isLoading])

  if (!isLoading) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page..."
      className={`fixed inset-0 z-35 bg-[#FAF7F2] flex flex-col justify-between transition-opacity duration-250 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* ── Fixed Header Spacer (Preserves space for sticky/fixed Navbar at top) ── */}
      <div className="h-[70px] sm:h-20 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* ── Center Modern Brand Spinner (h-screen feel, center logo + outside spinning circle) ── */}
      <div className="flex-1 flex items-center justify-center p-4">
        <PageLoadingSpinner />
      </div>

      {/* ── Fixed Footer Strip (Sleek brand footer visible on desktop at bottom) ── */}
      <footer className="w-full shrink-0 border-t border-[#EDE4D9]/80 bg-[#FAF7F2] px-4 sm:px-8 py-3 text-xs text-[#7A6458] hidden lg:flex items-center justify-between">
        <p className="font-serif text-xs text-[#14361F]">
          &copy; {new Date().getFullYear()} <strong className="font-bold">HS AgroFoods</strong>. 100% Pure & Cold-Ground.
        </p>
        <div className="flex items-center gap-4 text-[11px] font-medium text-[#8C766E]">
          <span>🌱 Natural & Pure</span>
          <span>•</span>
          <span>🇮🇳 Authentic Indian Spices</span>
          <span>•</span>
          <span>✨ FSSAI Certified</span>
        </div>
      </footer>

      {/* Mobile Safe Area Bottom Padding so center is perfectly spaced above fixed MobileBottomBar */}
      <div className="h-16 shrink-0 lg:hidden pointer-events-none" aria-hidden="true" />
    </div>
  )
}

export function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderInner />
    </Suspense>
  )
}

