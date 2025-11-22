'use client'
import * as React from 'react'

function ensureMuxPlayerLoaded() {
  if (typeof window === 'undefined') return
  // If the custom element already exists, skip
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

export function MuxPlayer({
  playbackId,
  title,
  poster,
  className,
}: {
  playbackId?: string
  title?: string
  poster?: string
  className?: string
}) {
  const [fallback, setFallback] = React.useState(false)
  React.useEffect(() => {
    ensureMuxPlayerLoaded()
    const check = () => {
      // If custom element still not registered after a short delay, show native fallback
      if (!(customElements && customElements.get && customElements.get('mux-player'))) {
        setFallback(true)
      }
    }
    const t = window.setTimeout(check, 2000)
    return () => window.clearTimeout(t)
  }, [])

  if (!playbackId) return null

  // Render the custom element. It will upgrade when the script loads.
  const posterUrl = poster || `https://image.mux.com/${playbackId}/thumbnail.jpg`
  if (fallback) {
    const mp4 = `https://stream.mux.com/${playbackId}/medium.mp4`
    return (
      <div className={className}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          controls
          preload="none"
          poster={posterUrl}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
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
        playback-id={playbackId}
        stream-type="on-demand"
        poster={posterUrl}
        playsinline
        style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: '0.5rem', overflow: 'hidden' }}
      />
    </div>
  )
}
