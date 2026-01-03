import { caseStudy } from './case-study'
import { page } from './page'
import { imageBlock } from './image-block'
import { videoBlock } from './video-block'
import { carouselBlock } from './carousel-block'
import { spacerBlock } from './objects/spacer-block'
import { twoColumnImageBlock } from './objects/two-column-image-block'
import { homePage } from './home-page'
import { legalPage } from './legal-page'

export const schemaTypes = [
  homePage,
  caseStudy,
  page,
  imageBlock,
  videoBlock,
  carouselBlock,
  spacerBlock,
  twoColumnImageBlock,
  legalPage,
]
