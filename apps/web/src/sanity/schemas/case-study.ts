import { defineType, defineField } from 'sanity'

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
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'Brief overview of the case study (appears in cards and SEO)',
      validation: (Rule) => Rule.required().min(20).max(300),
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
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
          type: 'string',
        }),
        defineField({
          name: 'discipline',
          title: 'Discipline',
          type: 'string',
        }),
        defineField({
          name: 'year',
          title: 'Year',
          type: 'string',
        }),
        defineField({
          name: 'link',
          title: 'Project Link',
          type: 'url',
        }),
      ],
    }),

    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
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
      media: 'coverImage',
    },
    prepare({ title, media }) {
      return {
        title,
        media,
      }
    },
  },
})
