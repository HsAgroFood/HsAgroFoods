'use client'

import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ImageIcon, Loader2, Plus, RefreshCw, Search, Sparkles, Trash2, Upload } from 'lucide-react'
import { ImageKitUpload } from '@/components/admin/ImageKitUpload'
import { LinkPicker } from '@/app/admin/(dashboard)/hero-slides/_components/LinkPicker'
import type { HeroLinkOptions } from '@/actions/admin/hero'
import { HOME_ICON_NAMES } from '@/lib/homeIconNames'
import { MAX_LIST_ITEMS } from '@/lib/homeContent'
import { HOME_ICONS, resolveHomeIcon } from '@/lib/homeIcons'
import { ARRAY_RULES, fieldHint, fieldLabel, imageHint, imagePreview } from './formMeta'

export type FormCtx = { section: string; linkOptions: HeroLinkOptions }

type Rec = Record<string, unknown>

const inputClass =
  'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900'

const LONG_TEXT_KEYS = new Set(['paragraph', 'description', 'subtitle', 'desc', 'detail', 'tag', 'successText', 'emptyText'])

const isRecord = (value: unknown): value is Rec => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isImageKey = (key: string) => /^(src|image)$|Image$/.test(key)
const isLinkKey = (key: string) => /(link|href)$/i.test(key)
const isIconKey = (key: string) => key === 'icon'
const iconTitle = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
const isLongText = (key: string, template: string) => LONG_TEXT_KEYS.has(key) || template.length > 90

/** A copy of an item template with the text cleared (images keep their default) for the "Add" button. */
function blankLike(template: unknown, key = ''): unknown {
  if (typeof template === 'string') return isImageKey(key) || isIconKey(key) ? template : ''
  if (Array.isArray(template)) return []
  if (isRecord(template)) {
    return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, blankLike(v, k)]))
  }
  return template
}

function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="mb-1">
      <label className="block text-xs font-bold text-stone-700">{text}</label>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-stone-400">{hint}</p>}
    </div>
  )
}

function IconPicker({ value, onChange, compact = false }: { value: string; onChange: (next: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const names = HOME_ICON_NAMES.filter((name) => iconTitle(name).toLowerCase().includes(query.trim().toLowerCase()))

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  // Close on an outside click or Escape. No full-screen overlay is used, because a fixed overlay swallows the
  // mouse wheel and the page stops scrolling while the picker is open.
  useEffect(() => {
    if (!open) return
    searchRef.current?.focus({ preventScroll: true })

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose icon"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white p-1.5 pr-2.5 transition-colors hover:border-orange-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          {createElement(resolveHomeIcon(value, Sparkles), { className: 'h-4 w-4' })}
        </span>
        {!compact && <span className="text-sm font-semibold text-stone-700">{value ? iconTitle(value) : 'Choose icon'}</span>}
        <ChevronDown className={`h-3.5 w-3.5 text-stone-400 ${compact ? 'hidden sm:block' : ''}`} />
      </button>

      {open && (
        <>
          <div className="absolute left-0 z-40 mt-2 w-[min(22rem,85vw)] rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons (leaf, truck, heart…)"
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="mt-3 grid max-h-64 grid-cols-6 gap-1.5 overflow-y-auto pr-1">
              {names.map((name) => {
                const Icon = HOME_ICONS[name]
                const selected = name === value
                return (
                  <button
                    key={name}
                    type="button"
                    title={iconTitle(name)}
                    aria-label={iconTitle(name)}
                    onClick={() => {
                      onChange(name)
                      close()
                    }}
                    className={`flex h-10 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                      selected ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                )
              })}
            </div>
            {names.length === 0 && <p className="py-6 text-center text-xs text-stone-400">No icon found.</p>}
          </div>
        </>
      )}
    </div>
  )
}

function ImageNode({
  nodeKey,
  value,
  template,
  onChange,
  ctx,
}: {
  nodeKey: string
  value: string
  template: string
  onChange: (next: string) => void
  ctx: FormCtx
}) {
  const hint = imageHint(ctx.section, nodeKey)
  const preview = imagePreview(ctx.section, nodeKey)
  const isDefault = value === template

  return (
    <div>
      <Label text={fieldLabel(ctx.section, nodeKey)} hint={hint} />
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-100 bg-center bg-no-repeat ${preview.width} ${
            preview.cover ? 'bg-cover' : 'bg-contain'
          }`}
          style={{ aspectRatio: preview.ratio, ...(value ? { backgroundImage: `url("${value}")` } : {}) }}
        >
          {!value && <ImageIcon className="h-6 w-6 text-stone-400" />}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <ImageKitUpload folder="/home" multiple={false} onSuccess={(res) => onChange(res.url)}>
            {({ open, isUploading }) => (
              <button
                type="button"
                onClick={open}
                disabled={isUploading}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {isUploading ? 'Uploading…' : 'Replace image'}
              </button>
            )}
          </ImageKitUpload>
          {!isDefault && (
            <button
              type="button"
              onClick={() => onChange(template)}
              className="cursor-pointer text-[11px] font-semibold text-stone-400 hover:text-stone-700"
            >
              Use original image
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StringNode({
  nodeKey,
  value,
  template,
  onChange,
  ctx,
}: {
  nodeKey: string
  value: string
  template: string
  onChange: (next: string) => void
  ctx: FormCtx
}) {
  if (isImageKey(nodeKey)) {
    return <ImageNode nodeKey={nodeKey} value={value} template={template} onChange={onChange} ctx={ctx} />
  }

  const label = fieldLabel(ctx.section, nodeKey)
  const hint = fieldHint(ctx.section, nodeKey)

  if (isIconKey(nodeKey)) {
    return (
      <div>
        <Label text={label} hint={hint} />
        <IconPicker value={value} onChange={onChange} />
      </div>
    )
  }

  if (isLinkKey(nodeKey)) {
    return (
      <div>
        <Label text={label} hint={hint} />
        <LinkPicker value={value} onChange={onChange} options={ctx.linkOptions} />
      </div>
    )
  }

  return (
    <div>
      <Label text={label} hint={hint} />
      {isLongText(nodeKey, template) ? (
        <textarea
          rows={Math.min(7, Math.max(nodeKey === 'tag' ? 2 : 3, Math.ceil(Math.max(value.length, template.length) / 80)))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  )
}

function BooleanNode({
  nodeKey,
  value,
  onChange,
  ctx,
}: {
  nodeKey: string
  value: boolean
  onChange: (next: boolean) => void
  ctx: FormCtx
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-stone-700">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-orange-500" />
      {fieldLabel(ctx.section, nodeKey)}
    </label>
  )
}

function itemSummary(item: unknown) {
  if (!isRecord(item)) return ''
  for (const key of ['title', 'caption', 'label', 'titleFirst']) {
    if (typeof item[key] === 'string' && item[key]) return item[key] as string
  }
  return ''
}

const iconButton =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent'

function ListNode({
  nodeKey,
  value,
  template,
  onChange,
  ctx,
}: {
  nodeKey: string
  value: unknown[]
  template: unknown[]
  onChange: (next: unknown[]) => void
  ctx: FormCtx
}) {
  const rule = ARRAY_RULES[nodeKey] ?? { item: 'Item' }
  const itemTemplate = template[0]
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value])
  const canAdd = !rule.fixed && items.length < (rule.max ?? MAX_LIST_ITEMS)
  // Lists of photos (gallery, slider) can also be filled by uploading many pictures at once
  const imageKey = isRecord(itemTemplate) ? Object.keys(itemTemplate).find(isImageKey) : undefined
  const latestItems = useRef<unknown[]>(items)
  useEffect(() => {
    latestItems.current = items
  }, [items])

  // Uploads finish one after another, so each one appends to the newest list instead of the render's snapshot
  const addUploaded = (url: string) => {
    if (!imageKey) return
    const next = [...latestItems.current, { ...(blankLike(itemTemplate, nodeKey) as Rec), [imageKey]: url }]
    latestItems.current = next
    onChange(next)
  }
  // Items made of just a label (and optionally an icon), like pills, are shown as one compact row each
  const compact =
    isRecord(itemTemplate) &&
    typeof itemTemplate.label === 'string' &&
    Object.keys(itemTemplate).every((key) => key === 'label' || key === 'icon')

  const update = (index: number, next: unknown) => onChange(items.map((item, i) => (i === index ? next : item)))
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const controls = (index: number) =>
    !rule.fixed && (
      <div className="ml-auto flex shrink-0 items-center">
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={iconButton} aria-label="Move up">
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => move(index, 1)}
          disabled={index === items.length - 1}
          className={iconButton}
          aria-label="Move down"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => remove(index)} className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`} aria-label="Remove">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {rule.item}s <span className="font-semibold normal-case text-stone-400">({items.length})</span>
        </p>
        {canAdd && (
          <div className="flex flex-wrap items-center gap-2">
            {imageKey && (
              <ImageKitUpload folder="/home" multiple maxFiles={20} onSuccess={(res) => addUploaded(res.url)}>
                {({ open, isUploading }) => (
                  <button
                    type="button"
                    onClick={open}
                    disabled={isUploading}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                  >
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploading ? 'Uploading…' : `Upload ${rule.item.toLowerCase()}s`}
                  </button>
                )}
              </ImageKitUpload>
            )}
            <button
              type="button"
              onClick={() => onChange([...items, blankLike(itemTemplate, nodeKey)])}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add {rule.item.toLowerCase()}
            </button>
          </div>
        )}
      </div>
      {imageKey && canAdd && (
        <p className="-mt-1 text-[11px] text-stone-400">
          Upload several pictures at once (up to 20 per go). Each one becomes a new {rule.item.toLowerCase()} that you can
          then give a title and link, or leave as a plain picture.
        </p>
      )}

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-200 py-6 text-center text-xs text-stone-400">
          Nothing here yet.
        </p>
      )}

      {items.map((item, index) =>
        compact && isRecord(itemTemplate) ? (
          <div key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <span className="hidden w-5 shrink-0 text-center text-xs font-bold text-stone-400 sm:block">{index + 1}</span>
            {'icon' in itemTemplate && (
              <IconPicker
                compact
                value={isRecord(item) && typeof item.icon === 'string' ? item.icon : ''}
                onChange={(next) => update(index, { ...(isRecord(item) ? item : {}), icon: next })}
              />
            )}
            <div className="min-w-0 flex-1 basis-40">
              <input
                type="text"
                value={isRecord(item) && typeof item.label === 'string' ? item.label : ''}
                onChange={(e) => update(index, { ...(isRecord(item) ? item : {}), label: e.target.value })}
                className={inputClass}
              />
            </div>
            {controls(index)}
          </div>
        ) : (
          <div key={index} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-bold text-stone-800">
                {rule.item} {index + 1}
                {itemSummary(item) && <span className="font-medium text-stone-400"> · {itemSummary(item)}</span>}
              </p>
              {controls(index)}
            </div>
            <Node nodeKey={nodeKey} value={item} template={itemTemplate} onChange={(next) => update(index, next)} ctx={ctx} />
          </div>
        )
      )}
    </div>
  )
}

function ObjectNode({ value, template, onChange, ctx }: { value: Rec; template: Rec; onChange: (next: Rec) => void; ctx: FormCtx }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Object.keys(template).map((key) => {
        const childTemplate = template[key]
        const wide =
          Array.isArray(childTemplate) ||
          isRecord(childTemplate) ||
          (typeof childTemplate === 'string' && (isImageKey(key) || isLongText(key, childTemplate)))

        return (
          <div key={key} className={wide ? 'sm:col-span-2' : ''}>
            <Node
              nodeKey={key}
              value={value[key]}
              template={childTemplate}
              onChange={(next) => onChange({ ...value, [key]: next })}
              ctx={ctx}
            />
          </div>
        )
      })}
    </div>
  )
}

/** Renders the right editor for a piece of content based on the shape of its default. */
export function Node({
  nodeKey,
  value,
  template,
  onChange,
  ctx,
  hideLabel = false,
}: {
  nodeKey: string
  value: unknown
  template: unknown
  onChange: (next: never) => void
  ctx: FormCtx
  hideLabel?: boolean
}) {
  const change = onChange as (next: unknown) => void

  if (typeof template === 'string') {
    const text = typeof value === 'string' ? value : template
    if (hideLabel && !isImageKey(nodeKey) && !isLinkKey(nodeKey)) {
      return <input type="text" value={text} onChange={(e) => change(e.target.value)} className={inputClass} />
    }
    return <StringNode nodeKey={nodeKey} value={text} template={template} onChange={change} ctx={ctx} />
  }

  if (typeof template === 'boolean') {
    return <BooleanNode nodeKey={nodeKey} value={typeof value === 'boolean' ? value : template} onChange={change} ctx={ctx} />
  }

  if (Array.isArray(template)) {
    return (
      <ListNode
        nodeKey={nodeKey}
        value={Array.isArray(value) ? value : template}
        template={template}
        onChange={change}
        ctx={ctx}
      />
    )
  }

  if (isRecord(template)) {
    return <ObjectNode value={isRecord(value) ? value : template} template={template} onChange={change} ctx={ctx} />
  }

  return null
}
