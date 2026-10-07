import { z } from 'zod'

export const accessRequestSchema = z
  .object({
    company: z.string().trim().min(2).max(120),
    role: z.string().trim().max(120).optional().default(''),
    reason: z.string().trim().max(1000).optional().default(''),
  })
  .strict()

export type AccessRequestDetails = z.infer<typeof accessRequestSchema>
export type PortfolioRequestStatus =
  | 'none'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'blocked'
  | 'expired'
  | 'revoked'
export type PortfolioRequestState = {
  status: PortfolioRequestStatus
  email: string
  expiresAt?: string
  studies: { title: string; slug: string }[]
}

export type AccessRequest = {
  _id: string
  userId: string
  email: string
  status: 'pending' | 'approved' | 'declined' | 'revoked'
  scope?: 'portfolio'
  studyId?: string
  allowedStudyIds?: string[]
  expiresAt?: string
  requestedAt?: string
}

export function approvedStudyIds(request: AccessRequest) {
  if (request.status !== 'approved') return []
  if (request.expiresAt && !(new Date(request.expiresAt).getTime() > Date.now())) return []
  // An explicitly empty selection never becomes an all-study grant.
  return request.allowedStudyIds ?? (request.studyId ? [request.studyId] : [])
}

export function requestStatus(request?: AccessRequest | null): PortfolioRequestStatus {
  if (!request) return 'none'
  if (request.status === 'approved') {
    if (request.expiresAt && !(Date.parse(request.expiresAt) > Date.now())) return 'expired'
    if (!approvedStudyIds(request).length) return 'revoked'
  }
  return request.status
}

export function currentAccessRequest(requests: AccessRequest[]) {
  const sorted = [...requests].sort((a, b) =>
    (b.requestedAt ?? '').localeCompare(a.requestedAt ?? ''),
  )
  return (
    sorted.find((request) => request.scope === 'portfolio') ??
    sorted.find((request) => request.status === 'pending') ??
    sorted[0]
  )
}
