export function getMuxPosterUrl({
  playbackId,
  poster,
  thumbnailToken,
}: {
  playbackId: string
  poster?: string
  thumbnailToken?: string
}): string {
  if (poster) return poster

  return thumbnailToken
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${thumbnailToken}`
    : `https://image.mux.com/${playbackId}/thumbnail.jpg?fit_mode=preserve`
}
