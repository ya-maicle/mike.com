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

type GoogleIconProps = SvgIconProps & {
  variant?: 'brand' | 'monochrome'
}

export function GoogleIcon({ variant = 'monochrome', ...props }: GoogleIconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...props}>
      {variant === 'brand' ? (
        <>
          <path
            fill="#4285F4"
            d="M21.35 12.04c0-.71-.06-1.4-.18-2.04H12v3.87h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.15c1.84-1.7 2.9-4.2 2.9-7.28"
          />
          <path
            fill="#34A853"
            d="M12 21.5c2.62 0 4.83-.87 6.44-2.36l-3.15-2.51c-.87.58-1.99.93-3.29.93-2.53 0-4.67-1.71-5.44-4.01H3.31v2.59A9.73 9.73 0 0 0 12 21.5"
          />
          <path
            fill="#FBBC05"
            d="M6.56 13.55a5.85 5.85 0 0 1 0-3.74V7.22H3.31a9.75 9.75 0 0 0 0 8.92l3.25-2.59"
          />
          <path
            fill="#EA4335"
            d="M12 5.8c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.36 9.36 0 0 0 12 1.5 9.73 9.73 0 0 0 3.31 7.22l3.25 2.59C7.33 7.51 9.47 5.8 12 5.8"
          />
        </>
      ) : (
        <path
          fill="currentColor"
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        />
      )}
    </svg>
  )
}
