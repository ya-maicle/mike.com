'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface CookieConsentPromptProps {
  saveError?: string
  onAccept: () => void
  onReject: () => void
  onManage: () => void
}

export function CookieConsentPrompt({
  saveError,
  onAccept,
  onReject,
  onManage,
}: CookieConsentPromptProps) {
  return (
    <Card
      data-nosnippet
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-40 gap-4 py-4 shadow-none sm:right-6 sm:bottom-6 sm:left-auto sm:w-full sm:max-w-sm"
    >
      <CardContent className="space-y-3 px-4">
        <p className="text-sm leading-5">
          We use necessary cookies to make this site work. With your permission, we use analytics to
          understand how visitors use the site and improve its content and performance.
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-sm font-normal text-foreground underline decoration-1 underline-offset-4"
            onClick={onManage}
          >
            Manage cookies
          </Button>
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto p-0 text-sm font-normal text-foreground underline decoration-1 underline-offset-4"
          >
            <Link href="/cookie-policy">Learn more</Link>
          </Button>
        </div>

        {saveError ? (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 px-4">
        <Button type="button" size="sm" className="w-full text-sm" onClick={onAccept}>
          Accept analytics
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-sm"
          onClick={onReject}
        >
          Reject analytics
        </Button>
      </CardFooter>
    </Card>
  )
}
