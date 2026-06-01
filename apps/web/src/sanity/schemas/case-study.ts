import { defineType, defineField } from 'sanity'
import { blockStyles } from './objects/block-styles'

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
