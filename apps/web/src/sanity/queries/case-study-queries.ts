import { groq } from 'next-sanity'
import { IMAGE_PROJECTION } from '../queries'

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

export const CASE_STUDY_WITH_BLOCKS = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    summary,
    "visibility": coalesce(visibility, "public"),
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

export const CASE_STUDY_TEASER_BY_SLUG = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    summary,
    "visibility": coalesce(visibility, "public"),
    publishedAt,
    slug,
    coverImage${IMAGE_PROJECTION},
    headerMedia{
      type,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    },
    projectInfo{
      sector,
      year
    }
  }
`

export const PUBLISHED_CASE_STUDIES = groq`
  *[_type == "caseStudy" && defined(slug.current)] | order(coalesce(featuredOrder, 9999) asc, publishedAt desc){
    _id,
    title,
    summary,
    "visibility": coalesce(visibility, "public"),
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
