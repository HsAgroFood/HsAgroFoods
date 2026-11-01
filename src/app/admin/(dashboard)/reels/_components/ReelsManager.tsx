'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  Film,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { addReel, deleteReel, moveReel, toggleReel, updateReel } from '@/actions/admin/reels'
import { ImageKitVideoUpload } from '@/components/admin/ImageKitVideoUpload'
import { ReelPreview } from './ReelPreview'
import { getReelPoster, MAX_CAPTION_LENGTH, MAX_REELS, MAX_VIDEO_MB, type Reel } from '@/lib/reels'

const inputClass =
  'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900 resize-none'

export function ReelsManager({ initialReels }: { initialReels: Reel[] }) {
  const router = useRouter()
  const [reels, setReels] = useState<Reel[]>(initialReels)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState('')
  const [newCaption, setNewCaption] = useState('')

  const isFull = reels.length >= MAX_REELS
  const activeCount = reels.filter((r) => r.is_active).length

  const run = (action: () => Promise<{ success: boolean; error?: string }>, onDone?: () => void) => {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if (res.success) {
        onDone?.()
        router.refresh()
      } else {
        setError(res.error || 'Something went wrong.')
      }
    })
  }

  const patch = (id: string, changes: Partial<Reel>) =>
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)))

  // The new reel is added to the on-screen list straight from the server response, so no refresh is needed.
  const handleAdd = () => {
    setError(null)
    startTransition(async () => {
      const res = await addReel(newVideo, newCaption)
      if (res.success) {
        setReels((prev) => [...prev, res.reel])
        setNewVideo('')
        setNewCaption('')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const handleSave = (reel: Reel) =>
    run(
      () => updateReel(reel.id, { caption: reel.caption, video_url: reel.video_url }),
      () => {
        setSavedId(reel.id)
        setTimeout(() => setSavedId(null), 2500)
      }
    )

  const handleToggle = (reel: Reel) =>
    run(
      () => toggleReel(reel.id, !reel.is_active),
      () => patch(reel.id, { is_active: !reel.is_active })
    )

  const handleDelete = (reel: Reel) => {
    if (!confirm('Delete this reel? This cannot be undone.')) return
    run(
      () => deleteReel(reel.id),
      () => setReels((prev) => prev.filter((r) => r.id !== reel.id))
    )
  }

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1
    if (target < 0 || target >= reels.length) return
    const id = reels[index].id
    run(
      () => moveReel(id, direction),
      () =>
        setReels((prev) => {
          const next = [...prev]
          ;[next[index], next[target]] = [next[target], next[index]]
          return next
        })
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary + capacity */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-stone-900">
            Reels ({reels.length}/{MAX_REELS})
          </h2>
        </div>
        <p className="text-sm text-stone-500 mt-1">
          {activeCount} live on the homepage. Max {MAX_VIDEO_MB}MB per video. Videos play muted on the storefront; visitors tap a reel to watch it with sound.
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${(reels.length / MAX_REELS) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add new reel */}
      {isFull ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You have reached the limit of {MAX_REELS} reels. Delete one to add a new video.
        </div>
      ) : (
        <div className="bg-orange-50/50 rounded-2xl border-2 border-orange-200 p-4 sm:p-6">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-orange-500" />
            Add a new reel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-5">
            <ImageKitVideoUpload onSuccess={(res) => setNewVideo(res.url)}>
              {({ open, isUploading, progress, error: uploadError }) => (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={open}
                    disabled={isUploading || isPending}
                    className="relative aspect-[9/16] w-full max-w-[160px] rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-300 hover:border-orange-400 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-wait"
                  >
                    {newVideo ? (
                      <video
                        src={newVideo}
                        poster={getReelPoster(newVideo)}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-1.5 px-2 text-center text-xs font-semibold text-stone-500">
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : <UploadCloud className="w-6 h-6 text-orange-500" />}
                        {isUploading ? `Uploading ${progress}%` : 'Upload video'}
                      </span>
                    )}
                    {isUploading && newVideo && (
                      <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                        {progress}%
                      </span>
                    )}
                  </button>
                  {newVideo && !isUploading && (
                    <button type="button" onClick={open} className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Replace video
                    </button>
                  )}
                  {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                  <p className="text-[11px] text-stone-400">Vertical 9:16 · MP4 · <strong>max {MAX_VIDEO_MB}MB</strong>. Under 30 sec and ~15MB loads fastest.</p>
                </div>
              )}
            </ImageKitVideoUpload>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Caption</label>
                <textarea
                  rows={3}
                  maxLength={MAX_CAPTION_LENGTH}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Watch how our turmeric is cold-ground fresh"
                  className={inputClass}
                />
                <p className="mt-1 text-right text-[11px] text-stone-400">
                  {newCaption.length}/{MAX_CAPTION_LENGTH}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || !newVideo}
                className="w-full sm:w-auto justify-center px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing reels */}
      {reels.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-stone-200 rounded-2xl">
          <Film className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No reels yet</h3>
          <p className="text-sm text-stone-500 mt-1">Upload your first video above. The reels section stays hidden on the homepage until one is live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 transition-opacity ${
                reel.is_active ? 'border-stone-200' : 'border-stone-200/60 opacity-70'
              }`}
            >
              <div className="w-36 shrink-0 space-y-2">
                <ReelPreview src={reel.video_url} badge={`#${index + 1}`} />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'left')}
                    disabled={isPending || index === 0}
                    title="Move earlier"
                    className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'right')}
                    disabled={isPending || index === reels.length - 1}
                    title="Move later"
                    className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      reel.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {reel.is_active ? 'Live' : 'Hidden'}
                  </span>
                  <div className="flex items-center gap-1">
                    <label className="relative inline-flex items-center cursor-pointer" title={reel.is_active ? 'Hide from homepage' : 'Show on homepage'}>
                      <input type="checkbox" className="sr-only peer" checked={reel.is_active} onChange={() => handleToggle(reel)} disabled={isPending} />
                      <div className="w-9 h-5 bg-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDelete(reel)}
                      disabled={isPending}
                      title="Delete reel"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Caption</label>
                  <textarea
                    rows={3}
                    maxLength={MAX_CAPTION_LENGTH}
                    value={reel.caption}
                    onChange={(e) => patch(reel.id, { caption: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 mt-auto">
                  {savedId === reel.id ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Saved
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => handleSave(reel)}
                    disabled={isPending}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
