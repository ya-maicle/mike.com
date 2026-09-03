export const SITE_CONFIG = {
  name: 'Mike Iukhtenko',
  legalName: 'Mikhail Iukhtenko',
  personAlternateNames: ['Mike Yukhtenko', 'Mikhail Iukhtenko'],
  websiteAlternateNames: ['mikeiu.com'],
  role: 'Product Design Leader',
  description:
    'Product Design Leader specialising in agentic AI experiences, new interfaces, and complex problem spaces.',
  url: 'https://mikeiu.com',
  defaultSocialImageUrl:
    'https://cdn.sanity.io/images/nf3mt1vl/development/ff338b84dd63ac41db413a2db435c9068127f2f0-1200x630.jpg',
  locale: 'en_GB',
  links: {
    instagram: 'https://www.instagram.com/ya.maicle/',
    linkedin: 'https://www.linkedin.com/in/yamaicle/',
    youtube: 'https://www.youtube.com/@ya-maicle',
  },
} as const

export const SEO_TITLE_MAX_LENGTH = 60
export const SITE_TITLE_SUFFIX = ` – ${SITE_CONFIG.name}`
export const SEO_PAGE_TITLE_MAX_LENGTH = SEO_TITLE_MAX_LENGTH - SITE_TITLE_SUFFIX.length
