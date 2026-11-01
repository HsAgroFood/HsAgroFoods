'use client'

import { useState } from 'react'
import { LayoutGrid, Table2 } from 'lucide-react'

export type ViewMode = 'auto' | 'grid' | 'table'

/**
 * Grid / table layout for admin lists.
 *  - auto (default): cards on phones, table from tablet (md) up
 *  - grid / table:   the admin's own choice, on every screen size
 *
 * Put `cardsClass` on the cards container and `tableClass` on the table's wrapper.
 */
export function useViewMode() {
  const [view, setView] = useState<ViewMode>('auto')

  const cardsClass =
    view === 'table' ? 'hidden' : `grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${view === 'auto' ? 'md:hidden' : ''}`
  const tableClass = view === 'grid' ? 'hidden' : view === 'auto' ? 'hidden md:block' : 'block'

  return { view, setView, cardsClass, tableClass }
}

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (mode: 'grid' | 'table') => void }) {
  const button = (mode: 'grid' | 'table', label: string, Icon: typeof LayoutGrid) => {
    // In auto mode the highlighted button follows the screen size: grid on phones, table from md up
    const active =
      view === mode
        ? 'bg-white text-stone-900 shadow-sm'
        : view === 'auto'
          ? mode === 'grid'
            ? 'bg-white text-stone-900 shadow-sm md:bg-transparent md:text-stone-500 md:shadow-none'
            : 'text-stone-500 md:bg-white md:text-stone-900 md:shadow-sm'
          : 'text-stone-500 hover:text-stone-800'

    return (
      <button
        type="button"
        onClick={() => onChange(mode)}
        aria-pressed={view === mode}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${active}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    )
  }

  return (
    <div className="inline-flex shrink-0 rounded-xl bg-stone-100 p-1" role="group" aria-label="Layout">
      {button('grid', 'Grid', LayoutGrid)}
      {button('table', 'Table', Table2)}
    </div>
  )
}
