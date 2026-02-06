import React, { useState, useEffect } from 'react';
import { pricingApi } from '../api';
import {
    Users,
    Search,
    Eye,
    ExternalLink,
    Clock,
    Calendar,
    CheckCircle2,
    X,
    TrendingUp,
    Shield
} from 'lucide-react';

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-primary" size={28} />
                        Subscription Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitor active premium users and their package usage.
                    </p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or package..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Subscriber</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Active Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredSubscribers.length > 0 ? (
                                filteredSubscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                                    {sub.users?.avatar ? (
                                                        <img src={sub.users.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        sub.users?.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{sub.users?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">{sub.users?.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                                                    {sub.package?.name || 'Unknown Package'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(sub.start_date)} - {formatDate(sub.end_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                                    <Clock size={12} />
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => fetchUsageDetails(sub)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-lg transition-all"
                                            >
                                                <Eye size={14} />
                                                View Usage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        No active matching subscribers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-gradient-to-tr from-primary to-blue-600 p-6 flex items-end">
                            <button
                                onClick={() => { setSelectedUser(null); setUsageDetails(null); }}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden border border-gray-100">
                                        {selectedUser.users?.avatar ? (
                                            <img src={selectedUser.users.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users size={32} className="text-primary" />
                                        )}
                                    </div>
                                </div>
                                <div className="text-white pb-1">
                                    <h2 className="text-xl font-extrabold">{selectedUser.users?.name}</h2>
                                    <p className="text-blue-100 text-sm opacity-90">{selectedUser.users?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {detailsLoading ? (
                                <div className="space-y-6 py-4">
                                    <div className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>
                                    <div className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
                                </div>
                            ) : usageDetails ? (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Package Name</p>
                                            <p className="text-lg font-extrabold text-blue-900">{selectedUser.package?.name}</p>
                                        </div>
                                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Status</p>
                                            <div className="flex items-center gap-1.5 text-green-700 font-extrabold">
                                                <CheckCircle2 size={16} />
                                                <span>Active Subscriber</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Section */}
                                    <div>
                                        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-primary" />
                                            Advertisement Slot Usage
                                        </h3>

                                        <div className="space-y-3">
                                            {usageDetails.limits?.map((limit, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl transition-all hover:shadow-md hover:bg-white border border-gray-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-gray-700">{limit.vehicle_types?.type_name}</span>
                                                        <span className="text-xs font-extrabold px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-500 uppercase">
                                                            {limit.is_unlimited ? 'Unlimited' : `${limit.quantity} Total Slots`}
                                                        </span>
                                                    </div>

                                                    <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${limit.is_unlimited ? 'bg-indigo-500' : 'bg-primary'}`}
                                                            style={{ width: limit.is_unlimited ? '100%' : `${(limit.used_count / limit.quantity) * 100}%` }}
                                                        ></div>
                                                    </div>

                                                    <div className="flex justify-between mt-2">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <CheckCircle2 size={12} className="text-primary" />
                                                            <span className="text-gray-500">Used: <span className="font-bold text-gray-900">{limit.used_count}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Clock size={12} className="text-blue-500" />
                                                            <span className="text-gray-500">Remaining: <span className="font-extrabold text-blue-600">{limit.is_unlimited ? '∞' : limit.remaining_count}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features Section */}
                                    <div className="pt-2">
                                        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Shield size={16} className="text-primary" />
                                            Premium Controls
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(usageDetails.config || {}).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-3 px-4 py-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50 text-indigo-900">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{key.replace('_', ' ')}</p>
                                                        <p className="text-sm font-bold truncate">{val}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-500 italic">
                                    No usage details available for this subscription.
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
