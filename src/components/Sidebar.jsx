import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import clsx from 'clsx';
import {
    LayoutDashboard,
    Car,
    Tag,
    Users,
    CreditCard,
    Percent,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Key
} from 'lucide-react';

export default function Sidebar() {
    const { logout, admin } = useAuth();
    const { isCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
        { name: 'Ad Management', path: '/ads', icon: Car },
        { name: 'Rental Management', path: '/rentals', icon: Key },
        { name: 'Vehicle Types', path: '/vehicle-types', icon: Tag },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Subscribers', path: '/subscribers', icon: Shield },
        { name: 'Pricing & Plans', path: '/pricing', icon: CreditCard },
        { name: 'Discounts', path: '/discounts', icon: Percent },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'System Limits', path: '/settings/limits', icon: Settings },
    ];

    const bottomItems = [
        { name: 'System Settings', path: '/settings/limits', icon: Settings },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
                clsx(
                    "relative group flex items-center gap-3 px-3 py-3 mx-2 rounded-xl transition-all duration-300 ease-out outline-none",
                    isActive
                        ? "bg-primary text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary",
                    isCollapsed ? "justify-center" : "justify-start"
                )
            }
        >
            {({ isActive }) => (
                <>
                    {/* Icon */}
                    <div className={clsx(
                        "relative z-10 flex items-center justify-center transition-transform duration-300",
                        isCollapsed && "group-hover:scale-110"
                    )}>
                        <item.icon
                            size={22}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={clsx(
                                "transition-colors",
                                isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                            )}
                        />
                    </div>

                    {/* Text Label - Hidden when collapsed */}
                    <span
                        className={clsx(
                            "font-semibold tracking-wide whitespace-nowrap transition-all duration-300 origin-left",
                            isCollapsed
                                ? "w-0 opacity-0 overflow-hidden scale-90 hidden md:block"
                                : "hidden md:block w-auto opacity-100 scale-100"
                        )}
                    >
                        {item.name}
                    </span>

                    {/* Mobile Text - Only visible on mobile */}
                    <span className="md:hidden font-semibold">{item.name}</span>

                    {/* Active Indicator Dot (Collapsed) */}
                    {isActive && isCollapsed && (
                        <div className="absolute right-2 top-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse md:block hidden"></div>
                    )}

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl hidden md:block pointer-events-none">
                            {item.name}
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    )}
                </>
            )}
        </NavLink>
    );

    return (
        <aside
            className={clsx(
                "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 shadow-2xl shadow-gray-200/50 transition-all duration-300 ease-in-out flex flex-col",
                isCollapsed ? "w-20" : "w-72",
                mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
            )}
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-5 border-b border-admin-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className={clsx("flex items-center gap-3 transition-all duration-300", isCollapsed ? "justify-center w-full" : "")}>
                    <div className="relative w-10 h-10 flex-shrink-0 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group cursor-pointer overflow-hidden">
                        <span className="font-black text-lg tracking-tight">EA</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className={clsx(
                        "flex flex-col overflow-hidden transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-40 opacity-100"
                    )}>
                        <h1 className="font-extrabold text-gray-900 text-lg leading-tight tracking-tight">Easy Auto</h1>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Nav Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-8 scrollbar-thin">
                <nav className="space-y-1">
                    <div className={clsx(
                        "px-5 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300",
                        isCollapsed ? "text-center" : "text-left"
                    )}>
                        {isCollapsed ? '•••' : 'Main Menu'}
                    </div>
                    {navItems.map((item) => <NavItem key={item.path} item={item} />)}
                </nav>

                <nav className="space-y-1">
                    <div className={clsx(
                        "px-5 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300",
                        isCollapsed ? "text-center" : "text-left"
                    )}>
                        {isCollapsed ? '•••' : 'System'}
                    </div>
                    {bottomItems.map((item) => <NavItem key={item.path} item={item} />)}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                <button
                    onClick={toggleSidebar}
                    className={clsx(
                        "hidden md:flex items-center justify-center w-full p-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-sm hover:shadow-md mb-3",
                    )}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className={clsx(
                    "flex items-center gap-1 p-1 rounded-xl transition-all duration-300",
                    isCollapsed ? "justify-center flex-col" : "bg-white border border-gray-100 shadow-sm"
                )}>

                    <Link
                        to="/profile"
                        className={clsx(
                            "flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-1 min-w-0 group",
                            isCollapsed && "justify-center p-0 hover:bg-transparent"
                        )}
                        title="View Profile"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white flex-shrink-0 group-hover:ring-primary/20 transition-all">
                            {admin?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 overflow-hidden text-left">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{admin?.name || 'Admin'}</p>
                                <p className="text-[10px] font-medium text-gray-500 truncate">{admin?.email || 'admin@easyauto.com'}</p>
                            </div>
                        )}
                    </Link>

                    {!isCollapsed && (
                        <button
                            onClick={logout}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>

                {/* Logout Button for Collapsed Mode (Desktop) and Mobile */}
                {isCollapsed && (
                    <button
                        onClick={logout}
                        className="w-full mt-3 p-2 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </aside>
    );
}
