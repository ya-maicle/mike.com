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
