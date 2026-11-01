'use client'

import Image from 'next/image'
import { Image as ImageIcon, Loader2, Monitor, RefreshCw, Smartphone, Trash2 } from 'lucide-react'
import { ImageKitUpload } from '@/components/admin/ImageKitUpload'
import { getDesktopSlideUrl, getMobileSlideUrl } from '@/lib/imageUtils'

/**
 * Two independent image slots for a hero slide:
 *  - Desktop (16:9) -> image_url
 *  - Phone (4:5)    -> image_mobile_url (optional; empty = auto-crop of the desktop image)
 */
export function SlideImagesField({
  desktopUrl,
  mobileUrl,
  disabled,
  onDesktopChange,
  onMobileChange,
}: {
  desktopUrl: string
  mobileUrl?: string | null
  disabled?: boolean
  onDesktopChange: (url: string) => void
  onMobileChange: (url: string | null) => void
}) {
  const hasCustomMobile = Boolean(mobileUrl && mobileUrl.trim() !== '')
  const mobilePreview = getMobileSlideUrl(desktopUrl, mobileUrl || undefined)

  return (
    <div className="space-y-5">
      {/* Desktop image */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" />
          Desktop image <span className="font-semibold normal-case text-stone-400">(16:9)</span>
        </div>
        <div className="relative aspect-video w-full rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
          {desktopUrl ? (
            <Image src={getDesktopSlideUrl(desktopUrl)} alt="Desktop slide" fill className="object-cover" />
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-1" />
              <span className="text-xs text-stone-500">No desktop image</span>
            </div>
          )}
        </div>
        <ImageKitUpload folder="/hero-slides" multiple={false} onSuccess={(res) => onDesktopChange(res.url)}>
          {({ open, isUploading }) => (
            <button
              type="button"
              onClick={open}
              disabled={isUploading || disabled}
              className="w-full py-2 px-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {desktopUrl ? 'Replace desktop image' : 'Upload desktop image'}
            </button>
          )}
        </ImageKitUpload>
        <p className="text-[11px] text-stone-400">Recommended 1920×1080 (landscape).</p>
      </div>

      {/* Phone image */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5" />
          Phone image <span className="font-semibold normal-case text-stone-400">(4:5)</span>
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal ${
              hasCustomMobile ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {hasCustomMobile ? 'Custom' : 'Auto-crop'}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="relative aspect-[4/5] w-24 shrink-0 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
            {mobilePreview ? (
              <Image src={mobilePreview} alt="Phone slide" fill className="object-cover" />
            ) : (
              <Smartphone className="w-6 h-6 text-stone-300" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <ImageKitUpload folder="/hero-slides/mobile" multiple={false} onSuccess={(res) => onMobileChange(res.url)}>
              {({ open, isUploading }) => (
                <button
                  type="button"
                  onClick={open}
                  disabled={isUploading || disabled}
                  className="w-full py-2 px-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {hasCustomMobile ? 'Replace phone image' : 'Upload phone image'}
                </button>
              )}
            </ImageKitUpload>
            {hasCustomMobile && (
              <button
                type="button"
                onClick={() => onMobileChange(null)}
                disabled={disabled}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove (use auto-crop)
              </button>
            )}
            <p className="text-[11px] text-stone-400">Recommended 1080×1350 (portrait). Optional.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
