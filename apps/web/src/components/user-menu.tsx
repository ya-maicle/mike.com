'use client'

import * as React from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import getSupabaseClient from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
import { useRouter } from 'next/navigation'

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
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  if (!user) {
    return null
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open user menu"
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || user.email || 'User'} /> : null}
            <AvatarFallback>{initialsFrom(name, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar className="size-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || user.email || 'User'} /> : null}
            <AvatarFallback>{initialsFrom(name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">{name || 'Unnamed User'}</div>
            <div className="text-muted-foreground truncate text-xs">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async (e) => {
            e.preventDefault()
            if (pending) return
            setPending(true)
            const { error } = await supabase.auth.signOut()
            if (error) {
              console.error('Sign out failed:', error.message)
            }
            try {
              router.refresh()
            } catch {}
            if (typeof window !== 'undefined') {
              setTimeout(() => window.location.reload(), 50)
            }
            setPending(false)
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
