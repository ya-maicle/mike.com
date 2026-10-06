import { createHash, randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  patch: vi.fn(),
  revision: vi.fn(),
  unset: vi.fn(),
  commit: vi.fn(),
  notify: vi.fn(),
}))
vi.mock('@/lib/portfolio-requests', () => ({
  accessRequestClient: () => ({ fetch: mocks.fetch, patch: mocks.patch }),
}))
vi.mock('@/lib/portfolio-notifications', () => ({ notifyAccessRequest: mocks.notify }))
import { POST } from './route'

const id = `portfolioAccessRequest.${'a'.repeat(64)}`
const proof = randomUUID()
function record(overrides = {}) {
  return {
    _rev: 'revision-1',
    notificationProof: {
      digest: createHash('sha256').update(proof).digest('hex'),
      kind: 'visitor',
      expiresAt: new Date(Date.now() + 45_000).toISOString(),
      ...overrides,
    },
  }
}
function request(overrides = {}) {
  return new Request('http://localhost/api/portfolio-access/notify', {
    method: 'POST',
    body: JSON.stringify({ id, kind: 'visitor', proof, ...overrides }),
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.patch.mockReturnValue({ ifRevisionId: mocks.revision })
  mocks.revision.mockReturnValue({ unset: mocks.unset })
  mocks.unset.mockReturnValue({ commit: mocks.commit })
  mocks.fetch.mockResolvedValue(record())
  mocks.notify.mockResolvedValue('sent')
})
describe('editor notification authorization', () => {
  it('consumes proof with an atomic revision guard before sending', async () => {
    expect((await POST(request())).status).toBe(200)
    expect(mocks.revision).toHaveBeenCalledWith('revision-1')
    expect(mocks.unset).toHaveBeenCalledWith(['notificationProof'])
    expect(mocks.notify).toHaveBeenCalledWith(id, 'visitor')
    expect(mocks.commit.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.notify.mock.invocationCallOrder[0],
    )
  })
  it.each([
    { digest: 'forged' },
    { kind: 'admin' },
    { expiresAt: 'invalid' },
    { expiresAt: '2000-01-01' },
    { expiresAt: '2099-01-01' },
  ])('denies forged, mismatched or expired proof: %j', async (overrides) => {
    mocks.fetch.mockResolvedValue(record(overrides))
    expect((await POST(request())).status).toBe(403)
    expect(mocks.notify).not.toHaveBeenCalled()
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it('denies replay after proof is consumed', async () => {
    mocks.fetch.mockResolvedValue({ _rev: 'revision-2' })
    expect((await POST(request())).status).toBe(403)
    expect(mocks.notify).not.toHaveBeenCalled()
  })
  it('does not send when a concurrent request wins the revision lock', async () => {
    mocks.commit.mockRejectedValue(new Error('revision conflict'))
    expect((await POST(request())).status).toBe(503)
    expect(mocks.notify).not.toHaveBeenCalled()
  })
  it('rejects caller-selected email recipients and malformed bodies', async () => {
    expect((await POST(request({ to: 'attacker@example.test' }))).status).toBe(400)
    expect((await POST(request({ proof: '' }))).status).toBe(400)
    expect(mocks.fetch).not.toHaveBeenCalled()
  })
})
