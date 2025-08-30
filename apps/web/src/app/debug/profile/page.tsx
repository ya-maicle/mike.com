'use client'

import * as React from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import getSupabaseClient from '@/lib/supabase'
import { upsertProfileFromUser } from '@/lib/profile'

export default function ProfileDebugPage() {
  const { user, loading } = useAuth()
  const supabase = getSupabaseClient()
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [profile, setProfile] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!user) return
    setStatus('loading')
    setError(null)
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error && error.code !== 'PGRST116') throw error
      setProfile(data ?? null)
      setStatus('loaded')
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
      setStatus('error')
    }
  }, [supabase, user])

  React.useEffect(() => {
    if (!loading && user) {
      load()
    }
  }, [loading, user, load])

  if (loading) return <div className="p-6">Loading session…</div>
  if (!user) return <div className="p-6">Not signed in. Please log in and revisit this page.</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Profile Debug</h1>
      <div className="text-sm text-muted-foreground">User ID: {user.id}</div>
      <div className="flex gap-2">
        <button
          onClick={load}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Refresh
        </button>
        <button
          onClick={async () => {
            try {
              await upsertProfileFromUser(user)
              await load()
            } catch (e) {
              console.error(e)
            }
          }}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Force Upsert
        </button>
      </div>
      {status === 'loading' && <div>Checking profile…</div>}
      {status === 'error' && <div className="text-destructive">Error: {error}</div>}
      {status === 'loaded' &&
        (profile ? (
          <pre className="rounded-md border p-3 text-xs overflow-auto bg-muted">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <div className="text-sm">No profile row found for this user.</div>
        ))}
    </div>
  )
}
