"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const logotypeVariants = cva(
  "inline-flex items-center gap-2 transition-colors",
  {
    variants: {
      size: {
        xs: "h-4 text-xs",
        sm: "h-5 text-sm",
        md: "h-6 text-base font-medium",
        lg: "h-8 text-lg font-semibold tracking-tight",
        xl: "h-10 text-xl font-semibold tracking-tight",
        "2xl": "h-12 text-2xl font-bold tracking-tight",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        destructive: "text-destructive",
        outline: "text-foreground border border-border rounded-md p-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const logoSizes = {
  xs: { width: 20, height: 11 },
  sm: { width: 24, height: 14 },
  md: { width: 30, height: 17 },
  lg: { width: 40, height: 23 },
  xl: { width: 48, height: 27 },
  "2xl": { width: 60, height: 34 },
}

interface LogotypeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logotypeVariants> {
  showText?: boolean
  text?: string
  href?: string
  as?: "div" | "a" | "button"
}

const LogoMark = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { size: keyof typeof logoSizes }
>(({ size, className, ...props }, ref) => {
  const dimensions = logoSizes[size]
  
  return (
    <svg
      ref={ref}
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 60 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0 transition-colors", className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 7.32746L2.62464 10.8128V30.3217L0 34H16.0077V30.273V8.85173C16.0077 8.85173 17.6244 7.32746 20.438 7.32746C23.2505 7.32746 23.2033 10.4492 23.2033 10.4492L23.156 30.3682L20.438 34H39.2346L36.6089 30.2242V8.85173C36.6089 8.85173 37.6641 7.32746 40.8288 7.32746C43.9923 7.32746 43.8516 10.4492 43.8516 10.4492L43.7819 30.273V34H60L57.1414 30.1998V8.7797C57.1414 7.54471 56.6486 0.501896 48.8444 0.501896C41.0391 0.501896 36.2579 6.52814 36.2579 6.52814C36.2579 6.52814 35.6965 0.501896 28.1027 0.501896C20.5089 0.501896 15.4216 6.72216 15.4216 6.72216L15.0931 6.40731L16.1247 0L0 7.32746Z"
        fill="currentColor"
      />
    </svg>
  )
})
LogoMark.displayName = "LogoMark"

const Logotype = React.forwardRef<
  HTMLDivElement,
  LogotypeProps
>(({ 
  className, 
  size = "md", 
  variant = "default", 
  showText = true, 
  text = "Maicle",
  href,
  as = "div",
  ...props 
}, ref) => {
  const Component = as === "a" ? "a" : as === "button" ? "button" : "div"
  const linkProps = href ? { href } : {}
  
  return (
    <Component
      className={cn(logotypeVariants({ size, variant, className }))}
      ref={ref as React.Ref<HTMLElement>}
      {...linkProps}
      {...props}
    >
      <LogoMark size={size!} />
      {showText && (
        <span className="font-inherit leading-none">{text}</span>
      )}
    </Component>
  )
})
Logotype.displayName = "Logotype"

export { Logotype, LogoMark, logotypeVariants, type LogotypeProps }