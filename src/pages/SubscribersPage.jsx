import React, { useState, useEffect } from 'react';
import { pricingApi } from '../api';
import {
    Users,
    Eye,
    Clock,
    Calendar,
    CheckCircle2,
    X,
    TrendingUp,
    Shield,
    CreditCard
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const SubscribersPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [usageDetails, setUsageDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await pricingApi.getSubscribers();
            if (res.data.success) {
                setSubscribers(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsageDetails = async (sub) => {
        try {
            setDetailsLoading(true);
            setSelectedUser(sub);
            const res = await pricingApi.getSubscriberUsage(sub.user_id, sub.package_id);
            if (res.data.success) {
                setUsageDetails(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching usage details:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredSubscribers = subscribers.filter(sub => {
        const term = searchTerm.toLowerCase();
        const nameMatch = sub.users?.name?.toLowerCase().includes(term) || false;
        const emailMatch = sub.users?.email?.toLowerCase().includes(term) || false;
        const packageMatch = sub.package?.name?.toLowerCase().includes(term) || false;
        return nameMatch || emailMatch || packageMatch;
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const columns = [
        {
            header: 'Subscriber',
            accessor: 'users',
            render: (sub) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-admin-bg flex items-center justify-center text-primary font-bold border border-admin-border shadow-sm overflow-hidden flex-shrink-0">
                        {sub.users?.avatar ? (
                            <img src={sub.users.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            sub.users?.name?.charAt(0) || <Users size={20} />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {sub.users?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">{sub.users?.email || 'No Email'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Active Plan',
            accessor: 'package',
            render: (sub) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-admin-bg text-primary border border-admin-border uppercase tracking-wide">
                    {sub.package?.name || 'Unknown Package'}
                </span>
            )
        },
        {
            header: 'Period',
            accessor: 'start_date',
            render: (sub) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{formatDate(sub.start_date)} - {formatDate(sub.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Active
                    </div>
                </div>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (sub) => (
                <button
                    onClick={() => fetchUsageDetails(sub)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-lg transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                >
                    <Eye size={14} /> View Usage
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Subscribers"
                subtitle="Monitor active premium users and subscriptions."
                breadcrumbs={['Dashboard', 'Subscribers']}
                actions={
                    <div className="flex items-center gap-2 px-4 py-2 bg-admin-bg text-primary rounded-xl border border-admin-border shadow-sm">
                        <CreditCard size={16} />
                        <span className="text-sm font-bold">{subscribers.length} Active Plans</span>
                    </div>
                }
            />

            <DataTable
                columns={columns}
                data={filteredSubscribers}
                loading={loading}
                onSearch={setSearchTerm}
                searchPlaceholder="Search subscribers..."
                emptyState={{
                    title: "No active subscribers",
                    description: "Users with active subscription packages will appear here."
                }}
            />

            {/* Premium Usage Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in custom-scrollbar">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up border border-admin-border">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-gradient-to-r from-gray-900 to-blue-900 p-8 flex items-end">
                            <button
                                onClick={() => { setSelectedUser(null); setUsageDetails(null); }}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-5 relative z-10 translate-y-4">
                                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl rotate-3">
                                    <div className="w-full h-full rounded-xl bg-admin-bg flex items-center justify-center overflow-hidden border border-admin-border">
                                        {selectedUser.users?.avatar ? (
                                            <img src={selectedUser.users.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-400">{selectedUser.users?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-white pb-2">
                                    <h2 className="text-2xl font-black">{selectedUser.users?.name}</h2>
                                    <p className="text-white/70 text-sm font-medium">{selectedUser.users?.email}</p>
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        </div>

                        {/* Modal Body */}
                        <div className="pt-10 px-8 pb-8">
                            {detailsLoading ? (
                                <div className="space-y-6 py-4 animate-pulse">
                                    <div className="h-24 bg-admin-bg animate-pulse rounded-2xl"></div>
                                    <div className="h-48 bg-admin-bg animate-pulse rounded-2xl"></div>
                                </div>
                            ) : usageDetails ? (
                                <div className="space-y-8">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Package Plan</p>
                                            <p className="text-xl font-black text-gray-900">{selectedUser.package?.name}</p>
                                        </div>
                                        <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Current Status</p>
                                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                                <CheckCircle2 size={20} />
                                                <span>Active Subscriber</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Bars */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-gray-900" />
                                            Package Usage
                                        </h3>

                                        <div className="space-y-4">
                                            {usageDetails.limits?.map((limit, idx) => (
                                                <div key={idx} className="bg-white border border-admin-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="font-bold text-gray-900 text-lg">{limit.vehicle_types?.type_name}</span>
                                                        <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase ${limit.is_unlimited
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-admin-bg text-primary'
                                                            }`}>
                                                            {limit.is_unlimited ? 'Unlimited' : `${limit.quantity} Slots`}
                                                        </span>
                                                    </div>

                                                    {!limit.is_unlimited && (
                                                        <>
                                                            <div className="h-3 bg-admin-bg rounded-full overflow-hidden mb-3">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{ width: `${(limit.used_count / limit.quantity) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500 font-medium">Used: <span className="text-gray-900 font-bold">{limit.used_count}</span></span>
                                                                <span className="text-gray-500 font-medium">Remaining: <span className="text-primary font-bold">{limit.remaining_count}</span></span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {limit.is_unlimited && (
                                                        <div className="flex items-center gap-2 text-sm text-purple-600 font-bold">
                                                            <CheckCircle2 size={16} /> Unlimited posts allowed
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional Features */}
                                    <div className="bg-admin-bg rounded-2xl p-6 border border-admin-border">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Shield size={16} className="text-gray-900" />
                                            Features & Limits
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(usageDetails.config || {}).map(([key, val]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</span>
                                                    <span className="font-bold text-gray-900">{String(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-gray-400">
                                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                    No detailed usage data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribersPage;
