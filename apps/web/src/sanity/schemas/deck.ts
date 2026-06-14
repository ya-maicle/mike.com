import { defineField, defineType } from 'sanity'

export const deck = defineType({
  name: 'deck',
  title: 'Deck — Short Link',
  type: 'document',
  fields: [
    defineField({
      name: 'pdf',
      title: 'Case Studies PDF',
      type: 'file',
      options: { accept: 'application/pdf' },
      validation: (Rule) => Rule.required(),
      description:
        'The PDF distributed via the /deck short link. Replace this file whenever you publish a new version — the link stays the same.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Case Studies Deck',
        subtitle: 'Shareable short link → /deck',
      }
    },
  },
})
