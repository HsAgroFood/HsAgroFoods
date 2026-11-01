'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Clapperboard, Play, Volume2, VolumeX, X } from 'lucide-react'
import { getReelPoster, type Reel } from '@/lib/reels'
import { HOME_DEFAULTS, type HomeContent } from '@/lib/homeContent'

type ReelItem = Pick<Reel, 'id' | 'video_url' | 'caption'>

/** A card in the carousel: plays muted only while it is mostly on screen. */
function ReelCard({ reel, onOpen }: { reel: ReelItem; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const poster = getReelPoster(reel.video_url)

  useEffect(() => {
    const video = videoRef.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.6 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={reel.caption ? `Watch reel: ${reel.caption}` : 'Watch reel'}
      className="group relative shrink-0 snap-start w-[78%] max-w-[340px] sm:max-w-none sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] aspect-[9/16] rounded-3xl overflow-hidden bg-[#0C2315] ring-1 ring-[#144D29]/10 shadow-xl shadow-[#14361F]/20 text-left cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:ring-[#F09819]/70 hover:shadow-[#F09819]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F09819]"
    >
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={poster}
        muted
        loop
        playsInline
        preload={poster ? 'none' : 'metadata'}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Video stays untinted; only a short fade behind the caption keeps the text readable. */}
      <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/40 transition-colors group-hover:bg-[#E07B0C] group-hover:border-[#E07B0C]">
        <Play className="ml-px h-3.5 w-3.5 fill-white" />
      </span>

      {reel.caption && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          <p className="absolute inset-x-0 bottom-0 p-4 font-serif text-sm sm:text-[15px] font-bold leading-snug text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] line-clamp-2">
            {reel.caption}
          </p>
        </>
      )}
    </button>
  )
}

/** Fullscreen player with sound, opened by tapping a card. */
function ReelViewer({
  reels,
  index,
  onChange,
  onClose,
}: {
  reels: ReelItem[]
  index: number
  onChange: (next: number) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const reel = reels[index]
  const hasPrev = index > 0
  const hasNext = index < reels.length - 1

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (next >= 0 && next < reels.length) onChange(next)
    },
    [index, reels.length, onChange]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [go, onClose])

  // New reel: start from the top. Sound starts on only if the browser allows it, otherwise fall back to muted.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setPaused(false)
    setProgress(0)
    video.currentTime = 0
    video.play().catch(() => {
      video.muted = true
      setMuted(true)
      video.play().catch(() => {})
    })
  }, [reel.id])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reel viewer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
          aria-label="Previous reel"
          className="absolute left-3 sm:left-8 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            go(1)
          }}
          aria-label="Next reel"
          className="absolute right-3 sm:right-8 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div
        className="relative aspect-[9/16] h-[88vh] max-h-[880px] max-w-[94vw] overflow-hidden rounded-3xl bg-black shadow-2xl"
        onClick={(e) => {
          e.stopPropagation()
          togglePlay()
        }}
      >
        <video
          ref={videoRef}
          key={reel.id}
          src={reel.video_url}
          poster={getReelPoster(reel.video_url)}
          muted={muted}
          playsInline
          autoPlay
          onEnded={() => (hasNext ? go(1) : videoRef.current?.play().catch(() => {}))}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            if (v.duration) setProgress(v.currentTime / v.duration)
          }}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-x-0 top-0 h-1 bg-white/20">
          <div className="h-full bg-[#F09819]" style={{ width: `${progress * 100}%` }} />
        </div>

        {paused && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white">
              <Play className="h-7 w-7 fill-white" />
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/85 to-transparent p-4 pt-16">
          <p className="flex-1 font-serif text-base font-bold leading-snug text-white">{reel.caption}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMuted((m) => !m)
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 cursor-pointer"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReelsSection({
  reels,
  content = HOME_DEFAULTS.reels,
}: {
  reels: ReelItem[]
  content?: HomeContent['reels']
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [edge, setEdge] = useState({ start: true, end: true })
  const [thumb, setThumb] = useState({ left: 0, width: 100 })
  const closeViewer = useCallback(() => setOpenIndex(null), [])

  const syncScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const width = Math.min(100, (track.clientWidth / track.scrollWidth) * 100)
    setEdge({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 })
    setThumb({ width, left: max > 0 ? (track.scrollLeft / max) * (100 - width) : 0 })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    syncScroll()
    track.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('resize', syncScroll)
    return () => {
      track.removeEventListener('scroll', syncScroll)
      window.removeEventListener('resize', syncScroll)
    }
  }, [syncScroll, reels.length])

  if (reels.length === 0) return null

  const canScroll = !(edge.start && edge.end)

  // Moves one full "page" (the cards currently in view) at a time.
  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const style = getComputedStyle(track)
    const content = track.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    track.scrollBy({ left: direction * (content + parseFloat(style.columnGap || '0')), behavior: 'smooth' })
  }

  return (
    <section id="reels" className="relative overflow-hidden bg-[#FFFDF8] py-12 sm:py-16 text-[#14361F]">
      {/* Ambient saffron + herbal glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 0%, rgba(240, 152, 25, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 92% 100%, rgba(20, 77, 41, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(240, 152, 25, 0.04) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-[1330px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE4D4] bg-[#EAF3EC] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#144D29] sm:text-xs">
              <Clapperboard className="h-3.5 w-3.5" />
              <span>{content.badge}</span>
            </div>
            <h2 className="mt-3 font-serif text-[#14361F] text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              {content.titleFirst} <span className="text-[#E07B0C]">{content.titleHighlight}</span>
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-[#5A453D] sm:mx-0 sm:text-base">
              {content.subtitle}
            </p>
          </div>

          {canScroll && (
            <div className="hidden gap-2 sm:flex">
              {([-1, 1] as const).map((dir) => {
                const disabled = dir === -1 ? edge.start : edge.end
                const Icon = dir === -1 ? ChevronLeft : ChevronRight
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => scrollByPage(dir)}
                    disabled={disabled}
                    aria-label={dir === -1 ? 'Previous reels' : 'Next reels'}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#144D29]/20 bg-white text-[#144D29] shadow-sm transition-colors hover:bg-[#E07B0C] hover:border-[#E07B0C] hover:text-white cursor-pointer disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#144D29]/20 disabled:hover:text-[#144D29]"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-pl-4 px-4 pb-6 pt-2 [justify-content:safe_center] sm:mx-0 sm:gap-5 sm:scroll-pl-0 sm:px-0"
        >
          {reels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>

        {canScroll && (
          <div className="mx-auto mt-2 h-1 w-40 overflow-hidden rounded-full bg-[#144D29]/10" aria-hidden="true">
            <div
              className="relative h-full rounded-full bg-[#E07B0C] transition-[left] duration-150"
              style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
            />
          </div>
        )}
      </div>

      {openIndex !== null && (
        <ReelViewer reels={reels} index={openIndex} onChange={setOpenIndex} onClose={closeViewer} />
      )}
    </section>
  )
}
