import { describe, expect, it } from 'vitest'

import { isAllowedAvatarProxyUrl, toAvatarProxy } from '@/lib/avatar-src'

describe('avatar URL routing', () => {
  it('proxies known OAuth avatar hosts over HTTPS', () => {
    const src = 'https://lh3.googleusercontent.com/avatar.png'

    expect(isAllowedAvatarProxyUrl(new URL(src))).toBe(true)
    expect(toAvatarProxy(src)).toBe(`/api/avatar?src=${encodeURIComponent(src)}`)
  })

  it('proxies avatar objects from the configured Supabase project', () => {
    const supabaseUrl = 'https://project.supabase.co'
    const src = `${supabaseUrl}/storage/v1/object/public/avatars/user/avatar?v=123`

    expect(isAllowedAvatarProxyUrl(new URL(src), supabaseUrl)).toBe(true)
    expect(toAvatarProxy(src, supabaseUrl)).toBe(`/api/avatar?src=${encodeURIComponent(src)}`)
  })

  it('does not proxy other Supabase projects or buckets', () => {
    const supabaseUrl = 'https://project.supabase.co'

    expect(
      isAllowedAvatarProxyUrl(
        new URL('https://other.supabase.co/storage/v1/object/public/avatars/user/avatar'),
        supabaseUrl,
      ),
    ).toBe(false)
    expect(
      isAllowedAvatarProxyUrl(
        new URL('https://project.supabase.co/storage/v1/object/public/documents/file'),
        supabaseUrl,
      ),
    ).toBe(false)
  })

  it('does not proxy insecure or malformed URLs', () => {
    expect(isAllowedAvatarProxyUrl(new URL('http://lh3.googleusercontent.com/avatar.png'))).toBe(
      false,
    )
    expect(toAvatarProxy('not a url')).toBe('not a url')
  })
})
