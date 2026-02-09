import React from 'react';
import clsx from 'clsx';

export default function Card({ 
    children, 
    variant = 'default', 
    hover = false,
    padding = 'md',
    className = '',
    ...props 
}) {
    const variants = {
        default: 'bg-white border border-gray-100 shadow-sm',
        gradient: 'gradient-primary text-white border-0 shadow-primary',
        glass: 'glass border border-white/30',
        bordered: 'bg-white border-2 border-primary/20',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={clsx(
                'rounded-2xl transition-smooth',
                variants[variant],
                paddings[padding],
                hover && 'hover-lift cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
