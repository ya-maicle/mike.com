import { describe, expect, it } from 'vitest'
import {
  accessRequestSchema,
  approvedStudyIds,
  currentAccessRequest,
  requestStatus,
  type AccessRequest,
} from './portfolio-request-model'

const request: AccessRequest = {
  _id: 'request',
  userId: 'user',
  email: 'reviewer@example.test',
  status: 'approved',
  allowedStudyIds: ['selected-work'],
}
describe('portfolio request decisions', () => {
  it('collects one affiliation, with no project, role or note required', () => {
    expect(accessRequestSchema.parse({ company: 'Example' })).toEqual({
      company: 'Example',
      role: '',
      reason: '',
    })
    expect(accessRequestSchema.safeParse({ company: 'Example', status: 'approved' }).success).toBe(
      false,
    )
  })
  it('grants only explicit approved studies and fails closed on expiry or removal', () => {
    expect(approvedStudyIds(request)).toEqual(['selected-work'])
    expect(approvedStudyIds({ ...request, status: 'pending' })).toEqual([])
    expect(approvedStudyIds({ ...request, status: 'revoked' })).toEqual([])
    expect(requestStatus({ ...request, expiresAt: '2020-01-01' })).toBe('expired')
    expect(requestStatus({ ...request, allowedStudyIds: [] })).toBe('revoked')
    expect(requestStatus({ ...request, expiresAt: 'invalid' })).toBe('expired')
  })
  it('preserves legacy single-study grants without treating an explicit empty selection as a grant', () => {
    expect(
      approvedStudyIds({ ...request, allowedStudyIds: undefined, studyId: 'legacy-study' }),
    ).toEqual(['legacy-study'])
    expect(approvedStudyIds({ ...request, allowedStudyIds: [], studyId: 'legacy-study' })).toEqual(
      [],
    )
  })
  it('uses one canonical portfolio request, including an existing declined decision', () => {
    const canonical = { ...request, scope: 'portfolio' as const, status: 'declined' as const }
    expect(
      currentAccessRequest([
        { ...request, status: 'pending', requestedAt: '2026-10-06' },
        canonical,
      ]),
    ).toBe(canonical)
    expect(currentAccessRequest([])).toBeUndefined()
  })
})
