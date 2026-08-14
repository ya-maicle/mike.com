import type { User } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { pickRandomDefaultAvatar } from '@/lib/default-avatars'

const mocks = vi.hoisted(() => ({
  authUpdateUser: vi.fn(),
  getPublicUrl: vi.fn(),
  maybeSingle: vi.fn(),
  profileUpsert: vi.fn(),
  storageUpload: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  default: () => ({
    auth: { updateUser: mocks.authUpdateUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mocks.maybeSingle }),
      }),
      upsert: mocks.profileUpsert,
    }),
    storage: {
      from: () => ({
        getPublicUrl: mocks.getPublicUrl,
        upload: mocks.storageUpload,
      }),
    },
  }),
}))

import { updateProfile, upsertProfileFromUser } from '@/lib/profile'

describe('profile persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null })
    mocks.profileUpsert.mockResolvedValue({ error: null })
    mocks.authUpdateUser.mockResolvedValue({ error: null })
    mocks.storageUpload.mockResolvedValue({ error: null })
    mocks.getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://project.supabase.co/storage/v1/object/public/avatars/user/avatar',
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('persists a deterministic default in profiles and Auth metadata', async () => {
    const user = {
      id: '8cdd52b1-7d2f-41fb-8313-c5f71c489e76',
      email: 'mikey@example.com',
      user_metadata: {},
    } as User
    const defaultAvatar = pickRandomDefaultAvatar(user.id)

    await upsertProfileFromUser(user)

    expect(mocks.profileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar_url: defaultAvatar,
        email: user.email,
        id: user.id,
      }),
      { onConflict: 'id' },
    )
    expect(mocks.authUpdateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        avatar_url: `https://mikeiu.com${defaultAvatar}`,
        picture: `https://mikeiu.com${defaultAvatar}`,
      }),
    })
  })

  it('persists an upload in Storage, profiles, and Auth metadata', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)
    const avatarFile = { size: 1024, type: 'image/png' } as File

    const profile = await updateProfile({
      avatarFile,
      avatarUrl: '/default-avatars/avatar-1.png',
      email: 'mikey@example.com',
      firstName: 'Mikey',
      lastName: 'Boy',
      userId: 'user',
    })

    const uploadedUrl =
      'https://project.supabase.co/storage/v1/object/public/avatars/user/avatar?v=123'
    expect(mocks.storageUpload).toHaveBeenCalledWith(
      'user/avatar',
      avatarFile,
      expect.objectContaining({ contentType: 'image/png', upsert: true }),
    )
    expect(mocks.profileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: uploadedUrl, id: 'user' }),
      { onConflict: 'id' },
    )
    expect(mocks.authUpdateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({ avatar_url: uploadedUrl, picture: uploadedUrl }),
    })
    expect(profile.avatarUrl).toBe(uploadedUrl)
  })

  it('does not report a save as complete when Auth metadata synchronization fails', async () => {
    mocks.authUpdateUser.mockResolvedValue({ error: new Error('metadata update failed') })

    await expect(
      updateProfile({
        avatarFile: null,
        avatarUrl: '/default-avatars/avatar-1.png',
        email: 'mikey@example.com',
        firstName: 'Mikey',
        lastName: 'Boy',
        userId: 'user',
      }),
    ).rejects.toThrow('metadata update failed')
  })
})
