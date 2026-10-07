import { defineField, defineType } from 'sanity'

export const portfolioAccessSettings = defineType({
  name: 'portfolioAccessSettings',
  title: 'Portfolio access settings',
  type: 'document',
  description:
    'Email settings for access requests and approvals. The Resend API key stays in the server environment.',
  fields: [
    defineField({
      name: 'defaultCaseStudies',
      title: 'Standard portfolio selection',
      type: 'array',
      description:
        'Copied into new requests for review. Approval unlocks only the studies selected on that request. Changing this default does not change existing grants. With no default, select the studies when reviewing each request.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'caseStudy' }],
          options: { filter: 'visibility == "recruiter"' },
        },
      ],
      validation: (Rule) => Rule.unique(),
    }),
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
      description:
        'The website to open from emails, starting with https://. Vercel Preview deployments automatically use their own branch URL so test emails return to the matching preview.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Portfolio access settings' }) },
})
