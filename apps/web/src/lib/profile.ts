'use client'

import type { User } from '@supabase/supabase-js'
import getSupabaseClient from './supabase'
import { pickRandomDefaultAvatar } from './default-avatars'
import { pickRandomDefaultName } from './default-names'
import {
  addAvatarVersion,
  AVATAR_BUCKET,
  formatFullName,
  getAuthAvatarUrl,
  getAuthProfileMetadata,
  getAvatarObjectPath,
  getProfileAvatarUrl,
  profileNameSchema,
  type EditableProfile,
  type ProfileUpdate,
} from './profile-editing'

export async function upsertProfileFromUser(user: User) {
  const supabase = getSupabaseClient()
  const metaName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''

  // Provider data seeds new profiles; an existing profile remains authoritative after edits.
  const incomingAvatar = getProfileAvatarUrl(
    (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined),
  )

  const email = user.email

  // Best-effort read of existing profile (may be blocked by RLS in fresh projects)
  let existing: { avatar_url?: string | null; full_name?: string | null } | null = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .maybeSingle()
    existing = data ?? null
  } catch {
    existing = null
  }

  const defaultName = pickRandomDefaultName(user.id || user.email || undefined)
  const finalName = existing?.full_name?.trim()
    ? (existing.full_name as string)
    : metaName?.trim()
      ? metaName
      : defaultName
  const finalAvatar = existing?.avatar_url || incomingAvatar || pickRandomDefaultAvatar(user.id)

  // Persist the profile first. The row is the application source of truth and
  // the database trigger mirrors it into auth.users for dashboard visibility.
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, email, full_name: finalName, avatar_url: finalAvatar },
        { onConflict: 'id' },
      )
    if (error) {
      console.warn('profiles upsert failed:', error.message)
    }
  } catch (e: unknown) {
    console.warn('profiles upsert exception:', e instanceof Error ? e.message : String(e))
  }

  // Refresh the current Auth session as well, so client components see the
  // same avatar immediately instead of waiting for a new login.
  try {
    const authAvatarUrl = getAuthAvatarUrl(finalAvatar)
    const metadata: Record<string, unknown> = {}

    if (user.user_metadata?.full_name !== finalName) metadata.full_name = finalName
    if (user.user_metadata?.name !== finalName) metadata.name = finalName
    if (user.user_metadata?.avatar_url !== authAvatarUrl) metadata.avatar_url = authAvatarUrl
    if (user.user_metadata?.picture !== authAvatarUrl) metadata.picture = authAvatarUrl

    if (Object.keys(metadata).length > 0) {
      const { error } = await supabase.auth.updateUser({ data: metadata })
      if (error) console.warn('Auth profile metadata update failed:', error.message)
    }
  } catch (e: unknown) {
    console.warn(
      'Auth profile metadata update exception:',
      e instanceof Error ? e.message : String(e),
    )
  }
}

export async function updateProfile({
  avatarFile,
  avatarUrl,
  email,
  firstName,
  lastName,
  userId,
}: ProfileUpdate): Promise<EditableProfile> {
  const supabase = getSupabaseClient()
  const names = profileNameSchema.parse({ firstName, lastName })
  const fullName = formatFullName(names)
  let nextAvatarUrl = avatarUrl

  if (avatarFile) {
    const objectPath = getAvatarObjectPath(userId)
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, avatarFile, {
        cacheControl: '3600',
        contentType: avatarFile.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath)
    nextAvatarUrl = addAvatarVersion(data.publicUrl)
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      first_name: names.firstName,
      last_name: names.lastName || null,
      full_name: fullName,
      avatar_url: nextAvatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (profileError) throw profileError

  // The profile row is authoritative; require the current Auth session to
  // reflect the same data before reporting the save as complete.
  const { error: metadataError } = await supabase.auth.updateUser({
    data: getAuthProfileMetadata({
      ...names,
      avatarUrl: nextAvatarUrl,
    }),
  })

  if (metadataError) {
    throw metadataError
  }

  return { ...names, avatarUrl: nextAvatarUrl }
}
