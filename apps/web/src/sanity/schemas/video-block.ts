/* eslint-disable */
import { defineField, defineType } from 'sanity'

export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video Block',
  type: 'object',
  description: 'A simple block containing a title, a Mux video, and a description',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.min(3).max(120),
    }),

    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
  ],

  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Video Block' }
    },
  },
})
