import 'server-only'
import { createHash } from 'node:crypto'
import { sanityClient } from '@/sanity/client'
import type { AccessRequest } from '@/lib/portfolio-request-model'

export const requestProjection = `{
  _id, userId, email, status, expiresAt, scope, requestedAt,
  "studyId": study._ref, "allowedStudyIds": allowedCaseStudies[]._ref
}`

export function accessRequestId(userId: string, studyId = 'portfolio') {
  // The dot makes this a private Sanity document, even on a public dataset.
  return `portfolioAccessRequest.${createHash('sha256').update(`${userId}:${studyId}`).digest('hex')}`
}

export function accessRequestClient(write = false) {
  const token = write
    ? process.env.SANITY_API_WRITE_TOKEN
    : process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  if (!token) throw new Error('Portfolio request storage is unavailable')
  return sanityClient.withConfig({ token, useCdn: false, perspective: 'published' })
}

export async function getAccessRequests(userId: string, email: string) {
  return accessRequestClient().fetch<AccessRequest[]>(
    `*[_type == "portfolioAccessRequest" && _id in path("portfolioAccessRequest.**") && userId == $userId && email == $email]${requestProjection}`,
    { userId, email },
    { cache: 'no-store' },
  )
}
