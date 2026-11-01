'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Search, Copy, Check, Download, Trash2 } from 'lucide-react'
import { deleteSubscriber } from '@/actions/newsletter'

export type Subscriber = {
  id: string
  email: string
  source: string
  created_at: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function SubscribersList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  const subscribers = initialSubscribers

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? subscribers.filter((s) => s.email.includes(q)) : subscribers
  }, [subscribers, query])

  const thisMonth = useMemo(() => {
    const now = new Date()
    return subscribers.filter((s) => {
      const d = new Date(s.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [subscribers])

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(filtered.map((s) => s.email).join(', '))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable
    }
  }

  function downloadCsv() {
    const rows = [['email', 'subscribed_on'], ...filtered.map((s) => [s.email, new Date(s.created_at).toISOString().slice(0, 10)])]
    const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete(s: Subscriber) {
    if (!confirm(`Remove ${s.email} from the list?`)) return
    startTransition(async () => {
      const res = await deleteSubscriber(s.id)
      if (!res.success) {
        alert(res.error || 'Could not remove this subscriber.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="rounded-xl border border-stone-200/80 bg-white px-4 py-3">
          <p className="text-xs text-stone-500">Total subscribers</p>
          <p className="text-xl font-bold text-stone-900">{subscribers.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white px-4 py-3">
          <p className="text-xs text-stone-500">Joined this month</p>
          <p className="text-xl font-bold text-stone-900">{thisMonth}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emails…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>
        <button
          type="button"
          onClick={copyAll}
          disabled={filtered.length === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 cursor-pointer sm:flex-none"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : `Copy ${query ? 'shown' : 'all'} emails`}
        </button>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 cursor-pointer sm:flex-none"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">{subscribers.length === 0 ? 'No subscribers yet' : 'No emails match your search'}</p>
            {subscribers.length === 0 && (
              <p className="mt-1 text-xs text-stone-400">Emails entered in the website footer will appear here.</p>
            )}
          </div>
        ) : (
          <>
            <ul className="divide-y divide-stone-100 md:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{s.email}</p>
                    <p className="text-xs text-stone-400" suppressHydrationWarning>
                      Joined {formatDate(s.created_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    disabled={isPending}
                    title="Remove"
                    className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-stone-50/60 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Subscribed on</th>
                  <th className="px-5 py-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3 text-xs text-stone-400">{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-stone-900">{s.email}</td>
                    <td className="px-5 py-3 text-sm text-stone-500" suppressHydrationWarning>
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        disabled={isPending}
                        title="Remove"
                        className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
