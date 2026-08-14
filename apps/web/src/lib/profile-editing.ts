import { z } from 'zod'

import { DEFAULT_AVATAR_SITE_URL } from './default-avatars'

export const AVATAR_BUCKET = 'avatars'
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
export const SUPPORTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

const namePartSchema = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, ' '))
  .pipe(z.string().max(50, 'Use 50 characters or fewer.'))

export const profileNameSchema = z.object({
  firstName: namePartSchema.pipe(z.string().min(1, 'Enter your first name.')),
  lastName: namePartSchema,
})

export type ProfileName = z.infer<typeof profileNameSchema>

export type EditableProfile = ProfileName & {
  avatarUrl: string | null
}

export type ProfileUpdate = ProfileName & {
  avatarFile: File | null
  avatarUrl: string | null
  email: string
  userId: string
}

export function splitFullName(fullName?: string | null): ProfileName {
  const normalized = fullName?.trim().replace(/\s+/g, ' ') ?? ''
  const separator = normalized.indexOf(' ')

  if (separator === -1) {
    return { firstName: normalized, lastName: '' }
  }

  return {
    firstName: normalized.slice(0, separator),
    lastName: normalized.slice(separator + 1),
  }
}

export function formatFullName({ firstName, lastName }: ProfileName) {
  return [firstName, lastName]
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join(' ')
}

export function getProfileInitials(fullName?: string | null, email?: string | null) {
  if (fullName?.trim()) {
    return (
      fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'U'
    )
  }

  return email?.[0]?.toUpperCase() ?? 'U'
}

export function getAvatarObjectPath(userId: string) {
  return `${userId}/avatar`
}

export function validateAvatarFile(file: { size: number; type: string }) {
  if (!SUPPORTED_AVATAR_TYPES.includes(file.type as (typeof SUPPORTED_AVATAR_TYPES)[number])) {
    return 'Choose a JPG, PNG, or WebP image.'
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return 'Choose an image smaller than 5 MB.'
  }

  return null
}

export function addAvatarVersion(publicUrl: string, version = Date.now()) {
  const url = new URL(publicUrl)
  url.searchParams.set('v', String(version))
  return url.toString()
}

export function isCustomAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return false

  try {
    const url = new URL(avatarUrl, DEFAULT_AVATAR_SITE_URL)
    const siteOrigin = new URL(DEFAULT_AVATAR_SITE_URL).origin

    return !(url.origin === siteOrigin && url.pathname.startsWith('/default-avatars/'))
  } catch {
    return true
  }
}

export function getAuthAvatarUrl(
  avatarUrl?: string | null,
  siteUrl: string = DEFAULT_AVATAR_SITE_URL,
) {
  if (!avatarUrl) return null

  try {
    return new URL(avatarUrl, siteUrl).toString()
  } catch {
    return avatarUrl
  }
}

export function getProfileAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return null

  try {
    const url = new URL(avatarUrl, DEFAULT_AVATAR_SITE_URL)
    const siteOrigin = new URL(DEFAULT_AVATAR_SITE_URL).origin

    if (url.origin === siteOrigin && url.pathname.startsWith('/default-avatars/')) {
      return `${url.pathname}${url.search}`
    }
  } catch {}

  return avatarUrl
}

type ProfileAvatarSources = {
  defaultAvatar: string | null
  metadataAvatar?: string | null
  profileAvatar?: string | null
  rejectedAvatar?: string | null
}

export function resolveProfileAvatar({
  defaultAvatar,
  metadataAvatar,
  profileAvatar,
  rejectedAvatar,
}: ProfileAvatarSources) {
  const rejectedAvatarKey = getAuthAvatarUrl(rejectedAvatar)

  return (
    [profileAvatar, metadataAvatar, defaultAvatar].find((candidate): candidate is string =>
      Boolean(candidate && getAuthAvatarUrl(candidate) !== rejectedAvatarKey),
    ) ?? null
  )
}

type EditableProfileSources = {
  activeAvatarUrl: string | null
  currentUserId: string
  fallbackFullName: string
  loadedProfile: EditableProfile
  profileOwnerId: string | null
}

export function resolveEditableProfile({
  activeAvatarUrl,
  currentUserId,
  fallbackFullName,
  loadedProfile,
  profileOwnerId,
}: EditableProfileSources): EditableProfile {
  const names = profileOwnerId === currentUserId ? loadedProfile : splitFullName(fallbackFullName)

  return { ...names, avatarUrl: activeAvatarUrl }
}

export function getAuthProfileMetadata({ avatarUrl, firstName, lastName }: EditableProfile) {
  const fullName = formatFullName({ firstName, lastName })
  const authAvatarUrl = getAuthAvatarUrl(avatarUrl)

  return {
    avatar_url: authAvatarUrl,
    first_name: firstName,
    full_name: fullName,
    last_name: lastName || null,
    name: fullName,
    picture: authAvatarUrl,
  }
}

export function getProfileSaveErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : ''
  const normalized = message.toLowerCase()

  if (normalized.includes('bucket not found')) {
    return 'Profile picture uploads are temporarily unavailable. Please try again shortly.'
  }

  if (
    normalized.includes('column profiles.first_name does not exist') ||
    normalized.includes('column profiles.last_name does not exist')
  ) {
    return 'Profile updates are temporarily unavailable. Please try again shortly.'
  }

  if (normalized.includes('row-level security') || normalized.includes('permission denied')) {
    return 'You don’t have permission to update this profile.'
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Could not connect to save your profile. Check your connection and try again.'
  }

  return 'Could not save your profile. Please try again.'
}
