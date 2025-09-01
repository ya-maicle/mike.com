'use client'

import type { User } from '@supabase/supabase-js'
import getSupabaseClient from './supabase'
import { pickRandomDefaultAvatar } from './default-avatars'
import { pickRandomDefaultName } from './default-names'

export async function upsertProfileFromUser(user: User) {
  const supabase = getSupabaseClient()
  const metaName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''

  // Prefer provider-supplied avatar (e.g., Google), else keep existing, else choose a default
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
  const finalName = metaName?.trim()
    ? metaName
    : existing?.full_name?.trim()
      ? (existing!.full_name as string)
      : defaultName
  const finalAvatar = incomingAvatar || existing?.avatar_url || pickRandomDefaultAvatar(user.id)

  // Update auth metadata immediately so any UI using user.user_metadata sees a name
  try {
    if (!metaName || metaName.trim().length === 0) {
      await supabase.auth.updateUser({ data: { full_name: finalName, name: finalName } })
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
