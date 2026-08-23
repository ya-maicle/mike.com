import { SITE_CONFIG } from '@/lib/constants'

const personId = `${SITE_CONFIG.url}/#person`
const websiteId = `${SITE_CONFIG.url}/#website`

export function getSiteStructuredData(profileImages: string[] = []) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.alternateNames,
        givenName: 'Mike',
        familyName: 'Iukhtenko',
        url: SITE_CONFIG.url,
        jobTitle: SITE_CONFIG.role,
        description: SITE_CONFIG.description,
        ...(profileImages.length > 0 ? { image: profileImages } : {}),
        knowsAbout: [
          'Product design',
          'Design leadership',
          'Agentic AI experiences',
          'User interface design',
          'Product strategy',
        ],
        sameAs: Object.values(SITE_CONFIG.links),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.alternateNames,
        description: SITE_CONFIG.description,
        inLanguage: 'en-GB',
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_CONFIG.url}/#profile-page`,
        url: SITE_CONFIG.url,
        name: `${SITE_CONFIG.name} — ${SITE_CONFIG.role}`,
        description: SITE_CONFIG.description,
        inLanguage: 'en-GB',
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
      },
    ],
  }
}

function JsonLd({ value }: { value: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(value).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export function SiteStructuredData({ profileImages = [] }: { profileImages?: string[] }) {
  return <JsonLd value={getSiteStructuredData(profileImages)} />
}
