'use client'

import { useState, useTransition } from 'react'
import { updateHeroTextMode } from '@/actions/admin/hero'
import { Loader2 } from 'lucide-react'

export function TextModeToggle({ currentMode }: { currentMode: 'global' | 'per_slide' }) {
  const [mode, setMode] = useState(currentMode)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (newMode: 'global' | 'per_slide') => {
    if (newMode === mode) return
    setMode(newMode)

    startTransition(async () => {
      const result = await updateHeroTextMode(newMode)
      if (!result.success) {
        alert(result.error || 'Failed to update text mode')
        setMode(mode) // Revert on error
      }
    })
  }

  return (
    <div className="flex w-full items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200 sm:w-auto">
      <button
        onClick={() => handleToggle('global')}
        disabled={isPending}
        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          mode === 'global' 
            ? 'bg-white text-stone-900 shadow-sm' 
            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
        }`}
      >
        Global Text
      </button>
      
      <button
        onClick={() => handleToggle('per_slide')}
        disabled={isPending}
        className={`flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
          mode === 'per_slide' 
            ? 'bg-white text-stone-900 shadow-sm' 
            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
        }`}
      >
        Per-Slide Text
        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
      </button>
    </div>
  )
}
