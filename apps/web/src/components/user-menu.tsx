'use client'

import * as React from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import getSupabaseClient from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { pickRandomDefaultAvatar } from '@/lib/default-avatars'
import { pickRandomDefaultName } from '@/lib/default-names'
import { toAvatarProxy } from '@/lib/avatar-src'
import {
  formatFullName,
  getProfileInitials,
  getProfileAvatarUrl,
  resolveEditableProfile,
  resolveProfileAvatar,
  splitFullName,
  type EditableProfile,
} from '@/lib/profile-editing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { LogOut, UserRoundPen } from 'lucide-react'
// no router needed here; logout stays on current page

export function UserMenu() {
  const { user, signOut } = useAuth()
  const supabase = getSupabaseClient()
  const userId = user?.id
  const userEmail = user?.email
  const [pending, setPending] = React.useState(false)
  const [profileEditorOpen, setProfileEditorOpen] = React.useState(false)
  const initialMetaAvatar = getProfileAvatarUrl(
    (user?.user_metadata?.avatar_url as string | undefined) ||
      (user?.user_metadata?.picture as string | undefined),
  )
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(
    initialMetaAvatar ?? undefined,
  )
  const [brokenAvatar, setBrokenAvatar] = React.useState<{
    ownerId: string
    url: string
  } | null>(null)

  const initialName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    ''
  const [displayName, setDisplayName] = React.useState<string>(initialName)
  const [editableProfile, setEditableProfile] = React.useState<EditableProfile>({
    ...splitFullName(initialName),
    avatarUrl: initialMetaAvatar ?? null,
  })
  const [profileOwnerId, setProfileOwnerId] = React.useState<string | null>(null)

  const metaAvatar = initialMetaAvatar
  const brokenAvatarUrl = brokenAvatar && brokenAvatar.ownerId === userId ? brokenAvatar.url : null

  // Seed avatar from metadata first, else pull from profile and name from profiles as fallback
  React.useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, first_name, last_name, full_name')
        .eq('id', userId)
        .maybeSingle()
      if (!cancelled) {
        const resolvedAvatar = resolveProfileAvatar({
          defaultAvatar: pickRandomDefaultAvatar(userId),
          metadataAvatar: metaAvatar,
          profileAvatar: !error ? (data?.avatar_url as string | null | undefined) : null,
          rejectedAvatar: brokenAvatarUrl,
        })
        setAvatarUrl(resolvedAvatar ?? undefined)

        const dbName = (data?.full_name as string | undefined)?.trim() || ''
        const resolvedName =
          dbName || initialName.trim() || pickRandomDefaultName(userId || userEmail || undefined)
        const fallbackParts = splitFullName(resolvedName)
        const resolvedProfile = {
          firstName:
            (data?.first_name as string | null | undefined)?.trim() || fallbackParts.firstName,
          lastName:
            (data?.last_name as string | null | undefined)?.trim() || fallbackParts.lastName,
          avatarUrl: resolvedAvatar,
        }

        setDisplayName(formatFullName(resolvedProfile))
        setEditableProfile(resolvedProfile)
        setProfileOwnerId(userId)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, userEmail, supabase, brokenAvatarUrl, metaAvatar, initialName])

  if (!user) {
    return null
  }

  const seededDefault = pickRandomDefaultAvatar(user.id)
  const resolvedAvatar = resolveProfileAvatar({
    defaultAvatar: seededDefault,
    metadataAvatar: initialMetaAvatar,
    profileAvatar: profileOwnerId === user.id ? avatarUrl : null,
    rejectedAvatar: brokenAvatarUrl,
  })
  const proxiedSrc = resolvedAvatar ? toAvatarProxy(resolvedAvatar) : undefined
  const fallbackDisplayName =
    initialName.trim() || pickRandomDefaultName(user.id || user.email || undefined)
  const resolvedDisplayName =
    profileOwnerId === user.id ? displayName.trim() || fallbackDisplayName : fallbackDisplayName
  const editorProfile = resolveEditableProfile({
    activeAvatarUrl: resolvedAvatar,
    currentUserId: user.id,
    fallbackFullName: resolvedDisplayName,
    loadedProfile: editableProfile,
    profileOwnerId,
  })

  return (
    <>
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
                  displaySize={32}
                  alt={resolvedDisplayName || user.email || 'User'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (resolvedAvatar) {
                      setBrokenAvatar({ ownerId: user.id, url: resolvedAvatar })
                    }
                    setAvatarUrl(seededDefault)
                  }}
                />
              ) : null}
              <AvatarFallback>{getProfileInitials(resolvedDisplayName, user.email)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="size-9">
              {proxiedSrc ? (
                <AvatarImage
                  src={proxiedSrc}
                  displaySize={36}
                  alt={resolvedDisplayName || user.email || 'User'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (resolvedAvatar) {
                      setBrokenAvatar({ ownerId: user.id, url: resolvedAvatar })
                    }
                    setAvatarUrl(seededDefault)
                  }}
                />
              ) : null}
              <AvatarFallback>{getProfileInitials(resolvedDisplayName, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium leading-tight">
                {resolvedDisplayName || 'Unnamed User'}
              </div>
              <div className="text-muted-foreground truncate text-xs">{user.email}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setProfileEditorOpen(true)}
            className="flex items-center gap-2"
          >
            <Icon icon={UserRoundPen} size="md" className="text-zinc-500" />
            <span>Edit profile</span>
          </DropdownMenuItem>
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
      <ProfileEditDialog
        open={profileEditorOpen}
        onOpenChange={setProfileEditorOpen}
        userId={user.id}
        email={user.email ?? ''}
        profile={editorProfile}
        onSaved={(profile) => {
          setEditableProfile(profile)
          setProfileOwnerId(user.id)
          setDisplayName(formatFullName(profile))
          setAvatarUrl(profile.avatarUrl ?? undefined)
          setBrokenAvatar(null)
        }}
      />
    </>
  )
}
