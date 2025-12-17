import { defineField, defineType } from 'sanity'
import {
  blockStyles,
  blockLists,
  blockDecorators,
  fontWeightAnnotation,
} from './objects/block-styles'

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blockStyles,
          lists: blockLists,
          marks: {
            decorators: blockDecorators,
            annotations: [fontWeightAnnotation],
          },
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
        { type: 'spacerBlock' },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
