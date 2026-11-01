'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp, Check, ExternalLink, Eye, EyeOff, Loader2, Save } from 'lucide-react'
import { saveHomeSection } from '@/actions/admin/homeContent'
import type { HeroLinkOptions } from '@/actions/admin/hero'
import { HOME_DEFAULTS, type HomeContent, type HomeSectionKey } from '@/lib/homeContent'
import { Node } from './FormFields'
import { SectionSelector } from './SectionSelector'
import { LAYOUT_LABELS, SECTION_TABS, type SectionTab } from './formMeta'

type Status = { kind: 'idle' | 'saved' | 'error'; message?: string }

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const iconButton =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent'

function LayoutEditor({ value, onChange }: { value: HomeContent['layout']; onChange: (next: HomeContent['layout']) => void }) {
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const toggle = (index: number) => onChange(value.map((item, i) => (i === index ? { ...item, visible: !item.visible } : item)))

  return (
    <div className="space-y-2">
      {value.map((item, index) => {
        const meta = LAYOUT_LABELS[item.id]
        if (!meta) return null
        const { label, Icon } = meta

        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 rounded-2xl border p-2.5 transition-colors sm:gap-3 sm:p-3 ${
              item.visible ? 'border-stone-200 bg-white' : 'border-stone-200/70 bg-stone-50 opacity-70'
            }`}
          >
            <span className="hidden w-6 shrink-0 text-center text-xs font-bold text-stone-400 sm:block">{index + 1}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Icon className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-stone-800 sm:truncate">{label}</p>

            <button
              type="button"
              onClick={() => toggle(index)}
              aria-label={item.visible ? 'Shown. Tap to hide' : 'Hidden. Tap to show'}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-bold transition-colors sm:px-3 sm:py-1.5 ${
                item.visible ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              }`}
            >
              {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{item.visible ? 'Shown' : 'Hidden'}</span>
            </button>

            <div className="flex shrink-0 items-center">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={iconButton} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                className={iconButton}
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HeroPanel() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6 text-center">
      <p className="text-sm font-bold text-stone-800">The hero banner has its own manager</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">
        Slides, images, text on or off, banner visibility and the link of each image are all managed in Hero Slides.
      </p>
      <Link
        href="/admin/hero-slides"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
      >
        Open Hero Slides
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function HomeCustomizer({ initial, linkOptions }: { initial: HomeContent; linkOptions: HeroLinkOptions }) {
  const [content, setContent] = useState<HomeContent>(initial)
  const [saved, setSaved] = useState<HomeContent>(initial)
  const [activeKey, setActiveKey] = useState<SectionTab['key']>('layout')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [isPending, startTransition] = useTransition()

  const active = SECTION_TABS.find((tab) => tab.key === activeKey) ?? SECTION_TABS[0]
  const isDirty = (key: SectionTab['key']) => key !== 'hero' && !sameJson(content[key], saved[key])
  const anyDirty = SECTION_TABS.some((tab) => isDirty(tab.key))
  const dirty = isDirty(active.key)

  useEffect(() => {
    if (!anyDirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [anyDirty])

  const selectTab = (key: SectionTab['key']) => {
    setActiveKey(key)
    setStatus({ kind: 'idle' })
  }

  const setSection = (key: HomeSectionKey, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }) as HomeContent)
    setStatus({ kind: 'idle' })
  }

  const applySaved = (key: HomeSectionKey, section: unknown) => {
    setContent((prev) => ({ ...prev, [key]: section }) as HomeContent)
    setSaved((prev) => ({ ...prev, [key]: section }) as HomeContent)
  }

  const handleSave = () => {
    if (active.key === 'hero') return
    const key = active.key
    startTransition(async () => {
      const result = await saveHomeSection(key, content[key])
      if (result.success) {
        applySaved(key, result.section)
        setStatus({ kind: 'saved', message: 'Saved. The change is live on the home page.' })
      } else {
        setStatus({ kind: 'error', message: result.error })
      }
    })
  }

  const sectionKey = active.key === 'hero' ? null : active.key

  return (
    <div className="space-y-6">
      <SectionSelector tabs={SECTION_TABS} activeKey={activeKey} onSelect={selectTab} isDirty={isDirty} />

      {/* Active section */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{active.label}</h2>
            <p className="mt-0.5 text-sm text-stone-500">{active.description}</p>
          </div>

          <a
            href={active.anchor ? `/#${active.anchor}` : '/'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-stone-500 hover:text-stone-900"
          >
            View on website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {active.note && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span>{active.note.text}</span>
              <Link href={active.note.href} className="inline-flex items-center gap-1 font-bold underline underline-offset-2">
                {active.note.linkText}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {active.key === 'hero' && <HeroPanel />}

          {active.key === 'layout' && (
            <LayoutEditor value={content.layout} onChange={(next) => setSection('layout', next)} />
          )}

          {sectionKey && sectionKey !== 'layout' && (
            <Node
              key={sectionKey}
              nodeKey={sectionKey}
              value={content[sectionKey]}
              template={HOME_DEFAULTS[sectionKey]}
              onChange={((next: unknown) => setSection(sectionKey, next)) as (next: never) => void}
              ctx={{ section: sectionKey, linkOptions }}
            />
          )}
        </div>

        {/* Save bar */}
        {sectionKey && (
          <div className="sticky bottom-0 z-10 flex flex-col gap-2 rounded-b-2xl border-t border-stone-100 bg-white/95 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:px-6">
            <div className="min-h-5 text-center text-sm font-medium sm:text-left">
              {status.kind === 'saved' && (
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-4 w-4 shrink-0" />
                  {status.message}
                </span>
              )}
              {status.kind === 'error' && <span className="text-red-600">{status.message}</span>}
              {status.kind === 'idle' && dirty && <span className="text-orange-600">You have unsaved changes.</span>}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !dirty}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-stone-800 active:scale-95 disabled:cursor-default disabled:opacity-40 sm:w-auto sm:py-2.5"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
