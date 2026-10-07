import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  status: 'approved',
  requestedAt: '2026-10-01',
  allowedCaseStudies: [{ _ref: 'study' }],
  study: { _id: 'study', slug: 'case-study', title: 'Private work', visibility: 'recruiter' },
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
  mocks.set.mockReturnValue({ commit: mocks.commit })
  mocks.commit.mockResolvedValue({})
  mocks.fetch.mockImplementation(async (query: string) =>
    query.includes('portfolioAccessSettings') ? settings : request,
  )
  mocks.access.mockResolvedValue({ hasRecruiterAccess: false, allowedStudyIds: ['study'] })
})
describe('access emails', () => {
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
  it('emails only a published approval that actually unlocks the requested study', async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'email-2' }) })
    vi.stubGlobal('fetch', send)
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('sent')
    expect(JSON.parse(send.mock.calls[0][1].body).text).toContain(
      'https://preview.example.test/work/case-study',
    )
    mocks.access.mockResolvedValue({ hasRecruiterAccess: false, source: 'blocked' })
    send.mockClear()
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('skipped')
    expect(send).not.toHaveBeenCalled()
  })
  it('preserves a saved decision when email fails and records a retryable failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await notifyAccessRequest(request._id, 'visitor')).toBe('failed')
    expect(mocks.set).toHaveBeenCalledWith({
      visitorNotification: expect.objectContaining({ state: 'failed' }),
    })
  })
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
})
