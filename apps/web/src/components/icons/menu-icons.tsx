import * as React from 'react'
import { cn } from '@/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export function SideMenuClosed({ size = 22, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16.2002 0C19.4032 0.000237586 21.9999 2.59679 22 5.7998V12.2002C21.9999 15.4032 19.4032 17.9998 16.2002 18H5.7998C2.59671 17.9999 0.000105657 15.4033 0 12.2002V5.7998C0.00010566 2.59671 2.59671 0.000105653 5.7998 0H16.2002ZM5.7998 2C3.70128 2.00011 2.00011 3.70128 2 5.7998V12.2002C2.00011 14.2987 3.70128 15.9999 5.7998 16H16.2002C18.2986 15.9998 19.9999 14.2986 20 12.2002V5.7998C19.9999 3.70136 18.2986 2.00024 16.2002 2H5.7998ZM6 3.2002C6.55217 3.20033 7 3.64799 7 4.2002V13.7998C6.99987 14.3519 6.55209 14.7997 6 14.7998C5.4478 14.7998 5.00013 14.352 5 13.7998V4.2002C5 3.64791 5.44772 3.2002 6 3.2002Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SideMenuOpen({ size = 22, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16.2002 0C19.4031 0.000369508 21.9999 2.59687 22 5.7998V12.2002C21.9999 15.4031 19.4031 17.9996 16.2002 18H5.7998C2.59671 17.9999 0.000105662 15.4033 0 12.2002V5.7998C0.000105664 2.59671 2.59671 0.000105653 5.7998 0H16.2002ZM9.39941 16H16.2002C18.2985 15.9996 19.9999 14.2986 20 12.2002V5.7998C19.9999 3.70144 18.2985 2.00037 16.2002 2H9.39941V16ZM5.7998 2C3.70128 2.00011 2.00011 3.70128 2 5.7998V12.2002C2.00011 14.2987 3.70128 15.9999 5.7998 16H7.39941V2H5.7998Z"
        fill="currentColor"
      />
    </svg>
  )
}
