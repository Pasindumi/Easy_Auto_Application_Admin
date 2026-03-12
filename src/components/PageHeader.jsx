import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
    return (
        <div className="bg-white rounded-3xl shadow-lg border border-admin-border p-6 mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-primary' : ''}>
                                        {crumb}
                                    </span>
                                    {index < breadcrumbs.length - 1 && (
                                        <ChevronRight size={14} className="text-gray-400" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <h1 className="text-3xl font-black bg-gradient-to-r from-secondary via-primary to-blue-400 bg-clip-text text-transparent mb-1">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-gray-500 font-medium">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
