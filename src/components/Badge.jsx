import React from 'react';
import clsx from 'clsx';

export default function Badge({ 
    children, 
    variant = 'default',
    size = 'md',
    pulse = false,
    className = '',
    ...props 
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        primary: 'bg-primary/10 text-primary',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 rounded-full font-semibold',
                variants[variant],
                sizes[size],
                pulse && 'animate-pulse-slow',
                className
            )}
            {...props}
        >
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
            )}
            {children}
        </span>
    );
}
