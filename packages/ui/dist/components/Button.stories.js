import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './Button';
const meta = {
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        children: 'Button',
    },
    parameters: {
        a11y: { disable: false },
        layout: 'centered',
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'secondary', 'destructive', 'success', 'warning', 'info', 'outline', 'ghost'],
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'icon'],
        },
        loading: {
            control: { type: 'boolean' },
        },
    },
};
export default meta;
export const Default = {
    name: 'Default',
    args: {
        variant: 'default',
    },
};
export const Secondary = {
    name: 'Secondary',
    args: {
        variant: 'secondary',
    },
};
export const Outline = {
    name: 'Outline',
    args: {
        variant: 'outline',
    },
};
export const Ghost = {
    name: 'Ghost',
    args: {
        variant: 'ghost',
    },
};
export const Destructive = {
    name: 'Destructive',
    args: {
        variant: 'destructive',
    },
};
export const Success = {
    name: 'Success',
    args: {
        variant: 'success',
    },
};
export const Warning = {
    name: 'Warning',
    args: {
        variant: 'warning',
    },
};
export const Info = {
    name: 'Info',
    args: {
        variant: 'info',
    },
};
export const Small = {
    name: 'Small',
    args: {
        size: 'sm',
    },
};
export const Large = {
    name: 'Large',
    args: {
        size: 'lg',
    },
};
export const Icon = {
    name: 'Icon',
    args: {
        size: 'icon',
        children: '✓',
    },
};
export const Loading = {
    name: 'Loading',
    args: {
        loading: true,
    },
};
export const WithIcons = {
    name: 'With Icons',
    args: {
        leftIcon: '←',
        rightIcon: '→',
        children: 'Button with icons',
    },
};
export const AllVariants = {
    name: 'All Variants',
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(Button, { variant: "default", children: "Default" }), _jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "outline", children: "Outline" }), _jsx(Button, { variant: "ghost", children: "Ghost" }), _jsx(Button, { variant: "destructive", children: "Destructive" })] })),
};
export const AllSizes = {
    name: 'All Sizes',
    render: () => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { size: "sm", children: "Small" }), _jsx(Button, { size: "md", children: "Medium" }), _jsx(Button, { size: "lg", children: "Large" }), _jsx(Button, { size: "icon", children: "\u2713" })] })),
};
