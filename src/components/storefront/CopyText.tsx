'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

// A value (payment id, order id...) with a one-click copy button
export default function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span className="font-mono text-xs sm:text-[13px] font-bold text-[#14361F] break-all">{value}</span>
      <button
        type="button"
        onClick={copy}
        title={copied ? 'Copied' : 'Copy'}
        aria-label={`Copy ${value}`}
        className="shrink-0 rounded p-0.5 text-[#8C7567] hover:text-[#E07B0C] transition-colors cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  )
}
