import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Mail,
    Phone,
    Calendar,
    Car,
    FileText,
    MoreVertical,
    ExternalLink,
    UserCircle,
    BadgeCheck
} from 'lucide-react';
import { dashApi } from '../api';
import clsx from 'clsx';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await dashApi.getUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage and monitor all registered users and their activities.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col items-center px-4 py-1 border-r border-gray-100">
                        <span className="text-xl font-black text-primary">{users.length}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Users</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-1">
                        <span className="text-xl font-black text-green-600">
                            {users.filter(u => u.role === 'USER').length}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Standard Users</span>
                    </div>
                </div>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 p-0 pr-8"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">User</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">User Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Role & Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Joined Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Ad Activity</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8">
                                            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border border-white shadow-sm overflow-hidden flex-shrink-0">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={24} />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                                        {user.name || 'Anonymous User'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Mail size={12} className="text-gray-400" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border",
                                                    user.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                        user.role === 'ADMIN' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                            user.role === 'MODERATOR' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-gray-50 text-gray-600 border-gray-100"
                                                )}>
                                                    <BadgeCheck size={12} />
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(user.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1 text-primary font-bold">
                                                        <Car size={14} />
                                                        <span className="text-sm">{user.stats?.posted || 0}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Posted</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-100"></div>
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1 text-gray-500 font-bold">
                                                        <FileText size={14} />
                                                        <span className="text-sm">{user.stats?.drafted || 0}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Drafts</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-blue-500/10 active:scale-95">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                <Users size={48} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-900 font-bold text-lg">No users found</p>
                                                <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
