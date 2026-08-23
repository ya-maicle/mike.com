import type { SanityImage } from '@/sanity/queries'

export const CASE_STUDY_MOBILE_MEDIA_QUERY = '(max-width: 767px)'
export const CASE_STUDY_ZOOM_LEVELS = [1, 1.5, 2, 3] as const

type ViewportSize = { width: number; height: number }

export function selectCaseStudyImage(
  desktopImage: SanityImage,
  mobileImage: SanityImage | undefined,
  isMobile: boolean,
) {
  return isMobile && mobileImage?.asset ? mobileImage : desktopImage
}

export function fitCaseStudyImage(
  image: SanityImage,
  viewport: ViewportSize,
  reservedVerticalSpace: number,
) {
  const dimensions = image.asset?.metadata?.dimensions
  const ratio =
    dimensions?.width && dimensions?.height ? dimensions.width / dimensions.height : 4 / 3
  const availableWidth = Math.max(1, viewport.width - 32)
  const availableHeight = Math.max(1, viewport.height - reservedVerticalSpace)
  const width = Math.min(availableWidth, availableHeight * ratio)

  return { width, height: width / ratio }
}
