import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from '../utils/cva';
import { cn } from '../utils/cn';
import { forwardRef } from 'react';
const buttonVariants = cva(
// Base styles (always applied)
'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            outline: 'border bg-background hover:bg-accent hover:text-accent-foreground',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            success: 'bg-success text-success-foreground hover:bg-success/90',
            warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
            info: 'bg-info text-info-foreground hover:bg-info/90',
        },
        size: {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4',
            lg: 'h-11 px-8',
            icon: 'h-10 w-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
    },
});
export const Button = forwardRef(({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (_jsx("button", { ref: ref, className: cn(buttonVariants({ variant, size, className })), disabled: disabled || loading, ...props, children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }), children] })) : (_jsxs(_Fragment, { children: [leftIcon && _jsx("span", { className: "mr-2", children: leftIcon }), children, rightIcon && _jsx("span", { className: "ml-2", children: rightIcon })] })) }));
});
Button.displayName = 'Button';
// Export variant helper for compound components
export { buttonVariants };
