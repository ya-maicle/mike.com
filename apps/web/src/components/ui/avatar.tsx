'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { getImageProps } from 'next/image'

import { cn } from '@/lib/utils'
import { isExternalUrl } from '@/lib/avatar-src'

const DEFAULT_AVATAR_DISPLAY_SIZE = 32

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

type AvatarImageProps = Omit<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
  'src'
> & {
  /** Rendered CSS size in pixels. The delivered image is capped at 2× for retina displays. */
  displaySize?: number
  src: string
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, displaySize = DEFAULT_AVATAR_DISPLAY_SIZE, src, ...props }, ref) => {
  const { props: optimizedImageProps } = getImageProps({
    alt: props.alt ?? '',
    height: displaySize,
    quality: 80,
    src,
    // Known remote avatars are first converted to the local, allow-listed
    // /api/avatar route. Unknown external URLs keep working without exposing
    // the Next.js image optimizer as an open proxy.
    unoptimized: isExternalUrl(src),
    width: displaySize,
  })

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
      src={optimizedImageProps.src}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
