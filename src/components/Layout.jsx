import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

export default function Layout() {
    const { admin, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" message="Loading..." />
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'animate-slide-down',
                }}
            />
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth"
                >
                    <Menu size={24} />
                </button>
                <span className="font-bold text-gray-800">Easy Auto Admin</span>
            </div>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen pt-16 md:pt-0 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
