import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), set: vi.fn(), commit: vi.fn(), access: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('./portfolio-requests', () => ({
  accessRequestClient: () => ({ fetch: mocks.fetch, patch: () => ({ set: mocks.set }) }),
}))
vi.mock('./portfolio-access', () => ({ resolveIdentityAccess: mocks.access }))
import { notifyAccessRequest } from './portfolio-notifications'
const request = {
  _id: 'portfolioAccessRequest.test',
  email: 'visitor@example.test',
  userId: 'user',
  company: 'Example',
  role: 'Reviewer',
  status: 'pending',
  requestedAt: '2026-10-01',
  allowedCaseStudies: [{ _ref: 'study' }],
  approvedStudies: [
    { _id: 'study', slug: 'case-study', title: 'Private work', visibility: 'recruiter' },
  ],
}
const settings = {
  enabled: true,
  adminEmail: 'owner@example.test',
  senderEmail: 'portfolio@example.test',
  siteUrl: 'https://preview.example.test',
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('RESEND_API_KEY', 'test-key')
  vi.stubEnv('VERCEL_ENV', '')
  vi.stubEnv('VERCEL_BRANCH_URL', '')
  mocks.set.mockReturnValue({ commit: mocks.commit })
  mocks.commit.mockResolvedValue({})
  mocks.fetch.mockImplementation(async (query: string) =>
    query.includes('portfolioAccessSettings') ? settings : request,
  )
  mocks.access.mockResolvedValue({ hasRecruiterAccess: false, allowedStudyIds: ['study'] })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
function decision(status: string) {
  mocks.fetch.mockImplementation(async (query: string) =>
    query.includes('portfolioAccessSettings') ? settings : { ...request, status },
  )
}
describe('access emails', () => {
  it.each([
    ['preview', 'feature.example.test', 'https://feature.example.test'],
    ['production', 'feature.example.test', 'https://preview.example.test'],
    ['preview', 'feature.example.test/invalid', 'https://preview.example.test'],
  ])('uses the matching email destination for %s and %s', async (environment, branch, origin) => {
    vi.stubEnv('VERCEL_ENV', environment)
    vi.stubEnv('VERCEL_BRANCH_URL', branch)
    const send = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 'email-preview' }) })
    vi.stubGlobal('fetch', send)
    await notifyAccessRequest(request._id, 'admin')
    expect(JSON.parse(send.mock.calls[0][1].body).text).toContain(`${origin}/studio/intent/edit/`)
    decision('approved')
    await notifyAccessRequest(request._id, 'visitor')
    expect(JSON.parse(send.mock.calls[1][1].body).text).toContain(`${origin}/access?signin=1`)
  })
  it('sends a review link to the configured administrator without granting access', async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'email-1' }) })
    vi.stubGlobal('fetch', send)
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('sent')
    const body = JSON.parse(send.mock.calls[0][1].body)
    expect(body.to).toEqual(['owner@example.test'])
    expect(body.text).toContain('/studio/intent/edit/')
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({
        adminNotification: expect.objectContaining({ state: 'sent', providerId: 'email-1' }),
      }),
    )
  })
  it('emails a portfolio approval with a direct returning-sign-in path only when access is effective', async () => {
    decision('approved')
    const send = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'email-2' }) })
    vi.stubGlobal('fetch', send)
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('sent')
    expect(JSON.parse(send.mock.calls[0][1].body).text).toContain(
      'https://preview.example.test/access?signin=1',
    )
    mocks.access.mockResolvedValue({ hasRecruiterAccess: false, source: 'blocked' })
    send.mockClear()
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('skipped')
    expect(send).not.toHaveBeenCalled()
  })
  it('preserves a saved decision when email fails and records a retryable failure', async () => {
    decision('approved')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('failed')
    expect(mocks.set).toHaveBeenCalledWith({
      visitorNotification: expect.objectContaining({ state: 'failed' }),
    })
  })
  it.each(['members', 'public'])(
    'does not send an approval for work that is now %s',
    async (visibility) => {
      mocks.fetch.mockImplementation(async (query: string) =>
        query.includes('portfolioAccessSettings')
          ? settings
          : {
              ...request,
              status: 'approved',
              approvedStudies: [{ ...request.approvedStudies[0], visibility }],
            },
      )
      const send = vi.fn()
      vi.stubGlobal('fetch', send)
      expect(await notifyAccessRequest(request._id, 'visitor')).toBe('skipped')
      expect(send).not.toHaveBeenCalled()
    },
  )
  it('records provider authentication failures without saving sensitive response text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ name: 'invalid_api_key', message: 'secret-provider-details' }),
      }),
    )
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('failed')
    expect(mocks.set).toHaveBeenCalledWith({
      adminNotification: expect.objectContaining({
        state: 'failed',
        errorCode: 'invalid_api_key',
        providerStatus: 401,
      }),
    })
    expect(JSON.stringify(mocks.set.mock.calls)).not.toContain('secret-provider-details')
  })
  it('handles non-JSON provider errors without losing the HTTP status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('not JSON')
        },
      }),
    )
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('failed')
    expect(mocks.set).toHaveBeenCalledWith({
      adminNotification: expect.objectContaining({
        errorCode: 'provider_error',
        providerStatus: 502,
      }),
    })
  })
  it('does not record acceptance when the provider returns no receipt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
    )
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('failed')
    expect(mocks.set).toHaveBeenCalledWith({
      adminNotification: expect.objectContaining({ errorCode: 'invalid_provider_response' }),
    })
  })
  it('does not resend an already recorded email, and uses a stable provider idempotency key', async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'email-3' }) })
    vi.stubGlobal('fetch', send)
    await notifyAccessRequest(request._id, 'admin')
    const notification = mocks.set.mock.calls[0][0].adminNotification
    mocks.fetch.mockResolvedValue({ ...request, adminNotification: notification })
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('sent')
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0][1].headers['Idempotency-Key']).toBe(`portfolio-${notification.key}`)
  })
  it('reports missing delivery configuration rather than claiming email was sent', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const send = vi.fn()
    vi.stubGlobal('fetch', send)
    expect(await notifyAccessRequest(request._id, 'admin')).toBe('disabled')
    expect(send).not.toHaveBeenCalled()
  })
  it.each(['declined', 'revoked'])(
    'notifies a %s decision without promising private access',
    async (status) => {
      decision(status)
      const send = vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ id: 'email-decision' }) })
      vi.stubGlobal('fetch', send)
      expect(await notifyAccessRequest(request._id, 'visitor')).toBe('sent')
      const body = JSON.parse(send.mock.calls[0][1].body)
      expect(body.to).toEqual([request.email])
      expect(body.text).toContain('/work?view=public')
      expect(body.text).not.toContain('access is approved')
    },
  )
  it('changes the provider key for a subsequent explicit approval', async () => {
    decision('approved')
    const send = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 'email-approval' }) })
    vi.stubGlobal('fetch', send)
    await notifyAccessRequest(request._id, 'visitor')
    mocks.fetch.mockImplementation(async (query: string) =>
      query.includes('portfolioAccessSettings')
        ? settings
        : { ...request, status: 'approved', decisionVersion: 'next-decision' },
    )
    await notifyAccessRequest(request._id, 'visitor')
    expect(send.mock.calls[0][1].headers['Idempotency-Key']).not.toBe(
      send.mock.calls[1][1].headers['Idempotency-Key'],
    )
  })
})
