import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import clsx from 'clsx';

export default function Layout() {
    const { admin, loading } = useAuth();
    const { isCollapsed, setMobileOpen, mobileOpen } = useSidebar();

    if (loading) {
        return <LoadingSpinner fullScreen message="Authenticating..." />;
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-admin-bg flex">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'animate-slide-down font-medium text-sm',
                    duration: 4000,
                    style: {
                        borderRadius: '12px',
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />

            {/* Sidebar */}
            <Sidebar />

            <div className={clsx(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isCollapsed ? "md:ml-20" : "md:ml-72"
            )}>
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-900 text-lg tracking-tight">Easy Auto Admin</span>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 pt-6 md:pt-8 w-full max-w-[1600px] mx-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
}
