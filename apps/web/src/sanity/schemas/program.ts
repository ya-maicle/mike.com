import { defineType, defineField } from 'sanity'
import { SEO_PAGE_TITLE_MAX_LENGTH } from '../../lib/constants'

export const program = defineType({
  name: 'program',
  title: 'Strength',
  type: 'document',
  description: 'A strength page — what you bring to a team',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Strength name (e.g. "Finding the direction")',
      validation: (Rule) => Rule.required().min(3).max(100),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'featuredOrder',
      title: 'Display Order',
      description:
        'Position in the home list and /strengths index. Lower numbers appear first. Leave blank to sort by title.',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'homeListDescription',
      title: 'Home List Description',
      type: 'text',
      rows: 2,
      description:
        'Short one-liner shown beside the title in the home strengths list (e.g. "Turning uncertainty into a clear plan and concrete decisions.")',
      validation: (Rule) => Rule.required().max(200),
    }),

    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description:
        'Shown above the title on the strength page (e.g. "Find the signal. Name the direction.")',
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Subtitle shown in the hero and used for SEO description',
      validation: (Rule) => Rule.required().min(20).max(400),
    }),

    defineField({
      name: 'heroExamples',
      title: 'Case Studies',
      description: 'Case studies shown in the hero slider for this strength.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'proofStudy',
          title: 'Case Study',
          fields: [
            defineField({
              name: 'study',
              title: 'Case Study',
              type: 'reference',
              to: [{ type: 'caseStudy' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'study.title',
              media: 'study.coverImage',
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),

    defineField({
      name: 'thesis',
      title: 'Thesis',
      type: 'text',
      rows: 6,
      description:
        'The problem-cost statement. First person, from experience. What expensive problem have you walked into? What does it cost? No colons or em-dashes.',
    }),

    defineField({
      name: 'approachIntro',
      title: 'Approach Intro',
      type: 'text',
      rows: 3,
      description:
        'Short paragraph shown above the move cards under "The approach." (e.g. "Here is how I typically navigate this…")',
    }),

    defineField({
      name: 'moves',
      title: 'How — Moves',
      description: '3 named moves that describe your method for this strength.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'move',
          title: 'Move',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Verb-led move title (e.g. "Map what actually matters")',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              description: '1–3 short sentences explaining this move',
              validation: (Rule) => Rule.required().max(300),
            }),
            defineField({
              name: 'media',
              title: 'Media',
              type: 'object',
              description: 'Square image or short video shown on the card',
              fields: [
                defineField({
                  name: 'type',
                  title: 'Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Image', value: 'image' },
                      { title: 'Video', value: 'video' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'image',
                }),
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: { hotspot: true },
                  hidden: ({ parent }) => parent?.type !== 'image',
                }),
                defineField({
                  name: 'video',
                  title: 'Video',
                  type: 'mux.video',
                  hidden: ({ parent }) => parent?.type !== 'video',
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'body' },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    defineField({
      name: 'proofIntro',
      title: 'Proof Intro',
      type: 'text',
      rows: 3,
      description: 'Short paragraph shown above the proof cards under "The proof."',
    }),

    defineField({
      name: 'proofs',
      title: 'Proofs',
      description: 'Evidence that this strength has worked in a real case study.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'proof',
          title: 'Proof',
          fields: [
            defineField({
              name: 'markerType',
              title: 'Marker Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Metric', value: 'metric' },
                  { title: 'Direction', value: 'direction' },
                  { title: 'Outcome', value: 'outcome' },
                ],
                layout: 'radio',
              },
              initialValue: 'outcome',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'marker',
              title: 'Marker',
              type: 'string',
              description:
                'The leading proof signal, such as "3x" or "Clearer decisions". For direction, use "up", "down", or "right".',
              validation: (Rule) => Rule.required().max(48),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(90),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required().max(280),
            }),
            defineField({
              name: 'caseStudy',
              title: 'Case Study',
              type: 'reference',
              to: [{ type: 'caseStudy' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              marker: 'marker',
              title: 'title',
              subtitle: 'caseStudy.title',
            },
            prepare({ marker, title, subtitle }) {
              return {
                title: [marker, title].filter(Boolean).join(' — '),
                subtitle,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),

    defineField({
      name: 'seoSettings',
      title: 'SEO Settings',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: `Page title before the site name is appended. Keep to ${SEO_PAGE_TITLE_MAX_LENGTH} characters.`,
          validation: (Rule) =>
            Rule.max(SEO_PAGE_TITLE_MAX_LENGTH).warning(
              `Use at most ${SEO_PAGE_TITLE_MAX_LENGTH} characters so the final branded title stays concise.`,
            ),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'Description for search engine results',
          validation: (Rule) =>
            Rule.max(160).warning('Search results may truncate this description.'),
        }),
        defineField({
          name: 'shareImage',
          title: 'Social Share Image',
          type: 'image',
          options: { hotspot: true },
          description: 'Optional 1200 × 630 page override. Uses the site card by default.',
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'homeListDescription',
      media: 'heroExamples.0.study.coverImage',
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle, media }
    },
  },
})
