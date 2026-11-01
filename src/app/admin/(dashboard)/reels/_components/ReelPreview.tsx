'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from 'lucide-react'
import { getReelPoster } from '@/lib/reels'

const formatTime = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/** Admin-side reel preview with play/pause, seek, mute and fullscreen controls. */
export function ReelPreview({ src, badge }: { src: string; badge: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Only one preview should play at a time.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlay = () => {
      document.querySelectorAll<HTMLVideoElement>('video[data-reel-preview]').forEach((v) => {
        if (v !== video) v.pause()
      })
    }
    video.addEventListener('play', onPlay)
    return () => video.removeEventListener('play', onPlay)
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const seek = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value
    setTime(value)
  }

  // Fullscreen the wrapper (not the <video>) so the 9:16 frame and our controls stay visible.
  const fullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    const frame = frameRef.current
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (frame?.requestFullscreen) void frame.requestFullscreen().catch(() => video?.webkitEnterFullscreen?.())
    else video?.webkitEnterFullscreen?.()
  }

  const btn =
    'flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80'

  return (
    <div
      ref={frameRef}
      className={
        isFullscreen
          ? 'flex h-full w-full items-center justify-center bg-black'
          : 'relative aspect-[9/16] overflow-hidden rounded-xl bg-stone-900'
      }
    >
      <div
        className={isFullscreen ? 'relative aspect-[9/16] h-full max-w-full overflow-hidden bg-stone-900' : 'contents'}
      >
        <video
          ref={videoRef}
          data-reel-preview
          src={src}
          poster={getReelPoster(src)}
          playsInline
          loop
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          className={`absolute inset-0 h-full w-full cursor-pointer ${isFullscreen ? 'object-contain' : 'object-cover'}`}
        />

        <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>

        {isFullscreen && (
          <button
            type="button"
            onClick={fullscreen}
            aria-label="Close fullscreen"
            className={`${btn} absolute right-2 top-1.5 h-8 w-8`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className={`${btn} absolute top-1.5 ${isFullscreen ? 'right-12 h-8 w-8' : 'right-1.5'}`}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Play"
            className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-lg transition-transform hover:scale-105"
          >
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1.5 pt-6">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="block h-1 w-full cursor-pointer accent-orange-500"
          />
          <div className="flex items-center justify-between gap-1 text-[10px] font-medium text-white">
            <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className={btn}>
              {playing ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-px h-3 w-3 fill-current" />}
            </button>
            <span className="tabular-nums">
              {formatTime(time)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={fullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className={btn}
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
