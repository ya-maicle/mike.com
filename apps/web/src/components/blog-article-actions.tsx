'use client'

import { useEffect, useRef, useState } from 'react'

import { BlogArticleShareControls } from '@/components/blog-article-share-controls'
import { Button } from '@/components/ui/button'
import {
  AudioForward15Icon,
  AudioPauseIcon,
  AudioPlayIcon,
  AudioRewind15Icon,
} from '@/components/ui/icon'
import { captureAnalyticsEvent } from '@/lib/analytics/client'
import { cn } from '@/lib/utils'

const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const

type PlaybackRate = (typeof PLAYBACK_RATES)[number]
type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

type BlogArticleActionsProps = {
  postSlug: string
  shareText: string
  audioUrl?: string
  durationSeconds?: number
}

function formatTime(value: number) {
  const totalSeconds = Math.max(0, Math.round(value))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function BlogArticleActions({
  postSlug,
  shareText,
  audioUrl,
  durationSeconds,
}: BlogArticleActionsProps) {
  const hasNarration = Boolean(audioUrl && durationSeconds && durationSeconds > 0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const startedRef = useRef(false)
  const milestonesRef = useRef(new Set<'25' | '50' | 'completed'>())
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1)

  useEffect(
    () => () => {
      audioRef.current?.pause()
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
    if (!audio || !audioUrl || status === 'loading') return

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

  return (
    <div className="flex min-h-[53px] w-full items-center justify-between border-t border-black/[0.04] pt-3 dark:border-white/10">
      {hasNarration ? (
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
      ) : null}

      {hasNarration && !activated ? (
        <Button
          type="button"
          variant="ghost"
          className="group h-10 gap-3 p-0 hover:bg-transparent"
          onClick={togglePlayback}
          aria-label="Listen to article"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-accent">
            <AudioPlayIcon className="!h-auto !w-[11px] !translate-y-0" />
          </span>
          <span>Listen to article</span>
          <span aria-hidden className="h-4 border-l border-black/[0.04] dark:border-white/10" />
          <span className="tabular-nums text-muted-foreground">{formatTime(duration)}</span>
        </Button>
      ) : hasNarration && status === 'loading' ? (
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
      ) : hasNarration ? (
        <div className="relative flex h-8">
          <div className="flex items-center">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-8 p-0 pb-0 [&_svg]:!translate-y-0"
              onClick={togglePlayback}
              aria-label={playing ? 'Pause narration' : 'Play narration'}
            >
              {playing ? (
                <AudioPauseIcon className="size-[unset] !h-auto !w-[10px]" />
              ) : (
                <AudioPlayIcon className="size-[unset] !h-auto !w-[11px]" />
              )}
            </Button>
            <span
              className={cn(
                'shrink grow pl-3 text-base font-medium leading-none tabular-nums',
                status === 'error' && 'text-muted-foreground',
              )}
              role={status === 'error' ? 'status' : undefined}
            >
              {status === 'error' ? 'Unavailable' : formatTime(currentTime)}
            </span>
          </div>
          <div className="relative ml-3 flex gap-3 pl-3">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 my-auto block h-5 w-px bg-black/[0.04] dark:bg-white/10"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-4 min-h-0 p-0 hover:bg-transparent hover:opacity-60 focus-visible:ring-0 [&_svg]:!translate-y-0"
                onClick={() => skip(-15)}
                aria-label="Go back 15 seconds"
              >
                <AudioRewind15Icon />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-4 min-h-0 p-0 hover:bg-transparent hover:opacity-60 focus-visible:ring-0 [&_svg]:!translate-y-0"
                onClick={() => skip(15)}
                aria-label="Go forward 15 seconds"
              >
                <AudioForward15Icon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-[26px] min-w-12 rounded-[10px] border border-foreground/80 bg-transparent px-2 py-0.5 text-base leading-5 hover:bg-transparent hover:opacity-60"
                onClick={changePlaybackRate}
                aria-label={`Playback speed ${playbackRate} times. Change speed`}
              >
                {playbackRate}x
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <BlogArticleShareControls postSlug={postSlug} shareText={shareText} />
    </div>
  )
}
