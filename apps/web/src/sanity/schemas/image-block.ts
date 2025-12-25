import { defineField, defineType } from 'sanity'

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  description: 'A simple block containing a title, an image, and a description',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.min(3).max(120),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text', validation: (Rule) => Rule.required() },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
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
      name: 'width',
      title: 'Width',
      type: 'string',
      description: 'Control how wide the image appears',
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
    select: { title: 'title', media: 'image', width: 'width' },
    prepare({ title, media, width }) {
      return {
        title: title || 'Image Block',
        subtitle: `Width: ${width || 'full'}`,
        media,
      }
    },
  },
})
