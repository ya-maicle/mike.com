import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  cookie: vi.fn(),
  context: vi.fn(),
  create: vi.fn(),
  fetch: vi.fn(),
  patch: vi.fn(),
  notify: vi.fn(),
  jobs: [] as (() => Promise<void>)[],
}))
vi.mock('next/server', async (original) => ({
  ...(await original<typeof import('next/server')>()),
  after: (job: () => Promise<void>) => mocks.jobs.push(job),
}))
vi.mock('@/lib/portfolio-identity', () => ({
  verifyPortfolioIdentity: mocks.identity,
  setPortfolioIdentity: mocks.cookie,
}))
vi.mock('@/lib/portfolio-requests', () => ({
  accessRequestId: () => 'portfolioAccessRequest.canonical',
  accessRequestClient: () => ({
    createIfNotExists: mocks.create,
    fetch: mocks.fetch,
    patch: mocks.patch,
  }),
}))
vi.mock('@/lib/portfolio-request-context', () => ({ portfolioRequestContext: mocks.context }))
vi.mock('@/lib/portfolio-notifications', () => ({ notifyAccessRequest: mocks.notify }))
import { GET, POST } from './route'
const identity = { id: 'verified-user', email: 'verified@example.test', name: 'Visitor' }
const none = {
  current: undefined,
  standard: ['selected-study'],
  state: { status: 'none', email: identity.email, studies: [] },
}
function request(body?: object) {
  return new NextRequest('http://localhost:3333/api/portfolio-access/request', {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer verified-token', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.jobs.length = 0
  mocks.identity.mockResolvedValue(identity)
  mocks.context.mockResolvedValue(none)
  mocks.create.mockResolvedValue({})
})
describe('portfolio request API', () => {
  it('saves one request with verified identity and the configured review selection before notifying', async () => {
    mocks.context
      .mockResolvedValueOnce(none)
      .mockResolvedValue({ ...none, state: { ...none.state, status: 'pending' } })
    const response = await POST(request({ company: 'Example' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ status: 'pending', email: identity.email })
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'portfolioAccessRequest.canonical',
        userId: identity.id,
        email: identity.email,
        scope: 'portfolio',
        status: 'pending',
        company: 'Example',
        role: '',
        reason: '',
        allowedCaseStudies: [{ _type: 'reference', _key: 'study-0', _ref: 'selected-study' }],
      }),
    )
    expect(mocks.notify).not.toHaveBeenCalled()
    mocks.notify.mockRejectedValue(new Error('Email offline'))
    await mocks.jobs[0]()
    expect(mocks.notify).toHaveBeenCalledWith('portfolioAccessRequest.canonical', 'admin')
    expect(mocks.cookie).toHaveBeenCalledWith(response, 'verified-token')
  })
  it.each(['pending', 'approved', 'declined', 'revoked', 'blocked'])(
    'does not create or resend requests for %s accounts',
    async (status) => {
      mocks.context.mockResolvedValue({ ...none, state: { ...none.state, status } })
      expect((await POST(request({ company: 'Example' }))).status).toBe(200)
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.jobs).toHaveLength(0)
    },
  )
  it('requires a verified identity and rejects caller-supplied permission fields', async () => {
    expect(
      (await POST(request({ company: 'Example', email: 'other@example.test', status: 'approved' })))
        .status,
    ).toBe(400)
    mocks.identity.mockResolvedValue(null)
    expect((await POST(request({ company: 'Example' }))).status).toBe(401)
    expect((await GET(request())).status).toBe(401)
    expect(mocks.create).not.toHaveBeenCalled()
  })
  it('does not report success or schedule email if saving fails', async () => {
    mocks.create.mockRejectedValue(new Error('Sanity unavailable'))
    expect((await POST(request({ company: 'Example' }))).status).toBe(503)
    expect(mocks.jobs).toHaveLength(0)
  })
  it('renews an expired grant in place with a revision guard and no retained approval', async () => {
    const commit = vi.fn().mockResolvedValue({})
    const unset = vi.fn().mockReturnValue({ commit })
    const set = vi.fn().mockReturnValue({ unset })
    const ifRevisionId = vi.fn().mockReturnValue({ set })
    mocks.patch.mockReturnValue({ ifRevisionId })
    mocks.fetch.mockResolvedValue({
      _rev: 'current-revision',
      status: 'approved',
      expiresAt: '2020-01-01',
    })
    mocks.context
      .mockResolvedValueOnce({
        ...none,
        current: { _id: 'existing' },
        state: { ...none.state, status: 'expired' },
      })
      .mockResolvedValue({ ...none, state: { ...none.state, status: 'pending' } })
    expect((await POST(request({ company: 'Example' }))).status).toBe(200)
    expect(ifRevisionId).toHaveBeenCalledWith('current-revision')
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', scope: 'portfolio' }),
    )
    expect(unset).toHaveBeenCalledWith(expect.arrayContaining(['expiresAt', 'visitorNotification']))
    expect(mocks.create).not.toHaveBeenCalled()
  })
})
