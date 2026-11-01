'use client'

import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Eye, EyeOff, Check, X, Wand2 } from 'lucide-react'
import {
  addGlobalFaq,
  updateGlobalFaq,
  deleteGlobalFaq,
  updateGlobalFaqOrders,
  setGlobalFaqActive,
} from '@/actions/global_faqs'
import { FAQ_ICONS, cleanFaqIcon, resolveFaqIcon } from '@/lib/faqIcons'

type Faq = {
  id: string
  question: string
  answer: string
  display_order: number
  is_active?: boolean
  icon?: string | null
}

type Notice = { type: 'success' | 'error'; text: string }

const inputClass =
  'block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'

/** Dropdown for the icon shown on the homepage card. "Auto" lets the site guess from the question text. */
function IconPicker({
  value,
  question,
  onChange,
}: {
  value: string | null
  question: string
  onChange: (icon: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (icon: string | null) => {
    onChange(icon)
    setOpen(false)
  }

  const badge = (selected: boolean) =>
    `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
      selected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
    }`

  const rowClass = (selected: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
      selected ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-gray-700 hover:bg-gray-50'
    }`

  return (
    <div ref={rootRef} className="relative">
      <p className="block text-sm font-medium leading-6 text-gray-900">Homepage icon</p>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mt-1 flex w-full items-center gap-3 rounded-lg bg-white px-2.5 py-2 text-left shadow-sm ring-1 ring-inset transition sm:max-w-xs ${
          open ? 'ring-2 ring-indigo-600' : 'ring-gray-300 hover:ring-gray-400'
        }`}
      >
        <span className={badge(true)}>
          {createElement(resolveFaqIcon(value, question), { className: 'h-4 w-4' })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900">
            {value ? FAQ_ICONS[value].label : 'Auto'}
          </span>
          {!value && <span className="block truncate text-[11px] text-gray-400">Picked from the question</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-gray-900/10 sm:max-w-xs"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === null}
            onClick={() => choose(null)}
            className={rowClass(value === null)}
          >
            <span className={`${badge(value === null)} relative`}>
              {createElement(resolveFaqIcon(null, question), { className: 'h-4 w-4' })}
              <Wand2 className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-amber-400 p-0.5 text-white" />
            </span>
            <span className="flex-1">
              Auto <span className="font-normal text-gray-400">· from the question</span>
            </span>
            {value === null && <Check className="h-4 w-4 text-indigo-600" />}
          </button>

          <div className="my-1 h-px bg-gray-100" />

          {Object.entries(FAQ_ICONS).map(([key, { label, Icon }]) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={value === key}
              onClick={() => choose(key)}
              className={rowClass(value === key)}
            >
              <span className={badge(value === key)}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{label}</span>
              {value === key && <Check className="h-4 w-4 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FaqRow({
  faq,
  index,
  total,
  canReorder,
  busy,
  onMove,
  onToggle,
  onDelete,
  onSave,
}: {
  faq: Faq
  index: number
  total: number
  canReorder: boolean
  busy: boolean
  onMove: (index: number, direction: -1 | 1) => void
  onToggle: (faq: Faq) => void
  onDelete: (faq: Faq) => void
  onSave: (faq: Faq, question: string, answer: string, icon: string | null) => Promise<boolean>
}) {
  const [question, setQuestion] = useState(faq.question)
  const [answer, setAnswer] = useState(faq.answer)
  const [icon, setIcon] = useState<string | null>(cleanFaqIcon(faq.icon))
  const [justSaved, setJustSaved] = useState(false)

  const isActive = faq.is_active !== false
  const dirty =
    question.trim() !== faq.question || answer.trim() !== faq.answer || icon !== cleanFaqIcon(faq.icon)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!dirty) return
    const ok = await onSave(faq, question, answer, icon)
    if (ok) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:items-start sm:gap-4 sm:p-4 border rounded-lg transition-colors ${
        isActive ? 'bg-gray-50' : 'bg-gray-100/70 border-dashed'
      } ${dirty ? 'border-amber-300 ring-1 ring-amber-200' : ''}`}
    >
      <div className="order-1 flex items-center gap-1 sm:flex-col sm:pt-1">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={!canReorder || busy || index === 0}
          title="Move up"
          className="rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-[11px] font-semibold text-gray-400">{index + 1}</span>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={!canReorder || busy || index === total - 1}
          title="Move down"
          className="rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className={`order-3 w-full min-w-0 space-y-3 sm:order-2 sm:w-auto sm:flex-1 ${isActive ? '' : 'opacity-60'}`}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
          placeholder="Question"
          required
        />
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Answer"
            required
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
            <span>
              {!isActive && <span className="font-semibold text-gray-500">Hidden on store · </span>}
              {dirty && <span className="font-semibold text-amber-600">Unsaved changes · </span>}
              {answer.length} characters
            </span>
            {justSaved && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
        </div>
        <IconPicker value={icon} question={question} onChange={setIcon} />
      </div>

      <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0 sm:flex-col sm:items-stretch">
        <button
          type="submit"
          disabled={busy || !dirty}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-white disabled:text-gray-400 disabled:ring-1 disabled:ring-inset disabled:ring-gray-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onToggle(faq)}
          disabled={busy}
          title={isActive ? 'Hide from store' : 'Show on store'}
          className="inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(faq)}
          disabled={busy}
          title="Delete"
          className="inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

export function GlobalFaqsEditor({
  initialFaqs,
  usage,
}: {
  initialFaqs: Faq[]
  usage?: { using: number; total: number }
}) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [isAdding, setIsAdding] = useState(false)
  const [newIcon, setNewIcon] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)

  function flash(type: Notice['type'], text: string) {
    setNotice({ type, text })
    setTimeout(() => setNotice((n) => (n?.text === text ? null : n)), 3500)
  }

  const searching = query.trim().length > 0
  const visibleFaqs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    )
  }, [faqs, query])

  const hiddenCount = faqs.filter((f) => f.is_active === false).length

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    const res = await addGlobalFaq(new FormData(form))
    if (res.success && res.data) {
      setFaqs((current) => [...current, res.data!])
      setIsAdding(false)
      setNewIcon(null)
      setNewQuestion('')
      flash('success', 'FAQ added. It is now live in the homepage FAQ section.')
    } else {
      flash('error', res.error || 'Could not add FAQ.')
    }
    setLoading(false)
  }

  async function handleDelete(faq: Faq) {
    if (!confirm(`Delete this FAQ?\n\n"${faq.question}"`)) return
    setLoading(true)
    const res = await deleteGlobalFaq(faq.id)
    if (res.success) {
      setFaqs((current) => current.filter((f) => f.id !== faq.id))
      flash('success', 'FAQ deleted.')
    } else {
      flash('error', res.error || 'Could not delete FAQ.')
    }
    setLoading(false)
  }

  async function handleSave(faq: Faq, question: string, answer: string, icon: string | null) {
    setLoading(true)
    const formData = new FormData()
    formData.set('question', question)
    formData.set('answer', answer)
    formData.set('icon', icon ?? '')
    const res = await updateGlobalFaq(faq.id, formData)
    setLoading(false)
    if (res.success && res.data) {
      setFaqs((current) => current.map((f) => (f.id === faq.id ? res.data! : f)))
      return true
    }
    flash('error', res.error || 'Could not save FAQ.')
    return false
  }

  async function handleToggle(faq: Faq) {
    const next = faq.is_active === false
    setLoading(true)
    const res = await setGlobalFaqActive(faq.id, next)
    if (res.success && res.data) {
      setFaqs((current) => current.map((f) => (f.id === faq.id ? res.data! : f)))
      flash('success', next ? 'FAQ is now visible on the store.' : 'FAQ hidden from the store.')
    } else {
      flash('error', res.error || 'Could not update visibility.')
    }
    setLoading(false)
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= faqs.length) return

    const previous = faqs
    const reordered = [...faqs]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const renumbered = reordered.map((f, i) => ({ ...f, display_order: i }))
    setFaqs(renumbered)

    const changed = renumbered
      .filter((f, i) => previous.find((p) => p.id === f.id)?.display_order !== i)
      .map((f) => ({ id: f.id, display_order: f.display_order }))

    setLoading(true)
    const res = await updateGlobalFaqOrders(changed)
    setLoading(false)
    if (!res.success) {
      setFaqs(previous)
      flash('error', res.error || 'Could not save the new order.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Global FAQs</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            These FAQs are shown in the <strong>FAQ section on the homepage</strong>. Each product&apos;s own FAQs
            (Products &rarr; Edit &rarr; FAQs) appear on its product page. A product can also show these after its own FAQs
            if &quot;Also show store-wide FAQs&quot; is switched on.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
        >
          <Plus className="-ml-0.5 h-5 w-5" />
          Add Global FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Total FAQs</p>
          <p className="text-xl font-bold text-gray-900">{faqs.length}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Live on store</p>
          <p className="text-xl font-bold text-emerald-600">{faqs.length - hiddenCount}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Hidden</p>
          <p className="text-xl font-bold text-gray-500">{hiddenCount}</p>
        </div>
        {usage && (
          <div className="rounded-lg border bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Products also showing these</p>
            <p className="text-xl font-bold text-gray-900">
              {usage.using}
              <span className="text-sm font-medium text-gray-400"> / {usage.total}</span>
            </p>
          </div>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-md px-4 py-2.5 text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              : 'bg-red-50 text-red-800 ring-1 ring-red-200'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      {faqs.length > 3 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or answers…"
            className={`${inputClass} !pl-9`}
          />
        </div>
      )}

      <div className="space-y-4">
        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="relative flex flex-col gap-4 p-3 sm:flex-row sm:items-start sm:p-4 border rounded-lg bg-white border-indigo-200"
          >
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Question</label>
                <input
                  type="text"
                  name="question"
                  autoFocus
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Answer</label>
                <textarea name="answer" rows={3} className={`mt-1 ${inputClass}`} required />
              </div>
              <input type="hidden" name="icon" value={newIcon ?? ''} />
              <IconPicker value={newIcon} question={newQuestion} onChange={setNewIcon} />
            </div>
            <div className="flex gap-2 sm:flex-col sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 sm:flex-none rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {searching && (
          <p className="text-xs text-gray-500">
            Showing {visibleFaqs.length} of {faqs.length}. Reordering is disabled while searching.
          </p>
        )}

        {visibleFaqs.map((faq) => (
          <FaqRow
            key={faq.id}
            faq={faq}
            index={faqs.findIndex((f) => f.id === faq.id)}
            total={faqs.length}
            canReorder={!searching}
            busy={loading}
            onMove={handleMove}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onSave={handleSave}
          />
        ))}

        {faqs.length === 0 && !isAdding && (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-gray-500">
            No global FAQs yet. Click <strong>Add Global FAQ</strong> to create the first one.
          </div>
        )}
        {faqs.length > 0 && visibleFaqs.length === 0 && (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-gray-500">
            No FAQs match &quot;{query}&quot;.
          </div>
        )}
      </div>
    </div>
  )
}
