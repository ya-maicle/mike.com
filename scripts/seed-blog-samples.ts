#!/usr/bin/env tsx
/* eslint-disable no-console */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN
const API_VERSION = 'v2025-01-01'
const SAMPLE_PREFIX = 'blogPost-sample-'
const SAMPLE_COUNT = 12

if (!PROJECT_ID || !DATASET || !WRITE_TOKEN) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN.',
  )
  process.exit(1)
}

if (DATASET === 'production' && !process.argv.includes('--allow-production')) {
  console.error(
    'Refusing to seed sample content into the production dataset without --allow-production.',
  )
  process.exit(1)
}

const sanityBase = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}`
const sampleIds = Array.from(
  { length: SAMPLE_COUNT },
  (_, index) => `${SAMPLE_PREFIX}${String(index + 1).padStart(2, '0')}`,
)

type ImageAsset = {
  _id: string
  originalFilename?: string
}

type VideoAsset = {
  _id: string
  playbackId?: string
}

type Mutation = { createOrReplace: Record<string, unknown> } | { delete: { id: string } }

const articles = [
  {
    title: 'Designing for AI agents when software starts taking initiative',
    slug: 'designing-for-ai-agents',
    excerpt:
      'A practical look at how product design changes when software can plan, act, and recover on a person’s behalf.',
  },
  {
    title: 'The designer’s role after the interface',
    slug: 'designers-role-after-the-interface',
    excerpt:
      'Why intent, orchestration, and feedback loops are becoming as important as screens in contemporary product work.',
  },
  {
    title: 'How to build a design career around judgment',
    slug: 'design-career-around-judgment',
    excerpt:
      'Craft still matters, but the durable advantage is learning how to make strong decisions in ambiguous situations.',
  },
  {
    title: 'What design leaders should actually measure',
    slug: 'what-design-leaders-should-measure',
    excerpt:
      'A lightweight framework for connecting design quality, team health, customer outcomes, and business progress.',
  },
  {
    title: 'Why prototyping is becoming strategy',
    slug: 'prototyping-is-becoming-strategy',
    excerpt:
      'In uncertain product spaces, a convincing prototype can answer strategic questions faster than another presentation.',
  },
  {
    title: 'The case for slower product critique',
    slug: 'case-for-slower-product-critique',
    excerpt:
      'Better critique is less about rapid opinions and more about creating the conditions for precise, useful judgment.',
  },
  {
    title: 'Designing trust into AI systems',
    slug: 'designing-trust-into-ai-systems',
    excerpt:
      'Trust is built through legibility, control, and recovery—not through reassuring copy added at the end of a project.',
  },
  {
    title: 'From craft to product direction',
    slug: 'from-craft-to-product-direction',
    excerpt:
      'How senior designers can expand their influence without abandoning the hands-on work that made them effective.',
  },
  {
    title: 'Writing case studies people actually finish',
    slug: 'writing-case-studies-people-finish',
    excerpt:
      'A clear case study is a sequence of consequential decisions, not a chronological archive of every project activity.',
  },
  {
    title: 'What early-career designers should learn in 2026',
    slug: 'what-early-career-designers-should-learn',
    excerpt:
      'A focused learning map for building craft, systems thinking, AI fluency, and the confidence to explain your choices.',
  },
  {
    title: 'Design systems for generative products',
    slug: 'design-systems-for-generative-products',
    excerpt:
      'Generative interfaces need rules for uncertainty, adaptation, and evaluation alongside familiar component libraries.',
  },
  {
    title: 'Notes on taste, ambiguity, and shipping',
    slug: 'notes-on-taste-ambiguity-and-shipping',
    excerpt:
      'Three qualities that help design teams move through difficult product decisions without lowering the bar for craft.',
  },
] as const

async function sanityQuery<T>(query: string): Promise<T> {
  const url = new URL(`${sanityBase}/data/query/${DATASET}`)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${WRITE_TOKEN}` },
  })
  if (!response.ok)
    throw new Error(`Sanity query failed: ${response.status} ${await response.text()}`)
  return ((await response.json()) as { result: T }).result
}

async function sanityMutate(mutations: Mutation[]) {
  const url = new URL(`${sanityBase}/data/mutate/${DATASET}`)
  url.searchParams.set('returnIds', 'true')
  url.searchParams.set('visibility', 'sync')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WRITE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  })
  if (!response.ok) {
    throw new Error(`Sanity mutation failed: ${response.status} ${await response.text()}`)
  }
  return response.json()
}

function portableBlock(key: string, style: 'normal' | 'h2', text: string) {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-span`, text, marks: [] }],
  }
}

function samplePost(index: number, asset: ImageAsset, videoAsset?: VideoAsset) {
  const article = articles[index]
  const publishedAt = new Date(Date.now() - (index + 1) * 86_400_000).toISOString()
  const cover =
    index === 1 && videoAsset
      ? {
          type: 'video',
          video: {
            _type: 'mux.video',
            asset: { _type: 'reference', _ref: videoAsset._id },
          },
        }
      : {
          type: 'image',
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
            alt: `Sample cover for “${article.title}”.`,
          },
        }

  return {
    _id: sampleIds[index],
    _type: 'blogPost',
    title: article.title,
    slug: { _type: 'slug', current: article.slug },
    excerpt: article.excerpt,
    cover,
    publishedAt,
    content: [
      portableBlock(
        `intro-${index}`,
        'normal',
        `${article.excerpt} This sample article exists to test the complete blog layout and publishing flow.`,
      ),
      portableBlock(`heading-${index}`, 'h2', 'A useful place to begin'),
      portableBlock(
        `body-a-${index}`,
        'normal',
        'Start by making the underlying decision visible. Clarify what the product is trying to accomplish, what evidence is available, and where uncertainty remains.',
      ),
      portableBlock(
        `body-b-${index}`,
        'normal',
        'The strongest design work connects a clear point of view with enough feedback to change direction when reality disagrees.',
      ),
    ],
  }
}

async function main() {
  if (process.argv.includes('--delete')) {
    await sanityMutate(sampleIds.map((id) => ({ delete: { id } })))
    console.log(`Deleted ${sampleIds.length} sample blog posts from dataset “${DATASET}”.`)
    return
  }

  const assets = await sanityQuery<ImageAsset[]>(
    `*[
      _type == "sanity.imageAsset" &&
      metadata.dimensions.width >= 1000 &&
      metadata.dimensions.height >= 600
    ] | order(_createdAt desc)[0...24]{ _id, originalFilename }`,
  )

  if (assets.length === 0) {
    throw new Error('No suitable Sanity image assets were found for sample covers.')
  }

  const videoAsset = await sanityQuery<VideoAsset | null>(
    `*[
      _type == "mux.videoAsset" &&
      defined(playbackId) &&
      coalesce(data.playback_ids[0].policy, "public") == "public"
    ] | order(_updatedAt desc)[0]{ _id, playbackId }`,
  )

  const posts = articles.map((_, index) =>
    samplePost(index, assets[index % assets.length], videoAsset ?? undefined),
  )
  await sanityMutate(posts.map((post) => ({ createOrReplace: post })))

  console.log(
    `Created or refreshed ${posts.length} sample blog posts in dataset “${DATASET}” using ${Math.min(assets.length, posts.length)} image assets${videoAsset ? ' and 1 video asset' : ''}.`,
  )
  console.log('Remove them with: pnpm sanity:seed-blog-samples -- --delete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
