import { defineField, defineType } from 'sanity'

export const portfolioAccessRequest = defineType({
  name: 'portfolioAccessRequest',
  title: 'Access Request',
  type: 'document',
  description:
    'Verified visitor requests. Publish a review decision to apply it. These records use private document IDs.',
  fields: [
    defineField({
      name: 'notificationProof',
      type: 'object',
      hidden: true,
      readOnly: true,
      fields: [
        defineField({ name: 'digest', type: 'string' }),
        defineField({ name: 'kind', type: 'string' }),
        defineField({ name: 'expiresAt', type: 'datetime' }),
      ],
    }),
    ...['adminNotification', 'visitorNotification'].map((name) =>
      defineField({
        name,
        title: name === 'adminNotification' ? 'Request email' : 'Approval email',
        type: 'object',
        readOnly: true,
        fields: [
          defineField({ name: 'state', title: 'Delivery state', type: 'string' }),
          defineField({ name: 'providerId', title: 'Provider receipt', type: 'string' }),
          defineField({ name: 'errorCode', title: 'Delivery issue', type: 'string' }),
          defineField({ name: 'providerStatus', title: 'Provider HTTP status', type: 'number' }),
          defineField({ name: 'key', type: 'string', hidden: true }),
        ],
      }),
    ),
    defineField({ name: 'email', title: 'Verified email', type: 'string', readOnly: true }),
    defineField({
      name: 'userId',
      title: 'Account ID',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: 'company', title: 'Company', type: 'string', readOnly: true }),
    defineField({ name: 'role', title: 'Role', type: 'string', readOnly: true }),
    defineField({
      name: 'reason',
      title: 'Reason for access',
      type: 'text',
      rows: 4,
      readOnly: true,
    }),
    defineField({ name: 'requestedAt', title: 'Requested at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'study',
      title: 'Requested case study',
      type: 'reference',
      to: [{ type: 'caseStudy' }],
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Decision',
      type: 'string',
      initialValue: 'pending',
      options: {
        layout: 'radio',
        list: [
          { title: 'Awaiting review', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Declined', value: 'declined' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'allowedCaseStudies',
      title: 'Approved case studies',
      type: 'array',
      description:
        'Only these studies unlock. The requested study is selected initially. Company blocks always take precedence.',
      of: [{ type: 'reference', to: [{ type: 'caseStudy' }] }],
      validation: (Rule) =>
        Rule.unique().custom((value, context) =>
          context.document?.status === 'approved' && !value?.length
            ? 'Select at least one case study.'
            : true,
        ),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Access expires at',
      type: 'datetime',
      description: 'Leave blank for no expiry.',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) =>
      doc?._id?.replace(/^drafts\./, '').startsWith('portfolioAccessRequest.')
        ? true
        : 'Access requests must be created through the website to keep visitor details private.',
    ),
  orderings: [
    { title: 'Newest request', name: 'newest', by: [{ field: 'requestedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'email', company: 'company', status: 'status', study: 'study.title' },
    prepare: ({ title, company, status, study }) => ({
      title,
      subtitle: `${status} · ${company} · ${study ?? 'Case study'}`,
    }),
  },
})
