'use client'

import * as React from 'react'
import MuxPlayerReact from '@mux/mux-player-react/lazy'
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react'
import { useCookiePreferences } from '@/components/providers/cookie-preferences-provider'
import { getMuxPosterUrl } from '@/lib/mux-poster'
import { useCaseStudyAnalytics } from '@/components/case-study-analytics'

export interface MuxPlaybackTokens {
  playback?: string
  thumbnail?: string
  storyboard?: string
}

export type MuxMaxResolution = '720p' | '1080p' | '1440p' | '2160p'
export type MuxMinResolution = '480p' | '540p' | '720p' | '1080p' | '1440p' | '2160p'

export interface MuxContentPlayerProps {
  playbackId: string
  /** Pass the media ref through next/dynamic without attaching it to the loader. */
  playerRef?: React.Ref<HTMLVideoElement | null>
  /** Stable Sanity block key used for privacy-safe content analytics. */
  contentId?: string
  /** Required for assets with a signed playback policy; omit for public assets. */
  tokens?: MuxPlaybackTokens
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  objectFit?: 'cover' | 'contain'
  maxResolution?: MuxMaxResolution
  /**
   * ABR floor — keeps Mux from starting on a soft low rendition. Only set this
   * on decorative loops; the gated content player must stay adaptive so it
   * never stalls behind user-initiated playback.
   */
  minResolution?: MuxMinResolution
}

export const MuxContentPlayer = React.forwardRef<HTMLVideoElement | null, MuxContentPlayerProps>(
  function MuxContentPlayer(
    {
      playbackId,
      playerRef,
      contentId,
      tokens,
      title,
      poster,
      className,
      autoPlay = false,
      muted = false,
      loop = false,
      controls = true,
      // Reason: content videos render in the 1376px canvas = 2752 device px on
      // retina; a 1440p ceiling leaves them permanently soft there.
      maxResolution = '2160p',
      objectFit = 'cover',
      minResolution,
    },
    ref,
  ) {
    const { analyticsEnabled } = useCookiePreferences()
    const caseStudyAnalytics = useCaseStudyAnalytics()
    const milestonesRef = React.useRef(new Set<string>())

    React.useEffect(() => {
      milestonesRef.current.clear()
    }, [contentId, playbackId])

    const trackMilestone = React.useCallback(
      (milestone: 'started' | '25' | '50' | 'completed') => {
        if (!analyticsEnabled || !controls || !contentId || !caseStudyAnalytics) return
        if (milestonesRef.current.has(milestone)) return
        milestonesRef.current.add(milestone)
        caseStudyAnalytics.trackVideoProgress(contentId, milestone)
      },
      [analyticsEnabled, caseStudyAnalytics, contentId, controls],
    )

    const handleTimeUpdate = React.useCallback(
      (event: CustomEvent) => {
        const { currentTime, duration } = event.currentTarget as MuxPlayerRefAttributes
        if (!Number.isFinite(duration) || duration <= 0) return
        const progress = currentTime / duration
        if (progress >= 0.5) trackMilestone('50')
        else if (progress >= 0.25) trackMilestone('25')
      },
      [trackMilestone],
    )

    // Reason: signed thumbnail URLs reject loose query params — render params
    // (fit_mode) are embedded in the token claims instead.
    const posterUrl = getMuxPosterUrl({
      playbackId,
      poster,
      thumbnailToken: tokens?.thumbnail,
    })

    return (
      <MuxPlayerReact
        key={analyticsEnabled ? 'analytics-enabled' : 'analytics-disabled'}
        ref={(playerRef ?? ref) as React.Ref<MuxPlayerRefAttributes>}
        disableCookies
        disableTracking={!analyticsEnabled}
        playbackId={playbackId}
        tokens={tokens}
        poster={posterUrl}
        title={title}
        streamType="on-demand"
        maxResolution={maxResolution}
        minResolution={minResolution}
        autoPlay={autoPlay ? (muted ? 'muted' : true) : false}
        muted={muted}
        loop={loop}
        nohotkeys={!controls}
        onPlay={() => trackMilestone('started')}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => trackMilestone('completed')}
        playsInline
        data-controls={controls ? '' : undefined}
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          aspectRatio: 'auto',
          '--controls': controls ? undefined : 'none',
          '--media-object-fit': objectFit,
        }}
      />
    )
  },
)

// Storybook's dynamic-import transform requires a default component export.
export default MuxContentPlayer
