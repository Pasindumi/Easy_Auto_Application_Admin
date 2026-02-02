import React from 'react';
import clsx from 'clsx';

export default function EmptyState({ 
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    className = '',
}) {
    return (
        <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            {Icon && (
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-6 max-w-md">{description}</p>
            )}
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-smooth font-medium"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
