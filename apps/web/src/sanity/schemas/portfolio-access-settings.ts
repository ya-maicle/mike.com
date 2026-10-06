import { defineField, defineType } from 'sanity'

export const portfolioAccessSettings = defineType({
  name: 'portfolioAccessSettings',
  title: 'Access notifications',
  type: 'document',
  description:
    'Email settings for access requests and approvals. The Resend API key stays in the server environment.',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Send access emails',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'adminEmail',
      title: 'Send new requests to',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'senderEmail',
      title: 'Verified sender address',
      type: 'string',
      description: 'An address on a domain verified in Resend.',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'siteUrl',
      title: 'Website URL for email links',
      type: 'url',
      description: 'Use the matching Preview or production website, starting with https://.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Access notifications' }) },
})
