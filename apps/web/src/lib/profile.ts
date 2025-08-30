'use client'

import type { User } from '@supabase/supabase-js'
import getSupabaseClient from './supabase'

export async function upsertProfileFromUser(user: User) {
  const supabase = getSupabaseClient()
  const full_name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''
  const avatar_url =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null
  const email = user.email

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email, full_name, avatar_url }, { onConflict: 'id' })
  if (error) throw error
}
