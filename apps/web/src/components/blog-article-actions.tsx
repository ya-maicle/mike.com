'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Link, Pause, Play, Redo, Undo } from '@/components/ui/icons'
import { captureAnalyticsEvent } from '@/lib/analytics/client'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const

type PlaybackRate = (typeof PLAYBACK_RATES)[number]
type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

type BlogArticleActionsProps = {
  postSlug: string
  audioUrl: string
  durationSeconds: number
}

function formatTime(value: number) {
  const totalSeconds = Math.max(0, Math.round(value))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through to the selection-based copy path for older Safari contexts.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Copy failed.')
}

function FifteenSecondIcon({ direction }: { direction: 'back' | 'forward' }) {
  const Icon = direction === 'back' ? Undo : Redo
  return (
    <span aria-hidden className="relative block size-5">
      <Icon className="size-5" strokeWidth={1.7} />
      <span className="absolute inset-0 flex items-center justify-center pt-px text-[6px] font-medium leading-none">
        15
      </span>
    </span>
  )
}

export function BlogArticleActions({
  postSlug,
  audioUrl,
  durationSeconds,
}: BlogArticleActionsProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const startedRef = useRef(false)
  const milestonesRef = useRef(new Set<'25' | '50' | 'completed'>())
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds)
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1)
  const [copied, setCopied] = useState(false)

  useEffect(
    () => () => {
      audioRef.current?.pause()
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    },
    [],
  )

  function captureProgress(milestone: '25' | '50' | 'completed') {
    if (milestonesRef.current.has(milestone)) return
    milestonesRef.current.add(milestone)
    captureAnalyticsEvent('blog_audio_progressed', { post_slug: postSlug, milestone })
  }

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || status === 'loading') return

    if (!audio.paused) {
      audio.pause()
      return
    }

    if (!audio.src) {
      audio.src = audioUrl
      audio.load()
      setActivated(true)
      setStatus('loading')
    }

    try {
      await audio.play()
      setStatus('ready')
    } catch {
      setStatus('error')
      setPlaying(false)
    }
  }

  function skip(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), duration)
    setCurrentTime(audio.currentTime)
  }

  function changePlaybackRate() {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate)
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length]
    const audio = audioRef.current
    if (audio) audio.playbackRate = nextRate
    setPlaybackRate(nextRate)
    captureAnalyticsEvent('blog_audio_speed_changed', {
      post_slug: postSlug,
      playback_rate: nextRate,
    })
  }

  async function shareArticle() {
    const canonicalUrl = new URL(`/blog/${postSlug}`, SITE_CONFIG.url).toString()
    try {
      await copyText(canonicalUrl)
      captureAnalyticsEvent('blog_article_shared', { post_slug: postSlug, method: 'copy' })
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1_800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-[53px] w-full items-start justify-between border-t border-black/[0.04] pt-3 dark:border-white/10">
      <audio
        ref={audioRef}
        preload="none"
        onCanPlay={() => setStatus('ready')}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration))
            setDuration(event.currentTarget.duration)
        }}
        onPlay={() => {
          setPlaying(true)
          if (!startedRef.current) {
            startedRef.current = true
            captureAnalyticsEvent('blog_audio_started', { post_slug: postSlug })
          }
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const nextTime = event.currentTarget.currentTime
          setCurrentTime(nextTime)
          if (duration > 0 && nextTime / duration >= 0.25) captureProgress('25')
          if (duration > 0 && nextTime / duration >= 0.5) captureProgress('50')
        }}
        onEnded={() => {
          setPlaying(false)
          captureProgress('completed')
        }}
        onError={() => {
          if (activated) setStatus('error')
        }}
      />

      {!activated ? (
        <Button
          type="button"
          variant="ghost"
          className="group h-10 gap-3 p-0 hover:bg-transparent"
          onClick={togglePlayback}
          aria-label="Listen to article"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-accent">
            <Play className="size-4 fill-current" />
          </span>
          <span>Listen to article</span>
          <span aria-hidden className="h-4 border-l border-black/[0.04] dark:border-white/10" />
          <span className="tabular-nums text-muted-foreground">{formatTime(duration)}</span>
        </Button>
      ) : status === 'loading' ? (
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-3 p-0 hover:bg-transparent"
          disabled
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted">
            <span aria-hidden className="text-[10px] tracking-[1px]">
              •••
            </span>
          </span>
          <span>Loading…</span>
        </Button>
      ) : (
        <div className="flex h-10 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-8"
            onClick={togglePlayback}
            aria-label={playing ? 'Pause narration' : 'Play narration'}
          >
            {playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </Button>
          <span
            className={cn(
              'w-11 text-center text-sm tabular-nums text-muted-foreground',
              status === 'error' && 'w-auto px-1',
            )}
            role={status === 'error' ? 'status' : undefined}
          >
            {status === 'error' ? 'Unavailable' : formatTime(currentTime)}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => skip(-15)}
            aria-label="Go back 15 seconds"
          >
            <FifteenSecondIcon direction="back" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => skip(15)}
            aria-label="Go forward 15 seconds"
          >
            <FifteenSecondIcon direction="forward" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 min-w-9 px-1.5 text-sm tabular-nums"
            onClick={changePlaybackRate}
            aria-label={`Playback speed ${playbackRate} times. Change speed`}
          >
            {playbackRate}x
          </Button>
        </div>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-2 px-0 hover:bg-transparent"
          onClick={shareArticle}
        >
          <Link className="size-4" />
          Share
        </Button>
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'pointer-events-none absolute right-0 top-full z-10 mt-1 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md transition-opacity',
            copied ? 'opacity-100' : 'opacity-0',
          )}
        >
          {copied ? 'Copied' : ''}
        </div>
      </div>
    </div>
  )
}
