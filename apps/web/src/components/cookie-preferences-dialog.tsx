'use client'

import * as React from 'react'
import Link from 'next/link'
import type { CookieChoices } from '@/lib/cookie-preferences'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface CookiePreferencesDialogProps {
  open: boolean
  choices: CookieChoices
  saveError?: string
  onOpenChange: (open: boolean) => void
  onSave: (choices: CookieChoices) => void
}

export function CookiePreferencesDialog({
  open,
  choices,
  saveError,
  onOpenChange,
  onSave,
}: CookiePreferencesDialogProps) {
  const [draft, setDraft] = React.useState(choices)

  React.useEffect(() => {
    if (open) setDraft(choices)
  }, [choices, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription className="pt-2 leading-6 text-foreground">
            This website uses cookies and similar technologies to provide essential features and,
            with your permission, understand how visitors use its content and how well pages and
            videos perform. You can change your choice at any time.{' '}
            <Link
              href="/cookie-policy"
              onClick={() => onOpenChange(false)}
              className="underline decoration-1 underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Learn more
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-[1rem_1fr] gap-x-3">
            <Checkbox id="cookies-necessary" checked disabled className="mt-1" />
            <div>
              <Label htmlFor="cookies-necessary">Strictly necessary</Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                These technologies are required for security, authentication, saved preferences, and
                other essential site functions. They cannot be turned off.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1rem_1fr] gap-x-3">
            <Checkbox
              id="cookies-analytics"
              checked={draft.analytics}
              onCheckedChange={(checked) =>
                setDraft((current) => ({ ...current, analytics: checked === true }))
              }
              className="mt-1"
            />
            <div>
              <Label htmlFor="cookies-analytics">Analytics and performance</Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                These technologies help measure how visitors use the site and how well pages and
                videos perform. They are disabled unless you opt in.
              </p>
            </div>
          </div>
        </div>

        {saveError ? (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {saveError}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" className="w-full" onClick={() => onSave(draft)}>
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
