import type { CoverMedia, SanityImage } from '@/sanity/queries'

type HeaderMedia = {
  type?: 'image' | 'video'
  image?: SanityImage
  video?: { asset: { playbackId: string; aspectRatio?: string } }
}

export function resolveStudyCoverMedia(
  headerMedia: HeaderMedia | undefined,
  cover?: CoverMedia,
  legacyImage?: SanityImage,
): ReturnType<typeof coverToHeroMedia> {
  if (headerMedia?.type === 'video' && headerMedia.video?.asset?.playbackId) {
    return {
      type: 'video',
      video: {
        asset: {
          playbackId: headerMedia.video.asset.playbackId,
          aspectRatio: headerMedia.video.asset.aspectRatio,
        },
      },
    }
  }
  if (headerMedia?.image) {
    return { type: 'image', image: headerMedia.image }
  }
  return coverToHeroMedia(cover, legacyImage)
}

export type ResolvedCover =
  | { kind: 'video'; playbackId: string; aspectRatio?: string }
  | { kind: 'image'; image: SanityImage }
  | null

export function resolveCover(cover?: CoverMedia, legacyImage?: SanityImage): ResolvedCover {
  if (cover?.type === 'video' && cover.video?.asset?.playbackId) {
    return {
      kind: 'video',
      playbackId: cover.video.asset.playbackId,
      aspectRatio: cover.video.asset.aspectRatio,
    }
  }
  if (cover?.image?.asset) return { kind: 'image', image: cover.image }
  if (legacyImage?.asset) return { kind: 'image', image: legacyImage }
  return null
}

export function coverToHeroMedia(
  cover?: CoverMedia,
  legacyImage?: SanityImage,
):
  | { type: 'video'; video: { asset: { playbackId: string; aspectRatio?: string } } }
  | { type: 'image'; image: SanityImage }
  | undefined {
  const resolved = resolveCover(cover, legacyImage)
  if (!resolved) return undefined
  if (resolved.kind === 'video') {
    return {
      type: 'video',
      video: { asset: { playbackId: resolved.playbackId, aspectRatio: resolved.aspectRatio } },
    }
  }
  return { type: 'image', image: resolved.image }
}
