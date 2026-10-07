import { describe, expect, it } from 'vitest'
import { canReadStudy } from './study-access'
import { approvedStudyIds, accessRequestSchema, requestStatus } from './portfolio-request-model'
import { profileMatchesDomain, profileStudyAccess } from './portfolio-access-model'

const visitor = { hasRecruiterAccess: false }
const request = {
  _id: 'private.test',
  userId: 'user',
  email: 'person@example.test',
  status: 'approved' as const,
  studyId: 'one',
}

describe('per-study authorization', () => {
  it('keeps public work open, denies unknown visibility, and requires membership for member work', () => {
    expect(canReadStudy({ _id: 'one', visibility: 'public' }, visitor)).toBe(true)
    expect(canReadStudy({ _id: 'one', visibility: 'unknown' }, { hasRecruiterAccess: true })).toBe(
      false,
    )
    expect(canReadStudy({ _id: 'one', visibility: 'members' }, visitor)).toBe(false)
    expect(
      canReadStudy({ _id: 'one', visibility: 'members' }, { ...visitor, hasMemberAccess: true }),
    ).toBe(true)
    expect(
      canReadStudy({ _id: 'one', visibility: 'recruiter' }, { ...visitor, hasMemberAccess: true }),
    ).toBe(false)
  })
  it('scopes individual grants to their selected studies', () => {
    const access = { ...visitor, allowedStudyIds: ['one'] }
    expect(canReadStudy({ _id: 'one', visibility: 'recruiter' }, access)).toBe(true)
    expect(canReadStudy({ _id: 'two', visibility: 'recruiter' }, access)).toBe(false)
    expect(canReadStudy({ _id: 'one', visibility: 'members' }, access)).toBe(true)
    expect(canReadStudy({ _id: 'two', visibility: 'members' }, access)).toBe(false)
    expect(canReadStudy({ _id: 'two', visibility: 'members' }, { hasRecruiterAccess: true })).toBe(
      true,
    )
  })
  it('never turns empty or expired individual selections into broad access', () => {
    expect(approvedStudyIds(request)).toEqual(['one'])
    expect(approvedStudyIds({ ...request, allowedStudyIds: [] })).toEqual([])
    expect(approvedStudyIds({ ...request, expiresAt: 'invalid' })).toEqual([])
    expect(requestStatus({ ...request, expiresAt: '2000-01-01' })).toBe('expired')
    expect(approvedStudyIds({ ...request, status: 'pending' })).toEqual([])
    expect(approvedStudyIds({ ...request, status: 'declined' })).toEqual([])
  })
  it('normalizes configured domains without matching lookalikes', () => {
    const profile = {
      _id: 'company',
      companyName: 'Example',
      slug: 'example',
      allowedEmailDomains: [' @Example.test '],
    }
    expect(profileMatchesDomain(profile, 'example.test')).toBe(true)
    expect(profileMatchesDomain(profile, 'notexample.test')).toBe(false)
    expect(profileMatchesDomain(profile, 'example.test.attacker.test')).toBe(false)
  })
  it('preserves legacy company grants but fails closed for empty selected grants', () => {
    const profile = {
      _id: 'company',
      companyName: 'Example',
      slug: 'example',
      accessStatus: 'enabled' as const,
    }
    expect(profileStudyAccess([profile]).hasRecruiterAccess).toBe(true)
    expect(profileStudyAccess([{ ...profile, accessScope: 'selected' }])).toEqual({
      hasRecruiterAccess: false,
      allowedStudyIds: [],
    })
    expect(
      profileStudyAccess([{ ...profile, accessScope: 'selected', allowedStudyIds: ['one'] }]),
    ).toEqual({ hasRecruiterAccess: false, allowedStudyIds: ['one'] })
  })
  it('rejects grant escalation and invalid request input', () => {
    const valid = {
      company: 'Example',
      role: 'Recruiter',
      reason: 'Reviewing this project for a role.',
    }
    expect(accessRequestSchema.safeParse(valid).success).toBe(true)
    expect(accessRequestSchema.safeParse({ ...valid, status: 'approved' }).success).toBe(false)
    expect(
      accessRequestSchema.safeParse({ ...valid, email: 'somebody@example.test' }).success,
    ).toBe(false)
    expect(accessRequestSchema.safeParse({ ...valid, company: '' }).success).toBe(false)
    expect(accessRequestSchema.safeParse({ company: 'Independent' }).success).toBe(true)
  })
})
