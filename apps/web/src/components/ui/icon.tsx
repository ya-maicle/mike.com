import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 'md', className, ...props }, ref) => {
    const iconSize = typeof size === 'number' ? size : sizeMap[size]

    return (
      <IconComponent
        ref={ref}
        size={iconSize}
        className={cn('flex-shrink-0', className)}
        {...props}
      />
    )
  },
)

Icon.displayName = 'Icon'

type SvgIconProps = React.SVGProps<SVGSVGElement>

export function AudioPlayIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="11" fill="none" viewBox="0 0 9.184 16" {...props}>
      <path
        fill="currentColor"
        d="M.72 11.952V4.048c0-.826.911-1.326 1.608-.883l6.21 3.952a1.045 1.045 0 0 1 0 1.766l-6.21 3.952a1.046 1.046 0 0 1-1.608-.883"
      />
    </svg>
  )
}

export function AudioPauseIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="10" fill="none" viewBox="0 0 11 16" {...props}>
      <path
        fill="currentColor"
        d="M.303 4.136C.303 3.51.812 3 1.439 3h1.364c.627 0 1.136.509 1.136 1.136v7.728A1.137 1.137 0 0 1 2.803 13H1.439a1.136 1.136 0 0 1-1.136-1.136zm6.363 0C6.666 3.51 7.176 3 7.803 3h1.363c.628 0 1.137.509 1.137 1.136v7.728c0 .627-.509 1.136-1.137 1.136H7.803a1.136 1.136 0 0 1-1.137-1.136z"
      />
    </svg>
  )
}

export function AudioRewind15Icon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="16" height="16" fill="none" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.328 9.32H8.816l-.16 1.432q.2-.192.48-.288a1.9 1.9 0 0 1 .616-.096q.528 0 .936.232.416.231.648.64.232.408.232.92 0 .576-.255 1.016-.257.432-.721.672-.464.231-1.071.232-.553 0-1-.192a1.7 1.7 0 0 1-.712-.56 1.76 1.76 0 0 1-.313-.88h1.056a.94.94 0 0 0 .328.52q.256.192.608.192h.073q.423 0 .687-.264.264-.271.264-.704a.9.9 0 0 0-.128-.488.85.85 0 0 0-.344-.328 1 1 0 0 0-.472-.112h-.072q-.28 0-.512.12a.9.9 0 0 0-.383.368h-1L8 8.4h3.328zM6.481 14H5.45v-3.72H4.273v-.672q.537-.031.905-.368.367-.336.456-.84h.847zm1.52-11.973A5.98 5.98 0 0 1 13.54 5.76a.64.64 0 1 1-1.186.48 4.696 4.696 0 0 0-8.233-.88h1.213a.64.64 0 0 1 0 1.28H2.667a.64.64 0 0 1-.64-.64V3.334a.64.64 0 1 1 1.28 0v.974A5.96 5.96 0 0 1 8 2.028"
      />
    </svg>
  )
}

export function AudioForward15Icon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="16" height="16" fill="none" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.328 9.32H8.816l-.16 1.432q.2-.192.48-.288t.616-.096q.528 0 .936.232.416.231.648.64.232.408.232.92 0 .576-.256 1.016-.255.432-.72.672-.463.231-1.072.232-.552 0-1-.192a1.7 1.7 0 0 1-.712-.56 1.76 1.76 0 0 1-.312-.88h1.057a.94.94 0 0 0 .327.52q.255.192.608.192h.072q.424 0 .688-.264.264-.271.264-.704a.9.9 0 0 0-.127-.488.85.85 0 0 0-.345-.328 1 1 0 0 0-.472-.112h-.072q-.28 0-.512.12a.9.9 0 0 0-.384.368h-1L8 8.4h3.328zM6.481 14H5.45v-3.72H4.273v-.672q.537-.031.905-.368t.456-.84h.847zM8 2.027c1.905 0 3.6.893 4.694 2.28v-.973a.64.64 0 1 1 1.28 0V6a.64.64 0 0 1-.64.64h-2.667a.64.64 0 0 1 0-1.28h1.213a4.696 4.696 0 0 0-8.232.88.64.64 0 1 1-1.186-.48A5.97 5.97 0 0 1 8 2.027"
      />
    </svg>
  )
}

export function ArticleShareIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="24" height="17" fill="none" viewBox="0 0 16 17" {...props}>
      <path
        d="M10.001 5.247h2a3.333 3.333 0 0 1 0 6.666h-2m-4 0h-2a3.334 3.334 0 1 1 0-6.666h2M5.332 8.58h5.333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.667"
      />
    </svg>
  )
}

export function ArticleXIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="18" fill="none" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        d="M11.819 2h2.035L9.407 7.083 14.639 14h-4.097L7.334 9.805 3.662 14H1.625l4.757-5.437L1.363 2h4.2l2.901 3.834zm-.715 10.782h1.128L4.951 3.153h-1.21z"
      />
    </svg>
  )
}

export function ArticleLinkedInIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="18" fill="none" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        d="M13.1 2H2.9a.9.9 0 0 0-.9.9v10.2a.9.9 0 0 0 .9.9h10.2a.9.9 0 0 0 .9-.9V2.9a.9.9 0 0 0-.9-.9M5.6 12.2H3.8V6.8h1.8zm-.9-6.45A1.05 1.05 0 1 1 5.78 4.7 1.07 1.07 0 0 1 4.7 5.75m7.5 6.45h-1.8V9.356c0-.852-.36-1.158-.828-1.158A1.044 1.044 0 0 0 8.6 9.314a.4.4 0 0 0 0 .084V12.2H6.8V6.8h1.74v.78a1.87 1.87 0 0 1 1.62-.84c.93 0 2.016.516 2.016 2.196z"
      />
    </svg>
  )
}

export function ArticleTocChevronIcon(props: SvgIconProps) {
  return (
    <svg aria-hidden width="10" fill="none" viewBox="0 0 10 16" {...props}>
      <path
        fill="currentColor"
        d="M.21 5.352a.714.714 0 0 1 1.01 0L5 9.132l3.78-3.78a.714.714 0 0 1 1.01 1.01l-4.285 4.286a.714.714 0 0 1-1.01 0L.209 6.362a.714.714 0 0 1 0-1.01"
      />
    </svg>
  )
}
