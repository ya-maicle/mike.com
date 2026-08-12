import { describe, expect, it } from 'vitest'

import {
  addAvatarVersion,
  formatFullName,
  getAuthProfileMetadata,
  getAvatarObjectPath,
  getProfileInitials,
  getProfileSaveErrorMessage,
  isCustomAvatarUrl,
  profileNameSchema,
  splitFullName,
  validateAvatarFile,
} from '@/lib/profile-editing'

describe('profile names', () => {
  it('normalizes and formats first and last names', () => {
    const result = profileNameSchema.parse({
      firstName: '  Mikhail  ',
      lastName: '  Iukhtenko  ',
    })

    expect(result).toEqual({ firstName: 'Mikhail', lastName: 'Iukhtenko' })
    expect(formatFullName(result)).toBe('Mikhail Iukhtenko')
  })

  it('supports mononyms and splits existing full names', () => {
    expect(splitFullName('Prince')).toEqual({ firstName: 'Prince', lastName: '' })
    expect(formatFullName({ firstName: '  Prince  ', lastName: '' })).toBe('Prince')
    expect(splitFullName('Mikhail Iukhtenko')).toEqual({
      firstName: 'Mikhail',
      lastName: 'Iukhtenko',
    })
  })

  it('requires a first name and limits both fields', () => {
    expect(profileNameSchema.safeParse({ firstName: ' ', lastName: '' }).success).toBe(false)
    expect(profileNameSchema.safeParse({ firstName: 'M', lastName: 'x'.repeat(51) }).success).toBe(
      false,
    )
  })

  it('builds initials from a name or email', () => {
    expect(getProfileInitials('Mikhail Iukhtenko', 'm@example.com')).toBe('MI')
    expect(getProfileInitials('', 'm@example.com')).toBe('M')
  })
})

describe('profile save errors', () => {
  it('handles plain Supabase database errors', () => {
    expect(
      getProfileSaveErrorMessage({
        message: 'column profiles.first_name does not exist',
      }),
    ).toBe('Profile updates are temporarily unavailable. Please try again shortly.')
  })

  it('explains unavailable storage without exposing backend details', () => {
    expect(getProfileSaveErrorMessage(new Error('Bucket not found'))).toBe(
      'Profile picture uploads are temporarily unavailable. Please try again shortly.',
    )
  })

  it('handles access and network failures', () => {
    expect(getProfileSaveErrorMessage({ message: 'new row violates row-level security' })).toBe(
      'You don’t have permission to update this profile.',
    )
    expect(getProfileSaveErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Could not connect to save your profile. Check your connection and try again.',
    )
  })

  it('uses a safe fallback for unknown errors', () => {
    expect(getProfileSaveErrorMessage({ code: 'unknown' })).toBe(
      'Could not save your profile. Please try again.',
    )
  })
})

describe('profile avatars', () => {
  it('uses one stable object per user', () => {
    expect(getAvatarObjectPath('user-id')).toBe('user-id/avatar')
  })

  it('accepts supported images up to five megabytes', () => {
    expect(validateAvatarFile({ type: 'image/webp', size: 5 * 1024 * 1024 })).toBeNull()
  })

  it('rejects unsupported or oversized images', () => {
    expect(validateAvatarFile({ type: 'image/svg+xml', size: 100 })).toMatch('JPG')
    expect(validateAvatarFile({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 })).toMatch('5 MB')
  })

  it('adds a cache-busting version to a public URL', () => {
    expect(addAvatarVersion('https://example.com/avatar', 123)).toBe(
      'https://example.com/avatar?v=123',
    )
  })

  it('distinguishes uploaded and generated avatars', () => {
    expect(isCustomAvatarUrl('https://example.supabase.co/avatar')).toBe(true)
    expect(isCustomAvatarUrl('/default-avatars/avatar-1.png')).toBe(false)
    expect(isCustomAvatarUrl(null)).toBe(false)
  })

  it('uses both avatar metadata keys for Auth compatibility', () => {
    expect(
      getAuthProfileMetadata({
        avatarUrl: 'https://example.supabase.co/avatar',
        firstName: 'Mikey',
        lastName: 'Boy',
      }),
    ).toEqual({
      avatar_url: 'https://example.supabase.co/avatar',
      first_name: 'Mikey',
      full_name: 'Mikey Boy',
      last_name: 'Boy',
      name: 'Mikey Boy',
      picture: 'https://example.supabase.co/avatar',
    })
  })
})
