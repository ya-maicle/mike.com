import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', style, children, ...props }, ref) => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.875rem',
      lineHeight: 1.25,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'filter 120ms ease',
      borderWidth: 1,
      borderStyle: 'solid',
    }

    const variants: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-background)',
        borderColor: 'transparent',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: 'var(--color-foreground)',
        borderColor: 'var(--color-muted)',
      },
    }

    return (
      <button
        ref={ref}
        style={{
          ...base,
          ...(variants[variant] || {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(0.98)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none'
        }}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
