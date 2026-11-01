'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Type } from 'lucide-react'
import { updateHeroShowText } from '@/actions/admin/hero'

export function ShowTextToggle({ initialShowText }: { initialShowText: boolean }) {
  const router = useRouter()
  const [showText, setShowText] = useState(initialShowText)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !showText
    setShowText(next)
    setError(null)

    startTransition(async () => {
      const result = await updateHeroShowText(next)
      if (result.success) {
        router.refresh()
      } else {
        setShowText(!next)
        setError(result.error || 'Failed to update hero text setting.')
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Type className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-stone-900">Show text on hero</p>
            <p className="mt-0.5 text-xs text-stone-500">
              {showText
                ? 'Headline, subtitle, buttons and trust badges are shown over the slide images.'
                : 'Text is hidden. Visitors see only the slide images.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showText}
          aria-label="Show text on hero"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-70 ${
            showText ? 'bg-emerald-500' : 'bg-stone-300'
          }`}
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
              showText ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin text-stone-500" />}
          </span>
        </button>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
