import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ access: vi.fn(), requests: vi.fn(), fetch: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('./portfolio-access', () => ({ resolveIdentityAccess: mocks.access }))
vi.mock('./portfolio-requests', () => ({
  accessRequestClient: () => ({ fetch: mocks.fetch }),
  getAccessRequests: mocks.requests,
}))
import { portfolioRequestContext } from './portfolio-request-context'
const identity = { id: 'user', email: 'reviewer@example.test' }
const studies = [
  { _id: 'private', title: 'Private work', slug: 'private-work', visibility: 'recruiter' },
  { _id: 'members', title: 'Member work', slug: 'members-work', visibility: 'members' },
]
beforeEach(() => {
  vi.resetAllMocks()
  mocks.access.mockResolvedValue({
    hasRecruiterAccess: false,
    hasMemberAccess: true,
    source: 'login',
  })
  mocks.requests.mockResolvedValue([])
  mocks.fetch.mockResolvedValue({ studies, standard: ['private', 'members', 'deleted'] })
})
describe('shared portfolio access state', () => {
  it('returns member work while requiring a request for private work', async () => {
    const result = await portfolioRequestContext(identity)
    expect(result.standard).toEqual(['private'])
    expect(result.state).toEqual({
      status: 'none',
      email: identity.email,
      studies: [{ title: 'Member work', slug: 'members-work' }],
    })
  })
  it('gives live Sanity blocks precedence over an approval', async () => {
    mocks.access.mockResolvedValue({ hasRecruiterAccess: false, source: 'blocked' })
    mocks.requests.mockResolvedValue([
      { ...identity, _id: 'request', status: 'approved', allowedStudyIds: ['private'] },
    ])
    expect((await portfolioRequestContext(identity)).state).toMatchObject({
      status: 'blocked',
      studies: [],
    })
  })
  it('does not change existing effective access when the default selection changes', async () => {
    mocks.access.mockResolvedValue({
      hasRecruiterAccess: false,
      allowedStudyIds: ['private'],
      source: 'login',
      companySlug: 'configured-company',
    })
    mocks.fetch.mockResolvedValue({ studies, standard: [] })
    mocks.requests.mockResolvedValue([
      { _id: 'old', status: 'approved', allowedStudyIds: ['private'], expiresAt: '2020-01-01' },
    ])
    const result = await portfolioRequestContext(identity)
    expect(result.state.status).toBe('approved')
    expect(result.state.expiresAt).toBeUndefined()
  })
  it('does not claim approval when the approved studies no longer exist', async () => {
    mocks.requests.mockResolvedValue([
      { _id: 'request', status: 'approved', allowedStudyIds: ['deleted'] },
    ])
    expect((await portfolioRequestContext(identity)).state.status).toBe('revoked')
  })
  it('propagates unavailable permission data instead of offering a false request state', async () => {
    mocks.access.mockRejectedValue(new Error('Sanity unavailable'))
    await expect(portfolioRequestContext(identity)).rejects.toThrow('Sanity unavailable')
  })
})
