'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { SectionTab } from './formMeta'

type Props = {
  tabs: SectionTab[]
  activeKey: SectionTab['key']
  onSelect: (key: SectionTab['key']) => void
  isDirty: (key: SectionTab['key']) => boolean
}

/** Phones: a tappable card that opens a list of every section. Tablet and desktop: a panel of wrapping tabs. */
export function SectionSelector({ tabs, activeKey, onSelect, isDirty }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const activeRowRef = useRef<HTMLButtonElement>(null)

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.key === activeKey))
  const active = tabs[activeIndex]
  const anyOtherDirty = tabs.some((tab) => tab.key !== activeKey && isDirty(tab.key))

  // Close on outside tap or Escape. No full-screen overlay, so the page keeps scrolling normally.
  useEffect(() => {
    if (!open) return
    activeRowRef.current?.scrollIntoView({ block: 'nearest' })

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
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

  const choose = (key: SectionTab['key']) => {
    onSelect(key)
    setOpen(false)
  }

  return (
    <>
      {/* Phones */}
      <div ref={rootRef} className="relative md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all ${
            open ? 'border-orange-400 ring-4 ring-orange-500/10' : 'border-stone-200 active:scale-[0.99]'
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/30">
            <active.Icon className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold leading-tight text-stone-900">{active.label}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-stone-400">
              Section {activeIndex + 1} of {tabs.length}
              {isDirty(active.key) && (
                <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Unsaved
                </span>
              )}
            </span>
          </span>

          <span className="relative flex shrink-0 items-center gap-1.5 text-xs font-bold text-stone-500">
            {anyOtherDirty && <span className="h-2 w-2 rounded-full bg-orange-500" title="Another section has unsaved changes" />}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </span>
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute inset-x-0 z-30 mt-2 max-h-[min(70vh,30rem)] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200 bg-white p-1.5 shadow-2xl shadow-stone-900/15 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {tabs.map((tab, index) => {
              const selected = tab.key === activeKey
              return (
                <button
                  key={tab.key}
                  ref={selected ? activeRowRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(tab.key)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                    selected ? 'bg-orange-50' : 'hover:bg-stone-50 active:bg-stone-100'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm shadow-orange-500/30'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    <tab.Icon className="h-[18px] w-[18px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-bold ${selected ? 'text-orange-700' : 'text-stone-800'}`}>
                      <span className="mr-1.5 font-semibold text-stone-400">{index + 1}.</span>
                      {tab.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-stone-500">{tab.description}</span>
                  </span>

                  {isDirty(tab.key) && <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" title="Unsaved changes" />}
                  {selected && <Check className="h-4 w-4 shrink-0 text-orange-600" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Tablet and desktop */}
      <div className="hidden flex-wrap gap-1.5 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm md:flex">
        {tabs.map((tab) => {
          const selected = tab.key === activeKey
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelect(tab.key)}
              aria-current={selected ? 'page' : undefined}
              className={`group relative inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                selected
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/30'
                  : 'text-stone-600 hover:bg-orange-50 hover:text-orange-700'
              }`}
            >
              <tab.Icon
                className={`h-4 w-4 transition-transform duration-200 ${selected ? '' : 'text-stone-400 group-hover:scale-110 group-hover:text-orange-500'}`}
              />
              {tab.label}
              {isDirty(tab.key) && (
                <span
                  className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ${
                    selected ? 'bg-white ring-orange-500' : 'bg-orange-500 ring-white'
                  }`}
                  title="Unsaved changes"
                />
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
