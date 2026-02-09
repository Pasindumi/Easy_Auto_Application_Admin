import React, { useState, useEffect } from 'react';
import {
    Users,
    Mail,
    Calendar,
    Car,
    FileText,
    MoreVertical,
    UserCircle,
    BadgeCheck,
    Shield
    Ban,
    ShieldAlert,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { dashApi } from '../api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Ban Modal State
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [banDuration, setBanDuration] = useState('24');
    const [banReason, setBanReason] = useState('');
    const [processing, setProcessing] = useState(false);

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

    const handleBan = async () => {
        if (!selectedUser) return;
        try {
            setProcessing(true);
            const response = await dashApi.banUser(selectedUser.id, {
                durationHours: banDuration,
                reason: banReason
            });
            if (response.data.success) {
                setShowBanModal(false);
                setBanReason('');
                fetchUsers();
            }
        } catch (error) {
            console.error("Error banning user:", error);
            alert("Failed to ban user");
        } finally {
            setProcessing(false);
        }
    };

    const handleBlock = async (userId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY block this user? They will never be able to log in again.")) return;
        try {
            const response = await dashApi.blockUser(userId);
            if (response.data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error blocking user:", error);
            alert("Failed to block user");
        }
    };

    const handleUnban = async (userId) => {
        try {
            const response = await dashApi.unbanUser(userId);
            if (response.data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error unbanning user:", error);
            alert("Failed to reset user status");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || (user.status || 'ACTIVE') === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const columns = [
        {
            header: 'User Profile',
            accessor: 'name',
            render: (user) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm overflow-hidden flex-shrink-0">
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0) || <UserCircle size={20} />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {user.name || 'Anonymous User'}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={12} className="text-gray-400" />
                            {user.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (user) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${
                    user.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-600 border-purple-100" :
                    user.role === 'ADMIN' ? "bg-blue-50 text-blue-600 border-blue-100" :
                    user.role === 'MODERATOR' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-gray-50 text-gray-600 border-gray-100"
                }`}>
                    {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? <Shield size={10} /> : <BadgeCheck size={10} />}
                    {user.role}
                </span>
            )
        },
        {
            header: 'Joined',
            accessor: 'created_at',
            render: (user) => (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Activity',
            align: 'center',
            render: (user) => (
                <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900 text-sm">{user.stats?.posted || 0}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Ads</span>
                    </div>
                    <div className="w-px h-6 bg-gray-100"></div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-500 text-sm">{user.stats?.drafted || 0}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Drafts</span>
                    <div className="flex flex-col items-center px-4 py-1">
                        <span className="text-xl font-black text-red-600">
                            {users.filter(u => u.status === 'BANNED' || u.status === 'BLOCKED').length}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Restricted</span>
                    </div>
                </div>
            )
        },
        {
            header: '',
            align: 'right',
            width: '50px',
            render: () => (
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title="User Management" 
                subtitle="Manage and monitor all registered users."
                breadcrumbs={['Dashboard', 'Users']}
                actions={
                    <div className="hidden sm:flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col items-center px-4 py-1 border-r border-gray-100">
                            <span className="text-xl font-black text-primary">{users.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total</span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-1">
                            <span className="text-xl font-black text-green-600">
                                {users.filter(u => u.role === 'USER').length}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Users</span>
                        </div>
                    </div>
                }
            />

            <DataTable 
                columns={columns}
                data={filteredUsers}
                loading={loading}
                onSearch={setSearchTerm}
                searchPlaceholder="Search users..."
                actions={
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-gray-50 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">User</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                }
                emptyState={{
                    title: "No users found",
                    description: "Try adjusting filters or invite new users."
                }}
            />

                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <ShieldAlert size={16} className="text-gray-400" />
                        <select
                            className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 p-0 pr-8"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="BANNED">Banned</option>
                            <option value="BLOCKED">Blocked</option>
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
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
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
                                                <div className="flex items-center gap-2">
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

                                                    {/* Status Badge */}
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border",
                                                        (user.status === 'ACTIVE' || !user.status) ? "bg-green-50 text-green-600 border-green-100" :
                                                            user.status === 'BANNED' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                                "bg-red-50 text-red-600 border-red-100"
                                                    )}>
                                                        {(user.status === 'ACTIVE' || !user.status) ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                        {user.status || 'ACTIVE'}
                                                    </span>
                                                </div>
                                                {user.status === 'BANNED' && user.ban_expires_at && (
                                                    <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                                                        <Clock size={10} />
                                                        Till: {new Date(user.ban_expires_at).toLocaleString()}
                                                    </span>
                                                )}
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
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'BANNED' || user.status === 'BLOCKED' ? (
                                                    <button
                                                        onClick={() => handleUnban(user.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all title='Revoke Restrictions'"
                                                    >
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                                                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                                                            title="Ban User"
                                                        >
                                                            <Clock size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBlock(user.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Block User"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-blue-500/10 active:scale-95">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
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

            {/* Ban Modal */}
            {showBanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 scale-in-center transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Ban User</h3>
                                <p className="text-gray-500 font-medium">{selectedUser?.name || selectedUser?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ban Duration</label>
                                <select
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-gray-700 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={banDuration}
                                    onChange={(e) => setBanDuration(e.target.value)}
                                >
                                    <option value="1">1 Hour</option>
                                    <option value="12">12 Hours</option>
                                    <option value="24">1 Day</option>
                                    <option value="72">3 Days</option>
                                    <option value="168">1 Week</option>
                                    <option value="720">1 Month</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Ban</label>
                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-gray-700 font-bold focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                                    placeholder="Explain why this user is being banned..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setShowBanModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 active:scale-95 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBan}
                                    disabled={processing}
                                    className="flex-1 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    {processing ? 'Banning...' : 'Apply Ban'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
