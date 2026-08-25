import { caseStudy } from './case-study'
import { page } from './page'
import { imageBlock } from './image-block'
import { videoBlock } from './video-block'
import { carouselBlock } from './carousel-block'
import { spacerBlock } from './objects/spacer-block'
import { twoColumnImageBlock } from './objects/two-column-image-block'
import { homePage } from './home-page'
import { legalPage } from './legal-page'
import { portfolioAccessProfile } from './portfolio-access-profile'
import { program } from './program'
import { deck } from './deck'
import { blogPost } from './blog-post'

export const schemaTypes = [
  homePage,
  caseStudy,
  program,
  blogPost,
  page,
  imageBlock,
  videoBlock,
  carouselBlock,
  spacerBlock,
  twoColumnImageBlock,
  legalPage,
  portfolioAccessProfile,
  deck,
]
