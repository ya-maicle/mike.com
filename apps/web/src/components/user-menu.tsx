'use client'

import * as React from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import getSupabaseClient from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { pickRandomDefaultAvatar } from '@/lib/default-avatars'
import { toAvatarProxy } from '@/lib/avatar-src'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { LogOut } from 'lucide-react'
// no router needed here; logout stays on current page

function initialsFrom(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '')
    return letters.join('') || 'U'
  }
  if (email) return email[0]?.toUpperCase() ?? 'U'
  return 'U'
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const supabase = getSupabaseClient()
  const [pending, setPending] = React.useState(false)
  const initialMetaAvatar =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    undefined
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(initialMetaAvatar)
  const [avatarBroken, setAvatarBroken] = React.useState(false)

  const initialName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    ''
  const [displayName, setDisplayName] = React.useState<string>(initialName)

  const metaAvatar = initialMetaAvatar

  // Seed avatar from metadata first, else pull from profile and name from profiles as fallback
  React.useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (!cancelled) {
        if (!error && data?.avatar_url) {
          const dbAvatar = data.avatar_url as string
          // If we've marked the meta avatar as broken, avoid switching back to it
          if (!(avatarBroken && dbAvatar === metaAvatar)) {
            setAvatarUrl(dbAvatar)
          }
        } else if (!metaAvatar) {
          // As a safe fallback (e.g., before profile upsert completes), use a deterministic default
          setAvatarUrl((prev) => prev ?? pickRandomDefaultAvatar(user.id))
        }
        // Fallback name from profile if auth metadata lacks one
        const trimmedInitial = initialName?.trim() || ''
        if (trimmedInitial.length > 0) {
          setDisplayName(trimmedInitial)
        } else {
          const dbName = (data?.full_name as string | undefined)?.trim() || ''
          if (dbName.length > 0) {
            setDisplayName(dbName)
          } else {
            // As absolute fallback, show deterministic default name client-side
            try {
              const { pickRandomDefaultName } = await import('@/lib/default-names')
              setDisplayName(pickRandomDefaultName(user.id || user.email || undefined))
            } catch {
              setDisplayName('')
            }
          }
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, supabase, avatarBroken, metaAvatar, initialName])

  if (!user) {
    return null
  }

  const seededDefault = user ? pickRandomDefaultAvatar(user.id) : undefined
  const resolvedAvatar = avatarUrl || seededDefault
  const proxiedSrc = resolvedAvatar ? toAvatarProxy(resolvedAvatar) : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open user menu"
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar>
            {proxiedSrc ? (
              <AvatarImage
                src={proxiedSrc}
                alt={displayName || user.email || 'User'}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setAvatarBroken(true)
                  setAvatarUrl(seededDefault)
                }}
              />
            ) : null}
            <AvatarFallback>{initialsFrom(displayName, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar className="size-9">
            {proxiedSrc ? (
              <AvatarImage
                src={proxiedSrc}
                alt={displayName || user.email || 'User'}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setAvatarBroken(true)
                  setAvatarUrl(seededDefault)
                }}
              />
            ) : null}
            <AvatarFallback>{initialsFrom(displayName, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">
              {displayName || 'Unnamed User'}
            </div>
            <div className="text-muted-foreground truncate text-xs">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            if (pending) return
            setPending(true)
            try {
              await signOut()
            } finally {
              setPending(false)
            }
          }}
          className="flex items-center gap-2"
          disabled={pending}
        >
          <Icon icon={LogOut} size="md" className="text-zinc-500" />
          <span>{pending ? 'Logging out…' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
