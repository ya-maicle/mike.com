import { beforeEach, describe, expect, it, vi } from 'vitest'
const getUser = vi.hoisted(() => vi.fn())
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser } }) }))
import { verifyPortfolioIdentity } from './portfolio-identity'
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.test')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test')
})
describe('verified identity', () => {
  it('uses the verified auth record, never user-editable metadata', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user',
          email: 'Person@Example.test',
          email_confirmed_at: '2026-01-01',
          user_metadata: { email: 'admin@trusted.test' },
        },
      },
    })
    expect(await verifyPortfolioIdentity('token')).toEqual({
      id: 'user',
      email: 'person@example.test',
    })
  })
  it('rejects unverified, anonymous, missing and revoked accounts', async () => {
    for (const user of [
      null,
      { email: 'person@example.test' },
      { email: 'person@example.test', email_confirmed_at: '2026-01-01', is_anonymous: true },
    ]) {
      getUser.mockResolvedValue({ data: { user } })
      expect(await verifyPortfolioIdentity('token')).toBeNull()
    }
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') })
    expect(await verifyPortfolioIdentity('token')).toBeNull()
    expect(await verifyPortfolioIdentity()).toBeNull()
  })
})
