'use client'

import * as React from 'react'
import { Camera, Loader2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toAvatarProxy } from '@/lib/avatar-src'
import {
  formatFullName,
  getProfileInitials,
  getProfileSaveErrorMessage,
  profileNameSchema,
  validateAvatarFile,
  type EditableProfile,
  type ProfileUpdate,
} from '@/lib/profile-editing'
import { updateProfile } from '@/lib/profile'

type ProfileEditDialogProps = {
  email: string
  onOpenChange: (open: boolean) => void
  onSaved: (profile: EditableProfile) => void
  open: boolean
  profile: EditableProfile
  saveProfile?: (update: ProfileUpdate) => Promise<EditableProfile>
  userId: string
}

type FieldErrors = Partial<Record<'firstName' | 'lastName', string>>

export function ProfileEditDialog({
  email,
  onOpenChange,
  onSaved,
  open,
  profile,
  saveProfile = updateProfile,
  userId,
}: ProfileEditDialogProps) {
  const [firstName, setFirstName] = React.useState(profile.firstName)
  const [lastName, setLastName] = React.useState(profile.lastName)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [avatarBroken, setAvatarBroken] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setAvatarFile(null)
    setPreviewUrl(null)
    setAvatarBroken(false)
    setFieldErrors({})
    setFormError(null)
  }, [open, profile.avatarUrl, profile.firstName, profile.lastName])

  React.useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const parsedNames = profileNameSchema.safeParse({ firstName, lastName })
  const normalizedFirstName = firstName.trim().replace(/\s+/g, ' ')
  const normalizedLastName = lastName.trim().replace(/\s+/g, ' ')
  const namesChanged =
    normalizedFirstName !== profile.firstName || normalizedLastName !== profile.lastName
  const canSave = (namesChanged || avatarFile !== null) && !pending
  const fullName = parsedNames.success
    ? formatFullName(parsedNames.data)
    : formatFullName({ firstName, lastName })
  const avatarSrc = previewUrl || (profile.avatarUrl ? toAvatarProxy(profile.avatarUrl) : null)

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const error = validateAvatarFile(file)
    if (error) {
      setAvatarFile(null)
      setPreviewUrl(null)
      setFormError(error)
      return
    }

    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAvatarBroken(false)
    setFormError(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = profileNameSchema.safeParse({ firstName, lastName })

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors
      setFieldErrors({
        firstName: flattened.firstName?.[0],
        lastName: flattened.lastName?.[0],
      })
      return
    }

    setPending(true)
    setFormError(null)
    setFieldErrors({})

    try {
      const savedProfile = await saveProfile({
        ...result.data,
        avatarFile,
        avatarUrl: profile.avatarUrl,
        email,
        userId,
      })
      onSaved(savedProfile)
      onOpenChange(false)
    } catch (error) {
      setFormError(getProfileSaveErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update how your name and picture appear on the site.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="size-28 border">
                {avatarSrc && !avatarBroken ? (
                  <AvatarImage
                    src={avatarSrc}
                    displaySize={112}
                    alt={fullName ? `${fullName}'s profile picture` : 'Profile picture'}
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {getProfileInitials(fullName, email)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 bg-background"
                aria-label="Choose a profile picture"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending}
              >
                <Icon icon={Camera} size="md" />
              </Button>
              <Input
                ref={fileInputRef}
                id="profile-avatar"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                hidden
                tabIndex={-1}
                onChange={handleAvatarChange}
                disabled={pending}
              />
            </div>
            <p className="text-muted-foreground text-xs">JPG, PNG or WebP. Maximum 5 MB.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                value={firstName}
                maxLength={50}
                autoComplete="given-name"
                required
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={fieldErrors.firstName ? 'profile-first-name-error' : undefined}
                onChange={(event) => {
                  setFirstName(event.target.value)
                  setFieldErrors((current) => ({ ...current, firstName: undefined }))
                }}
                disabled={pending}
              />
              {fieldErrors.firstName ? (
                <p id="profile-first-name-error" className="text-destructive text-sm">
                  {fieldErrors.firstName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                value={lastName}
                maxLength={50}
                autoComplete="family-name"
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={fieldErrors.lastName ? 'profile-last-name-error' : undefined}
                onChange={(event) => {
                  setLastName(event.target.value)
                  setFieldErrors((current) => ({ ...current, lastName: undefined }))
                }}
                disabled={pending}
              />
              {fieldErrors.lastName ? (
                <p id="profile-last-name-error" className="text-destructive text-sm">
                  {fieldErrors.lastName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={email}
                type="email"
                readOnly
                aria-readonly="true"
                className="bg-muted/50 text-muted-foreground"
              />
              <p className="text-muted-foreground text-xs">
                Your sign-in email can’t be changed here.
              </p>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {pending ? (
                <>
                  <Icon icon={Loader2} size="sm" className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
