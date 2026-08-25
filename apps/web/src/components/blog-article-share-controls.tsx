'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ArticleLinkedInIcon, ArticleShareIcon, ArticleXIcon } from '@/components/ui/icon'
import { captureAnalyticsEvent } from '@/lib/analytics/client'
import { blogShareLinks } from '@/lib/blog-share'
import { SITE_CONFIG } from '@/lib/constants'

type BlogArticleShareControlsProps = {
  postSlug: string
  shareText: string
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through to the selection-based copy path for older Safari contexts.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Copy failed.')
}

export function BlogArticleShareControls({ postSlug, shareText }: BlogArticleShareControlsProps) {
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)
  const canonicalUrl = new URL(`/blog/${postSlug}`, SITE_CONFIG.url).toString()

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    },
    [],
  )

  async function shareArticle() {
    try {
      await copyText(canonicalUrl)
      captureAnalyticsEvent('blog_article_shared', { post_slug: postSlug, method: 'copy' })
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1_800)
    } catch {
      setCopied(false)
    }
  }

  function shareToSocialNetwork(method: 'x' | 'linkedin') {
    const links = blogShareLinks({ url: canonicalUrl, text: shareText })
    window.open(method === 'x' ? links.x : links.linkedIn, '_blank', 'noopener,noreferrer')
    captureAnalyticsEvent('blog_article_shared', { post_slug: postSlug, method })
  }

  return (
    <div className="ml-auto flex gap-4">
      <Button
        type="button"
        variant="ghost"
        aria-label="X"
        className="h-10 w-[18px] min-w-0 rounded-none p-0 has-[>svg]:!px-0 hover:bg-transparent hover:text-muted-foreground"
        onClick={() => shareToSocialNetwork('x')}
      >
        <ArticleXIcon className="!size-[18px] !translate-y-0" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        aria-label="LinkedIn"
        className="h-10 w-[18px] min-w-0 rounded-none p-0 has-[>svg]:!px-0 hover:bg-transparent hover:text-muted-foreground"
        onClick={() => shareToSocialNetwork('linkedin')}
      >
        <ArticleLinkedInIcon className="!size-[18px] !translate-y-0" />
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-[0.3em] rounded-[4px] p-0 has-[>svg]:!px-0 text-base font-medium leading-none hover:bg-transparent hover:text-muted-foreground"
          onClick={shareArticle}
        >
          <ArticleShareIcon className="size-6 h-[17px] -rotate-45 !translate-y-0" />
          Share
        </Button>
        {copied ? (
          <div
            role="dialog"
            aria-label="Link Copied Modal"
            aria-live="polite"
            className="pointer-events-none absolute left-1/2 top-full z-10 w-max -translate-x-1/2 rounded-md bg-muted/80 px-2 py-1 text-center text-base font-normal leading-relaxed text-foreground"
          >
            <h2 className="sr-only">Link Copied Modal</h2>
            Copied
          </div>
        ) : null}
      </div>
    </div>
  )
}
