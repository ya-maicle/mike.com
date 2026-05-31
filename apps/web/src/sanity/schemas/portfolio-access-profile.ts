import { defineField, defineType } from 'sanity'

const RESERVED_ROOT_SLUGS = new Set([
  'api',
  'debug',
  'login',
  'privacy',
  'stories',
  'studio',
  'terms',
  'work',
])

function normalizeDomain(value?: string) {
  return value?.trim().toLowerCase().replace(/^@/, '') ?? ''
}

export const portfolioAccessProfile = defineType({
  name: 'portfolioAccessProfile',
  title: 'Portfolio Access Profile',
  type: 'document',
  description: 'Company access links and corporate email domains for recruiter-only case studies.',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Root Link Slug',
      type: 'slug',
      description: 'Creates a root link such as /airbnb.',
      options: {
        source: 'companyName',
        maxLength: 64,
      },
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          const slug = value?.current?.trim().toLowerCase()
          if (!slug) return 'A root link slug is required.'
          if (RESERVED_ROOT_SLUGS.has(slug)) return `/${slug} is reserved by the website.`

          const documentId = context.document?._id?.replace(/^drafts\./, '')
          const client = context.getClient({ apiVersion: '2025-01-01' })
          const conflict = await client.fetch<{
            pageCount: number
            profileCount: number
          }>(
            `{
              "pageCount": count(*[_type == "page" && slug.current == $slug]),
              "profileCount": count(*[
                _type == "portfolioAccessProfile" &&
                slug.current == $slug &&
                !(_id in [$publishedId, $draftId])
              ])
            }`,
            {
              slug,
              publishedId: documentId,
              draftId: documentId ? `drafts.${documentId}` : '',
            },
          )

          if (conflict.pageCount > 0) return `/${slug} is already used by a CMS page.`
          if (conflict.profileCount > 0)
            return `/${slug} is already used by another access profile.`
          return true
        }),
    }),
    defineField({
      name: 'accessStatus',
      title: 'Access Status',
      type: 'string',
      initialValue: 'enabled',
      options: {
        layout: 'radio',
        list: [
          { title: 'Enabled', value: 'enabled' },
          { title: 'Blocked', value: 'blocked' },
          { title: 'Disabled', value: 'disabled' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'allowedEmailDomains',
      title: 'Allowed Email Domains',
      type: 'array',
      description: 'Corporate domains that can unlock recruiter-only case studies after login.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (Rule) =>
        Rule.unique().custom((domains) => {
          if (!domains?.length) return true
          const invalid = domains.find(
            (domain) =>
              typeof domain !== 'string' ||
              !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalizeDomain(domain)),
          )
          if (invalid) return `Invalid email domain: ${invalid}`
          return true
        }),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'Optional cutoff for links and domain grants.',
    }),
    defineField({
      name: 'personalization',
      title: 'Future Personalization',
      type: 'object',
      description: 'Reserved for company-specific copy or presentation later.',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
        }),
        defineField({
          name: 'note',
          title: 'Internal Note',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'companyName',
      slug: 'slug.current',
      status: 'accessStatus',
    },
    prepare({ title, slug, status }) {
      return {
        title,
        subtitle: `/${slug ?? 'missing-slug'} - ${status ?? 'unknown'}`,
      }
    },
  },
})
