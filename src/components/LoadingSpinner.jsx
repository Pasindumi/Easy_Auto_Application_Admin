import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
    size = 'md',
    variant = 'primary',
    overlay = false,
    fullScreen = false,
    message = '',
}) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const variants = {
        primary: 'text-primary',
        white: 'text-white',
        gray: 'text-gray-400',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={clsx('animate-spin', sizes[size], variants[variant])} />
            {message && (
                <p className={clsx('text-sm font-medium', variants[variant])}>
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                {spinner}
            </div>
        );
    }

    return spinner;
}
