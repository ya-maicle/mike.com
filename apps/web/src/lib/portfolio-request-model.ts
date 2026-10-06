import { z } from 'zod'

export const accessRequestSchema = z
  .object({
    studySlug: z
      .string()
      .trim()
      .min(1)
      .max(96)
      .regex(/^[a-z0-9-]+$/),
    company: z.string().trim().min(2).max(120),
    role: z.string().trim().min(2).max(120),
    reason: z.string().trim().min(10).max(1000),
  })
  .strict()

export type AccessRequest = {
  _id: string
  userId: string
  email: string
  status: 'pending' | 'approved' | 'declined'
  studyId: string
  allowedStudyIds?: string[]
  expiresAt?: string
}

export function approvedStudyIds(request: AccessRequest) {
  if (request.status !== 'approved') return []
  if (request.expiresAt && !(new Date(request.expiresAt).getTime() > Date.now())) return []
  // An explicitly empty selection never becomes an all-study grant.
  return request.allowedStudyIds ?? [request.studyId]
}

export function requestStatus(request?: AccessRequest | null) {
  if (!request) return 'none'
  if (request.status === 'approved' && !approvedStudyIds(request).includes(request.studyId)) {
    return 'expired'
  }
  return request.status
}
