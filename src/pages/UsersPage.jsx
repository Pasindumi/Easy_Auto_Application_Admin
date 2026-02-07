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
} from 'lucide-react';
import { dashApi } from '../api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

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
        </div>
    );
}
