import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    Settings,
    LogOut,
    ShieldCheck,
    Menu,
    X,
    Tags,
    Sliders,
    Percent,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { logout, admin } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Sell Ads', path: '/ads', icon: Car },
        { name: 'Vehicle Types', path: '/vehicle-types', icon: Tags },
        { name: 'Packages & Pricing', path: '/pricing', icon: Sliders },
        { name: 'Discounts & Offers', path: '/discounts', icon: Percent },
        { name: 'System Limits', path: '/settings/limits', icon: Settings },
    ];

    if (admin?.role === 'SUPER_ADMIN') {
        // navItems.push({ name: 'Admins', path: '/admins', icon: ShieldCheck });
    }

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                clsx(
                    "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 mb-1.5",
                    isActive
                        ? "bg-primary text-white shadow-lg shadow-blue-500/30 font-semibold"
                        : "text-gray-500 hover:bg-blue-50 hover:text-primary font-medium"
                )
            }
            onClick={() => setMobileOpen(false)}
        >
            <div className="flex items-center gap-3">
                <item.icon size={20} className={clsx("transition-colors", ({ isActive }) => isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                <span>{item.name}</span>
            </div>
            {/* <ChevronRight size={16} className={clsx("opacity-0 group-hover:opacity-100 transition-opacity", ({isActive}) => isActive ? "text-white opacity-100" : "text-primary")} /> */}
        </NavLink>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100 transition-transform duration-300 ease-out md:translate-x-0 shadow-2xl shadow-gray-200/50 flex flex-col",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 md:p-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                                EA
                            </div>
                            <div>
                                <span className="text-xl font-extrabold text-gray-800 tracking-tight block">Easy Auto</span>
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Admin Panel</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-1">
                        <div className="px-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Main Menu</div>
                        {navItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {admin?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-blue-500 font-medium truncate">
                                    {admin?.role || 'Moderator'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
