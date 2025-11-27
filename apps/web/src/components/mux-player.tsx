'use client'
import * as React from 'react'

function ensureMuxPlayerLoaded() {
  if (typeof window === 'undefined') return
  if (customElements && customElements.get && customElements.get('mux-player')) return

  const existing = document.querySelector('script[data-mux-player]') as HTMLScriptElement | null
  if (existing) return

  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player@2/dist/mux-player.js'
  script.async = true
  script.defer = true
  script.setAttribute('data-mux-player', 'true')
  document.head.appendChild(script)
}

export interface MuxPlayerProps {
  playbackId?: string
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  showControls?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MuxPlayer = React.forwardRef<any, MuxPlayerProps>(
  (
    {
      playbackId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      title,
      poster,
      className,
      autoPlay,
      muted,
      loop,
      showControls,
    },
    ref,
  ) => {
    const [fallback, setFallback] = React.useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalRef = React.useRef<any>(null)

    React.useImperativeHandle(ref, () => internalRef.current)

    React.useEffect(() => {
      ensureMuxPlayerLoaded()
      const check = () => {
        if (!(customElements && customElements.get && customElements.get('mux-player'))) {
          setFallback(true)
        }
      }
      const t = window.setTimeout(check, 2000)
      return () => window.clearTimeout(t)
    }, [])

    if (!playbackId) return null

    const posterUrl = poster || `https://image.mux.com/${playbackId}/thumbnail.jpg`
    if (fallback) {
      const mp4 = `https://stream.mux.com/${playbackId}/medium.mp4`
      return (
        <div className={className}>
          <video
            ref={internalRef}
            controls={showControls ?? !autoPlay}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            preload="none"
            poster={posterUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <source src={mp4} type="video/mp4" />
          </video>
        </div>
      )
    }

    return (
      <div className={className}>
        {/* @ts-expect-error - custom element provided by external script */}
        <mux-player
          ref={internalRef}
          playback-id={playbackId}
          stream-type="on-demand"
          poster={posterUrl}
          playsinline
          autoplay={autoPlay ? '' : undefined}
          muted={muted ? '' : undefined}
          loop={loop ? '' : undefined}
          style={
            {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              '--controls': showControls === false ? 'none' : undefined,
            } as React.CSSProperties
          }
        />
      </div>
    )
  },
)
MuxPlayer.displayName = 'MuxPlayer'
