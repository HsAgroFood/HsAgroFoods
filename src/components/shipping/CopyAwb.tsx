'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

// AWB number with a one-click copy button
export default function CopyAwb({ awb }: { awb: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(awb)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#E8DFD5] bg-white px-2 py-1">
      <span className="font-mono text-xs sm:text-[13px] font-bold tracking-wide text-[#14361F] break-all">{awb}</span>
      <button
        type="button"
        onClick={copy}
        title={copied ? 'Copied' : 'Copy AWB'}
        aria-label="Copy AWB number"
        className="rounded p-0.5 text-[#8C7567] hover:text-[#E07B0C] transition-colors cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  )
}
