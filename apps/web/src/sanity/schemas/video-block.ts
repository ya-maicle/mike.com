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

    defineField({
      name: 'mode',
      title: 'Display Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Standard (Controls)', value: 'standard' },
          { title: 'Decorative (Autoplay, Loop, Muted)', value: 'decorative' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    }),

    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      description: 'Control how wide the video appears',
      options: {
        list: [
          { title: 'Narrow (Content Width)', value: 'narrow' },
          { title: 'Medium', value: 'medium' },
          { title: 'Wide', value: 'wide' },
          { title: 'Full Width', value: 'full' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'full',
    }),
  ],

  preview: {
    select: { title: 'title', width: 'width' },
    prepare({ title, width }) {
      return {
        title: title || 'Video Block',
        subtitle: `Width: ${width || 'full'}`,
      }
    },
  },
})
