import { defineField, defineType } from 'sanity'
import { getEmailDomain, profileMatchesDomain } from '@/lib/portfolio-access-model'
import {
  PORTFOLIO_ACCESS_PROFILES_WITH_DOMAINS,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'

export const portfolioAccessRequest = defineType({
  name: 'portfolioAccessRequest',
  title: 'Access Request',
  type: 'document',
  description:
    'One request for portfolio access. Review the verified email, visitor-supplied context and selected studies, then approve or decline. Company blocks always take precedence.',
  fieldsets: [
    {
      name: 'emailDelivery',
      title: 'Email delivery',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({ name: 'scope', type: 'string', hidden: true, readOnly: true }),
    defineField({ name: 'decisionVersion', type: 'string', hidden: true, readOnly: true }),
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
    defineField({ name: 'email', title: 'Verified email', type: 'string', readOnly: true }),
    defineField({
      name: 'name',
      title: 'Account name',
      description: 'Display name supplied by the visitor’s account.',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'userId',
      title: 'Account ID',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'company',
      title: 'Company or affiliation',
      description: 'Self-reported context, not verified employment.',
      type: 'string',
      readOnly: true,
    }),
    defineField({ name: 'role', title: 'Role', type: 'string', readOnly: true }),
    defineField({
      name: 'reason',
      title: 'Note (optional)',
      type: 'text',
      rows: 4,
      readOnly: true,
    }),
    defineField({ name: 'requestedAt', title: 'Requested at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'study',
      title: 'Original case study (legacy request)',
      type: 'reference',
      to: [{ type: 'caseStudy' }],
      readOnly: true,
      hidden: ({ document }) => !document?.study,
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
          { title: 'Access revoked', value: 'revoked' },
        ],
      },
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (value !== 'approved') return true
          const email = context.document?.email
          if (typeof email !== 'string') return 'A verified email is required.'
          try {
            const profiles = await context
              .getClient({ apiVersion: '2025-01-01' })
              .fetch<PortfolioAccessProfile[]>(PORTFOLIO_ACCESS_PROFILES_WITH_DOMAINS)
            return profiles.some(
              (profile) =>
                profile.accessStatus === 'blocked' &&
                profileMatchesDomain(profile, getEmailDomain(email)),
            )
              ? 'This email is blocked by an existing company access profile. Review that rule before approving access.'
              : true
          } catch {
            return 'Company access rules could not be checked. Try again before approving.'
          }
        }),
    }),
    defineField({
      name: 'allowedCaseStudies',
      title: 'Approved case studies',
      type: 'array',
      description:
        'This is the exact approval scope. New requests start with the standard portfolio selection from Settings. Edit it here for an exception; only these studies unlock.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'caseStudy' }],
          options: { filter: 'visibility == "recruiter"' },
        },
      ],
      validation: (Rule) =>
        Rule.unique().custom(async (value, context) => {
          if (context.document?.status !== 'approved') return true
          if (!value?.length) return 'Select at least one private case study.'
          const ids = value.flatMap((study) =>
            study && typeof study === 'object' && '_ref' in study && typeof study._ref === 'string'
              ? [study._ref]
              : [],
          )
          try {
            const count = await context
              .getClient({ apiVersion: '2025-01-01' })
              .fetch<number>(
                'count(*[_id in $ids && _type == "caseStudy" && visibility == "recruiter" && !(_id in path("drafts.**"))])',
                { ids },
              )
            return count > 0 || 'Select at least one published case study that requires approval.'
          } catch {
            return 'The selected work could not be checked. Try again before approving.'
          }
        }),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Access expires at',
      type: 'datetime',
      description: 'Leave blank for no expiry.',
      validation: (Rule) =>
        Rule.custom((value, context) =>
          context.document?.status === 'approved' && value && !(Date.parse(value) > Date.now())
            ? 'Choose a future date before approving access.'
            : true,
        ),
    }),
    ...['adminNotification', 'visitorNotification'].map((name) =>
      defineField({
        name,
        title: name === 'adminNotification' ? 'Request notification' : 'Decision notification',
        fieldset: 'emailDelivery',
        description:
          'Sent means accepted by the email provider, not confirmed inbox delivery. Failed or disabled notifications need attention; use Retry notification after correcting the configuration.',
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
    select: {
      title: 'email',
      company: 'company',
      status: 'status',
      notification: 'visitorNotification.state',
      requestNotification: 'adminNotification.state',
    },
    prepare: ({ title, company, status, notification, requestNotification }) => ({
      title,
      subtitle: `${status} · ${company ?? 'Portfolio access'}${['failed', 'disabled'].includes(status === 'pending' ? requestNotification : notification) ? ' · Email needs attention' : ''}`,
    }),
  },
})
