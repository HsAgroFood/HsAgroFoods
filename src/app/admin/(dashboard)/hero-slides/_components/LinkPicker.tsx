'use client'

import { useEffect, useRef, useState } from 'react'
import { Ban, Check, ChevronDown, ExternalLink, FileText, Folder, Link2, Package, Pencil, Search, type LucideIcon } from 'lucide-react'
import type { HeroLinkOption, HeroLinkOptions } from '@/actions/admin/hero'

const fieldClass =
  'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900 disabled:opacity-60'

type Kind = 'page' | 'category' | 'product'

const KIND_META: Record<Kind, { title: string; Icon: LucideIcon; chip: string }> = {
  page: { title: 'Pages', Icon: FileText, chip: 'bg-sky-50 text-sky-700' },
  category: { title: 'Categories', Icon: Folder, chip: 'bg-amber-50 text-amber-700' },
  product: { title: 'Products', Icon: Package, chip: 'bg-emerald-50 text-emerald-700' },
}

// Option labels look like "Product: Turmeric Powder"; the group heading already says the type
const shortLabel = (label: string) => label.replace(/^(Page|Category|Product): /, '')

/** Searchable picker for a page, category or product to link to, or any custom URL. Empty value = no link. */
export function LinkPicker({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string
  onChange: (href: string) => void
  options: HeroLinkOptions
  disabled?: boolean
}) {
  const groups: { kind: Kind; items: HeroLinkOption[] }[] = [
    { kind: 'page', items: options.pages },
    { kind: 'category', items: options.categories },
    { kind: 'product', items: options.products },
  ]

  const known = groups.flatMap((group) => group.items.map((item) => ({ ...item, kind: group.kind })))
  const selected = known.find((item) => item.href === value)

  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState(Boolean(value) && !selected)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const selectedRowRef = useRef<HTMLButtonElement>(null)

  const needle = query.trim().toLowerCase()
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !needle || shortLabel(item.label).toLowerCase().includes(needle)),
    }))
    .filter((group) => group.items.length > 0)
  const noMatches = needle !== '' && visibleGroups.length === 0
  const showNoLink = !needle || 'no link'.includes(needle)

  const closePanel = () => {
    setOpen(false)
    setQuery('')
  }

  // Close on an outside tap or Escape. No full-screen overlay, so the page keeps scrolling normally.
  useEffect(() => {
    if (!open) return
    searchRef.current?.focus({ preventScroll: true })
    selectedRowRef.current?.scrollIntoView({ block: 'nearest' })

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = () => {
    if (open) return closePanel()
    // Open upwards when there is little room below the button
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setOpenUp(below < 340 && rect.top > below)
    }
    setOpen(true)
  }

  const choose = (href: string) => {
    setCustom(false)
    onChange(href)
    closePanel()
  }

  const chooseCustom = () => {
    setCustom(true)
    closePanel()
  }

  const rowClass = (active: boolean) =>
    `flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
      active ? 'bg-orange-50 text-orange-700' : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'
    }`

  // What the closed button shows
  let triggerIcon: LucideIcon = Ban
  let triggerText = 'No link (image will not be clickable)'
  let triggerChip: { text: string; className: string } | null = null
  if (custom) {
    triggerIcon = Link2
    triggerText = 'Custom URL'
    triggerChip = { text: 'Custom', className: 'bg-violet-50 text-violet-700' }
  } else if (selected) {
    triggerIcon = KIND_META[selected.kind].Icon
    triggerText = shortLabel(selected.label)
    triggerChip = { text: KIND_META[selected.kind].title.replace(/s$/, ''), className: KIND_META[selected.kind].chip }
  }
  const TriggerIcon = triggerIcon

  return (
    <div className="space-y-2">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-white p-2 pr-3 text-left transition-all disabled:cursor-default disabled:opacity-60 ${
            open ? 'border-orange-400 ring-4 ring-orange-500/10' : 'border-stone-200 hover:border-orange-300'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              value || custom ? 'bg-orange-50 text-orange-600' : 'bg-stone-100 text-stone-400'
            }`}
          >
            <TriggerIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800">{triggerText}</span>
          {triggerChip && (
            <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline ${triggerChip.className}`}>
              {triggerChip.text}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            className={`absolute inset-x-0 z-40 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl shadow-stone-900/15 animate-in fade-in duration-150 ${
              openUp ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'top-full mt-2 slide-in-from-top-2'
            }`}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, categories, products…"
                className={`${fieldClass} pl-9`}
              />
            </div>

            <div role="listbox" className="mt-2 max-h-[min(55vh,19rem)] overflow-y-auto overscroll-contain pr-0.5">
              {showNoLink && (
                <button type="button" role="option" aria-selected={!value && !custom} onClick={() => choose('')} className={rowClass(!value && !custom)}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                    <Ban className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">No link</span>
                    <span className="block text-xs text-stone-400">Not clickable</span>
                  </span>
                  {!value && !custom && <Check className="h-4 w-4 shrink-0" />}
                </button>
              )}

              {visibleGroups.map((group) => {
                const meta = KIND_META[group.kind]
                return (
                  <div key={group.kind} className="mt-1">
                    <p className="sticky top-0 z-10 bg-white/95 px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 backdrop-blur">
                      {meta.title} <span className="font-semibold">({group.items.length})</span>
                    </p>
                    {group.items.map((item) => {
                      const active = !custom && item.href === value
                      return (
                        <button
                          key={item.href}
                          ref={active ? selectedRowRef : undefined}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => choose(item.href)}
                          className={rowClass(active)}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-orange-100 text-orange-600' : meta.chip}`}>
                            <meta.Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{shortLabel(item.label)}</span>
                            <span className="block truncate text-xs text-stone-400">{item.href}</span>
                          </span>
                          {active && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              {noMatches && <p className="px-3 py-8 text-center text-sm text-stone-400">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>}

              {!needle && (
                <button type="button" role="option" aria-selected={custom} onClick={chooseCustom} className={`${rowClass(custom)} mt-1 border-t border-stone-100 pt-3`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Pencil className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Custom URL</span>
                    <span className="block text-xs text-stone-400">Type any link yourself</span>
                  </span>
                  {custom && <Check className="h-4 w-4 shrink-0" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {custom && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="/product/turmeric-powder or https://…"
          className={fieldClass}
        />
      )}

      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800"
        >
          <ExternalLink className="h-3 w-3" />
          Preview link
        </a>
      )}
    </div>
  )
}
