import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  identity: vi.fn(),
  profiles: vi.fn(),
  requests: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => (mocks.cookies.has(key) ? { value: mocks.cookies.get(key) } : undefined),
  }),
}))
vi.mock('@/sanity/client', () => ({ sanityNoStoreFetch: mocks.profiles }))
vi.mock('@/lib/portfolio-identity', () => ({
  getPortfolioIdentity: mocks.identity,
  PORTFOLIO_IDENTITY_COOKIE: 'portfolio_identity',
  identityCookieOptions: {},
}))
vi.mock('@/lib/portfolio-requests', () => ({ getAccessRequests: mocks.requests }))
import { getPortfolioAccessState, resolveIdentityAccess } from './portfolio-access'
import { signAccessPayload } from './portfolio-access-crypto'

const user = { id: 'one', email: 'visitor@example.test' }
beforeEach(() => {
  mocks.cookies.clear()
  mocks.identity.mockResolvedValue(null)
  mocks.profiles.mockResolvedValue([])
  mocks.requests.mockResolvedValue([])
  vi.stubEnv('PORTFOLIO_ACCESS_SECRET', 'test-secret')
})
describe('live access decisions', () => {
  it('lets a Sanity block override an individual approval and company grant', async () => {
    mocks.profiles.mockResolvedValue([
      {
        _id: 'allow',
        companyName: 'Example',
        slug: 'allow',
        accessStatus: 'enabled',
        allowedEmailDomains: ['example.test'],
      },
      {
        _id: 'deny',
        companyName: 'Example',
        slug: 'deny',
        accessStatus: 'blocked',
        allowedEmailDomains: ['example.test'],
      },
    ])
    mocks.requests.mockResolvedValue([{ status: 'approved', studyId: 'private' }])
    const result = await resolveIdentityAccess(user)
    expect(result.source).toBe('blocked')
    expect(result.hasMemberAccess).toBe(false)
    expect(result.hasRecruiterAccess).toBe(false)
  })
  it('applies approval and revocation on the next read without signing in again', async () => {
    mocks.identity.mockResolvedValue(user)
    mocks.requests.mockResolvedValue([{ status: 'approved', studyId: 'private' }])
    expect((await getPortfolioAccessState()).allowedStudyIds).toEqual(['private'])
    mocks.requests.mockResolvedValue([{ status: 'declined', studyId: 'private' }])
    expect((await getPortfolioAccessState()).allowedStudyIds).toEqual([])
  })
  it('blocks a known identity even when a shared-link cookie exists', async () => {
    mocks.identity.mockResolvedValue(user)
    mocks.cookies.set(
      'portfolio_link_access',
      signAccessPayload(
        { v: 1, kind: 'link', iat: 0, exp: Date.now() / 1000 + 3600 },
        'test-secret',
      )!,
    )
    mocks.profiles.mockResolvedValue([
      { accessStatus: 'blocked', allowedEmailDomains: ['example.test'] },
    ])
    expect((await getPortfolioAccessState()).source).toBe('blocked')
  })
  it('does not use a shared link when an identity token is revoked or expired', async () => {
    mocks.cookies.set('portfolio_identity', 'expired')
    mocks.cookies.set('portfolio_link_access', 'something')
    expect(await getPortfolioAccessState()).toEqual({ hasRecruiterAccess: false, source: 'none' })
  })
  it('fails closed if Sanity is unavailable', async () => {
    mocks.identity.mockResolvedValue(user)
    mocks.profiles.mockRejectedValue(new Error('offline'))
    const result = await getPortfolioAccessState()
    expect(result.hasRecruiterAccess).toBe(false)
    expect(result.hasMemberAccess).not.toBe(true)
  })
})
