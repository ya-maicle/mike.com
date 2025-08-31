'use client'

import type { User } from '@supabase/supabase-js'
import getSupabaseClient from './supabase'
import { pickRandomDefaultAvatar } from './default-avatars'

export async function upsertProfileFromUser(user: User) {
  const supabase = getSupabaseClient()

  const full_name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''

  // Prefer provider-supplied avatar (e.g., Google), else keep existing, else choose a default
  const incomingAvatar =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    undefined

  const email = user.email

  // Load existing profile to preserve any prior avatar assignment
  const { data: existing } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const finalAvatar = incomingAvatar || existing?.avatar_url || pickRandomDefaultAvatar(user.id)

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email, full_name, avatar_url: finalAvatar }, { onConflict: 'id' })
  if (error) throw error
}
