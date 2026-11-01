'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Eye, Loader2, RotateCcw } from 'lucide-react'
import { updateHeroBannerVisibility } from '@/actions/admin/hero'
import { DEFAULT_BANNER_VISIBILITY, getHeroOverlays } from '@/lib/heroBanner'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function BannerVisibilityControl({
  initialValue,
  previewImage,
}: {
  initialValue: number
  previewImage?: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // Saves shortly after the slider stops moving, so dragging does not fire a request per step.
  const change = (next: number) => {
    setValue(next)
    setState('saving')
    setError(null)
    if (timer.current) clearTimeout(timer.current)

    timer.current = setTimeout(async () => {
      const result = await updateHeroBannerVisibility(next)
      if (result.success) {
        setState('saved')
        router.refresh()
      } else {
        setState('error')
        setError(result.error || 'Failed to save banner visibility.')
      }
    }, 500)
  }

  const overlay = getHeroOverlays(value).desktop

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Eye className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-stone-900">Banner visibility</p>
            <p className="mt-0.5 text-xs text-stone-500">
              Lower = darker banner, text is easier to read. Higher = brighter banner, the image shows more clearly.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold tabular-nums text-stone-700">
          {value}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
        <div className="space-y-2 lg:col-span-7">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={value}
            onChange={(e) => change(Number(e.target.value))}
            aria-label="Banner visibility"
            className="block h-2 w-full cursor-pointer accent-orange-500"
          />
          <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
            <span>Darker</span>
            <span>Standard</span>
            <span>Brighter</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => change(DEFAULT_BANNER_VISIBILITY)}
              disabled={value === DEFAULT_BANNER_VISIBILITY}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:cursor-default disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to standard
            </button>

            <span className="inline-flex h-4 items-center gap-1 text-xs font-semibold">
              {state === 'saving' && (
                <span className="inline-flex items-center gap-1 text-stone-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </span>
              )}
              {state === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
              {state === 'error' && <span className="text-red-600">{error}</span>}
            </span>
          </div>
        </div>

        {/* Live preview of the first slide with the chosen overlay */}
        <div className="lg:col-span-5">
          <div
            className="relative aspect-[16/9] overflow-hidden rounded-xl bg-stone-900 bg-cover bg-right"
            style={previewImage ? { backgroundImage: `url("${previewImage}")` } : undefined}
          >
            <div className="absolute inset-0" style={{ backgroundImage: overlay }} />
            <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center gap-1.5 p-3">
              <span className="h-2 w-4/5 rounded-full bg-white/90" />
              <span className="h-2 w-3/5 rounded-full bg-white/90" />
              <span className="mt-1 h-1.5 w-11/12 rounded-full bg-white/60" />
              <span className="h-1.5 w-2/3 rounded-full bg-white/60" />
              <span className="mt-1.5 h-4 w-16 rounded-[3px] bg-orange-500" />
            </div>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-stone-400">Preview (desktop)</p>
        </div>
      </div>
    </div>
  )
}
