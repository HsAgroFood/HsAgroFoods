'use client'

import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { markInquiryAsRead, deleteInquiry } from '@/actions/admin/inquiries'
import { Trash2, CheckCircle, Mail, MessageSquare, Eye, X, Phone } from 'lucide-react'

export function InquiriesList({ initialInquiries }: { initialInquiries: any[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const viewing = inquiries.find((inq) => inq.id === viewingId) || null

  useEffect(() => {
    if (!viewingId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewingId])

  const displayName = (inq: any) =>
    inq.name || `${inq.first_name || ''} ${inq.last_name || ''}`.trim() || 'Anonymous Customer'

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markInquiryAsRead(id)
      if (res.success) {
        setInquiries((current) => current.map(inq => inq.id === id ? { ...inq, is_resolved: true } : inq))
      } else {
        alert(res.error || 'Failed to mark inquiry as read')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    startTransition(async () => {
      const res = await deleteInquiry(id)
      if (res.success) {
        setInquiries((current) => current.filter(inq => inq.id !== id))
        if (expandedId === id) setExpandedId(null)
      } else {
        alert(res.error || 'Failed to delete inquiry')
      }
    })
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <Mail className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-900">No inquiries yet</h3>
        <p className="text-sm text-stone-500 mt-1">When customers contact you, their messages will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        const isUnread = !inquiry.is_resolved
        const isExpanded = expandedId === inquiry.id

        return (
          <div 
            key={inquiry.id} 
            className={`bg-white rounded-2xl border transition-all overflow-hidden ${
              isUnread ? 'border-orange-200 shadow-sm' : 'border-stone-200'
            }`}
          >
            {/* Header Row */}
            <div 
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 cursor-pointer hover:bg-stone-50 transition-colors ${
                isUnread ? 'bg-orange-50/30' : ''
              }`}
              onClick={() => {
                setExpandedId(isExpanded ? null : inquiry.id)
                if (isUnread) handleMarkAsRead(inquiry.id)
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`shrink-0 p-2 rounded-full ${isUnread ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400'}`}>
                  {isUnread ? <MessageSquare className="w-5 h-5 fill-current" /> : <Mail className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <p className={`text-sm truncate min-w-0 ${isUnread ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                      {inquiry.name || `${inquiry.first_name || ''} ${inquiry.last_name || ''}`.trim() || 'Anonymous Customer'}
                    </p>
                    {isUnread && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${isUnread ? 'font-medium text-stone-800' : 'text-stone-500'}`}>
                    {inquiry.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4 pl-[3.25rem] sm:ml-4 sm:justify-end sm:pl-0">
                <span suppressHydrationWarning className="text-xs text-stone-400 font-medium whitespace-nowrap">
                  {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setViewingId(inquiry.id)
                      if (isUnread) handleMarkAsRead(inquiry.id)
                    }}
                    className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="View full message"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(inquiry.id)}
                      disabled={isPending}
                      className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    disabled={isPending}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50/50">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Message</h4>
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 text-sm text-stone-700 whitespace-pre-wrap break-words leading-relaxed shadow-sm">
                  {inquiry.message}
                </div>
                <div className="mt-4 flex sm:justify-end">
                  <a 
                    href={`mailto:${inquiry.email}`}
                    className="inline-flex w-full items-center justify-center px-4 py-2.5 sm:w-auto sm:py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {viewing &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-0 text-left sm:items-center sm:p-4"
            onClick={() => setViewingId(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Full message"
          >
            <div
              className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-4 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-stone-900">{displayName(viewing)}</h3>
                  <p suppressHydrationWarning className="text-xs text-stone-400">
                    {new Date(viewing.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingId(null)}
                  className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
                <div className="space-y-2 text-sm">
                  <a href={`mailto:${viewing.email}`} className="flex items-center gap-2 break-all font-medium text-stone-800 hover:text-orange-600">
                    <Mail className="h-4 w-4 shrink-0 text-stone-400" />
                    {viewing.email}
                  </a>
                  {viewing.phone && (
                    <a href={`tel:${viewing.phone}`} className="flex items-center gap-2 font-medium text-stone-800 hover:text-orange-600">
                      <Phone className="h-4 w-4 shrink-0 text-stone-400" />
                      {viewing.phone}
                    </a>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">Message</h4>
                  <div className="whitespace-pre-wrap break-words rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                    {viewing.message}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-100 p-4 sm:flex-row sm:justify-end">
                <a
                  href={`mailto:${viewing.email}`}
                  className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 sm:order-2"
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setViewingId(null)
                    handleDelete(viewing.id)
                  }}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer sm:order-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
