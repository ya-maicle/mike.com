import { groq } from 'next-sanity'
import { IMAGE_PROJECTION } from '../queries'

// Tag helpers for ISR revalidation in Next fetch calls
export const caseStudyTag = (slug: string) => `caseStudy:${slug}`
export const caseStudiesTag = 'caseStudies'

const CASE_STUDY_BLOCKS_PROJECTION = groq`{
  ...,
  _type == 'imageBlock' => {
    ...,
    image${IMAGE_PROJECTION}
  },
  _type == 'videoBlock' => {
    ...,
    mode,
    video{asset->{playbackId}}
  },
  _type == 'carouselBlock' => {
    ...,
    items[]{
      kind,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    }
  },
  _type == 'twoColumnImageBlock' => {
    ...,
    leftImage${IMAGE_PROJECTION},
    rightImage${IMAGE_PROJECTION}
  }
}`

// Fetch a single case study by slug with all populated blocks and client
export const CASE_STUDY_WITH_BLOCKS = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    summary,
    publishedAt,
    seoSettings,
    slug,
    coverImage${IMAGE_PROJECTION},
    headerMedia{
      type,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    },
    projectInfo,

    panelContent[]${CASE_STUDY_BLOCKS_PROJECTION},
    content[]${CASE_STUDY_BLOCKS_PROJECTION}
  }
`

// Fetch all published case studies for listing (minimal projection)
export const PUBLISHED_CASE_STUDIES = groq`
  *[_type == "caseStudy" && defined(slug.current)] | order(coalesce(featuredOrder, 9999) asc, publishedAt desc){
    _id,
    title,
    summary,
    slug,
    featuredOrder,
    publishedAt,
    coverImage${IMAGE_PROJECTION},
    headerMedia{
      type,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    },
    projectInfo
  }
`
