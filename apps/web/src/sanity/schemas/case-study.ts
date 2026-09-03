import { defineType, defineField } from 'sanity'
import { blockStyles } from './objects/block-styles'
import { narrationField } from './objects/narration-field'
import { SEO_TITLE_MAX_LENGTH } from '../../lib/constants'

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  description: 'Project case studies',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main title for this case study',
      validation: (Rule) => Rule.required().min(5).max(100),
    }),

    defineField({
      name: 'featuredOrder',
      title: 'Display Order',
      description:
        'Position on the /work page. Lower numbers appear first (e.g. 1, 2, 3). Leave blank to sort by publish date.',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
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
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      description:
        'Public case studies are fully visible. Recruiter-only case studies show public cards but gate the detail page.',
      initialValue: 'public',
      options: {
        layout: 'radio',
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Recruiter-only', value: 'recruiter' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'Brief overview of the case study (appears in cards and SEO)',
      validation: (Rule) => Rule.required().min(20).max(300),
    }),

    defineField({
      name: 'cover',
      title: 'Cover',
      description:
        'Cover media shown on cards and as the hero fallback. Choose Image or Video, then upload the asset.',
      type: 'object',
      options: { collapsed: false, collapsible: false },
      fields: [
        defineField({
          name: 'type',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              { title: 'Image', value: 'image' },
              { title: 'Video', value: 'video' },
            ],
            layout: 'radio',
          },
          initialValue: 'image',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.type !== 'image',
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              validation: (Rule) => Rule.required(),
            },
          ],
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { type?: string } | undefined
              if (parent?.type === 'image' && !value) return 'An image is required'
              return true
            }),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'mux.video',
          hidden: ({ parent }) => parent?.type !== 'video',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { type?: string } | undefined
              if (parent?.type === 'video' && !value) return 'A video is required'
              return true
            }),
        }),
      ],
    }),

    defineField({
      name: 'headerMedia',
      title: 'Header Media',
      description: 'Full width media shown below the header (Image or Video)',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Media Type',
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
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            },
          ],
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'mux.video',
          hidden: ({ parent }) => parent?.type !== 'video',
        }),
      ],
    }),

    defineField({
      name: 'projectInfo',
      title: 'Project Info',
      type: 'object',
      fields: [
        defineField({
          name: 'client',
          title: 'Client',
          type: 'string',
        }),
        defineField({
          name: 'sector',
          title: 'Sector',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        }),
        defineField({
          name: 'discipline',
          title: 'Discipline',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        }),
        defineField({
          name: 'year',
          title: 'Year',
          type: 'string',
        }),
        defineField({
          name: 'link',
          title: 'Project Link',
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'text',
              title: 'Link Text',
              type: 'string',
              initialValue: 'Visit Project',
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'panelContent',
      title: 'About the Project (Panel Content)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blockStyles,
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
        { type: 'spacerBlock' },
        { type: 'twoColumnImageBlock' },
      ],
      description: 'Content for the side panel (About the Project)',
    }),

    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blockStyles,
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
        { type: 'spacerBlock' },
        { type: 'twoColumnImageBlock' },
      ],
      description: 'Add content blocks to the case study',
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    narrationField,
    defineField({
      name: 'seoSettings',
      title: 'SEO & Social Sharing',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: `Complete case-study title shown in browser tabs and search results. No site-name suffix is added. Keep to ${SEO_TITLE_MAX_LENGTH} characters.`,
          validation: (Rule) =>
            Rule.max(SEO_TITLE_MAX_LENGTH).warning(
              `Use at most ${SEO_TITLE_MAX_LENGTH} characters so browser tabs and search results stay concise.`,
            ),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'Description for search results and social previews',
          validation: (Rule) =>
            Rule.max(160).warning('Search results may truncate this description.'),
        }),
        defineField({
          name: 'shareImage',
          title: 'Social Share Image',
          type: 'image',
          options: { hotspot: true },
          description:
            'Optional 1200 × 630 image. Uses an image cover, then the site card. Video covers need a dedicated social image.',
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'cover.image',
    },
    prepare({ title, media }) {
      return {
        title,
        media,
      }
    },
  },
})
