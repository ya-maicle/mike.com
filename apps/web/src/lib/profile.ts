'use client'

import type { User } from '@supabase/supabase-js'
import getSupabaseClient from './supabase'
import { pickRandomDefaultAvatar } from './default-avatars'
import { pickRandomDefaultName } from './default-names'
import {
  addAvatarVersion,
  AVATAR_BUCKET,
  formatFullName,
  getAuthProfileMetadata,
  getAvatarObjectPath,
  isCustomAvatarUrl,
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
  const incomingAvatar =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    undefined

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

  // Keep provider-facing metadata compatible with both `avatar_url` and `picture`.
  // Generated defaults remain app-only; uploaded/provider avatars are synchronized.
  try {
    const metadata: Record<string, unknown> = {}

    if (!metaName || metaName.trim().length === 0) {
      metadata.full_name = finalName
      metadata.name = finalName
    }

    if (isCustomAvatarUrl(finalAvatar)) {
      if (user.user_metadata?.avatar_url !== finalAvatar) metadata.avatar_url = finalAvatar
      if (user.user_metadata?.picture !== finalAvatar) metadata.picture = finalAvatar
    }

    if (Object.keys(metadata).length > 0) {
      await supabase.auth.updateUser({ data: metadata })
    }
  } catch {}

  // Upsert profile (non-throwing; log for debugging but don't block login)
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

  // The profile row is authoritative; metadata is synchronized best-effort for
  // any Supabase surfaces that still read directly from the Auth user.
  const { error: metadataError } = await supabase.auth.updateUser({
    data: getAuthProfileMetadata({
      ...names,
      avatarUrl: nextAvatarUrl,
    }),
  })

  if (metadataError) {
    console.warn('Auth profile metadata update failed:', metadataError.message)
  }

  return { ...names, avatarUrl: nextAvatarUrl }
}
