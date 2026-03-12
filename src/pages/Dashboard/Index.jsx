import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashApi, adsApi } from '../../api';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Car,
    CheckCircle,
    Clock,
    Download,
    Eye,
    MoreVertical,
    PieChart as PieChartIcon,
    Plus,
    RefreshCw,
    Server,
    Sparkles,
    TrendingUp,
    Users,
    XCircle,
    DollarSign,
    ArrowRight
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = async () => {
        try {
            setRefreshing(true);
            setError(null);

            // Parallel Fetching for performance
            const [statsRes, adsRes, usersRes] = await Promise.allSettled([
                dashApi.getStats(),
                adsApi.getAll(''),
                dashApi.getUsers()
            ]);

            // Helper to get data safely
            const getVal = (res) => {
                if (res.status !== 'fulfilled') return null;
                const payload = res.value?.data;
                // Support both { success: true, data: [...] } and direct [...] or {...} responses
                if (payload && typeof payload === 'object') {
                    if (Array.isArray(payload)) return payload; // Direct array
                    if ('data' in payload) return payload.data; // Nested data
                    return payload; // Direct object
                }
                return null;
            };

            const platformStats = getVal(statsRes) || {};
            // Ensure lists are arrays
            const adsList = Array.isArray(getVal(adsRes)) ? getVal(adsRes) : [];
            const usersList = Array.isArray(getVal(usersRes)) ? getVal(usersRes) : [];

            // 1. Calculate Ad Stats
            const adStats = {
                total: adsList.length,
                active: adsList.filter(ad => ad.status === 'ACTIVE').length,
                pending: adsList.filter(ad => ad.status === 'PENDING').length,
                expired: adsList.filter(ad => ad.status === 'EXPIRED').length,
                sold: adsList.filter(ad => ad.status === 'SOLD').length,
            };

            // 2. Process Monthly Growth
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = d.toLocaleString('default', { month: 'short' });
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;

                months.push({
                    month: monthName,
                    key: monthKey,
                    ads: 0,
                    users: 0
                });
            }

            adsList.forEach(ad => {
                if (ad.created_at) {
                    const d = new Date(ad.created_at);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    const match = months.find(m => m.key === key);
                    if (match) match.ads++;
                }
            });

            usersList.forEach(user => {
                if (user.created_at) {
                    const d = new Date(user.created_at);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    const match = months.find(m => m.key === key);
                    if (match) match.users++;
                }
            });

            // 3. Process Activity
            const activity = [...adsList]
                .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                .slice(0, 5)
                .map(ad => ({
                    type: ad.status === 'ACTIVE' ? 'approved' : ad.status === 'PENDING' ? 'new' : 'expired',
                    vehicle: ad.title || 'Untitled Vehicle',
                    user: ad.seller?.name || 'Unknown User',
                    time: timeAgo(ad.updated_at || ad.created_at),
                    status: ad.status?.toLowerCase() || 'unknown',
                    id: ad.id
                }));

            setStats({
                ads: adStats,
                vehicleTypes: platformStats.vehicleTypes || 0,
                brands: platformStats.brands || 0,
                users: usersList.length || 0
            });
            setMonthlyData(months);
            setRecentActivity(activity);
            setLastUpdated(new Date());

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            setError('Failed to synchronize dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (seconds < 0) return "Just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    // ... Components ...
    const PremiumStatCard = ({ title, value, icon: Icon, gradient, change, trend, description, to, actionLabel }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-admin-border hover:border-primary/20 hover:-translate-y-1 h-full flex flex-col justify-between"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`}></div>
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                                {trend && change && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${trend === 'up' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        {change}
                                    </span>
                                )}
                            </div>
                            <p className="text-4xl font-black text-gray-900 mb-1">{value?.toLocaleString() || 0}</p>
                            {description && <p className="text-xs text-gray-500">{description}</p>}
                        </div>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {to && actionLabel && (
                        <Link to={to} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-admin-bg hover:bg-admin-border text-primary text-xs font-bold rounded-xl transition-all border border-admin-border group-hover:bg-white group-hover:shadow-sm">
                            {actionLabel} <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {isHovered && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-full animate-shine"></div>}
            </div>
        );
    };

    const QuickStatsCard = ({ title, value, subtitle, icon: Icon, gradient, to }) => (
        <Link to={to} className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl shadow-xl p-6 text-white md:col-span-1 group hover:scale-[1.02] transition-transform duration-300 block`}>
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="bg-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16} />
                    </div>
                </div>
                <p className="text-white/80 text-sm font-semibold mb-1">{title}</p>
                <p className="text-5xl font-black mb-2">{value}</p>
                <p className="text-white/70 text-xs">{subtitle}</p>
            </div>
        </Link>
    );

    const ActivityItem = ({ activity }) => {
        const getIcon = (type) => {
            switch (type) {
                case 'new': return <Plus className="w-4 h-4 text-white" />;
                case 'approved': return <CheckCircle className="w-4 h-4 text-white" />;
                case 'expired': return <Clock className="w-4 h-4 text-white" />;
                default: return <Activity className="w-4 h-4 text-white" />;
            }
        };
        const getStatusColor = (status) => {
            switch (status) {
                case 'active': case 'approved': return 'bg-green-50 text-green-700 border-green-200';
                case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
                case 'expired': return 'bg-gray-50 text-gray-700 border-gray-200';
                default: return 'bg-blue-50 text-blue-700 border-blue-200';
            }
        };

        return (
            <div className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{activity.vehicle}</p>
                    <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border capitalize ${getStatusColor(activity.status)}`}>
                    {activity.status}
                </span>
            </div>
        );
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size="lg" message="Loading Dashboard..." /></div>;

    if (error) {
        return (
            <div className="min-h-96 flex items-center justify-center p-8">
                {/* Error State */}
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Server className="w-8 h-8 text-red-600" /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Error</h3>
                    <p className="text-sm text-gray-600 mb-6">{error}</p>
                    <button onClick={loadDashboardData} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"><RefreshCw size={18} /> Retry Sync</button>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const adsByStatus = [
        { name: 'Active', value: stats.ads.active, color: '#10b981' },
        { name: 'Pending', value: stats.ads.pending, color: '#f59e0b' },
        { name: 'Completed', value: stats.ads.expired + stats.ads.sold, color: '#ef4444' },
    ];

    const successRate = stats.ads.total > 0 ? ((stats.ads.active / stats.ads.total) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-lg border border-admin-border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-secondary via-primary to-blue-400 bg-clip-text text-transparent">Dashboard</h1>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-admin-bg text-primary border-admin-border">
                                <Activity className="w-3 h-3 animate-pulse-glow" /> Live
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> Real-time feed</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Updated {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadDashboardData} disabled={refreshing} className="flex items-center gap-2 px-5 py-2.5 bg-admin-bg hover:bg-admin-border text-primary font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 border border-admin-border">
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 text-white font-semibold rounded-xl shadow-lg transition-all"><Download size={16} /> Export</button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard title="Total Listings" value={stats.ads.total} icon={Car} gradient="from-primary/80 to-primary" trend="up" change="+0%" description="All-time listings" to="/ads" actionLabel="View All" />
                <PremiumStatCard title="Active Ads" value={stats.ads.active} icon={CheckCircle} gradient="from-primary/90 to-primary" trend="up" change={`${successRate}%`} description="Success Rate" to="/ads" actionLabel="Manage" />
                <PremiumStatCard title="Pending Review" value={stats.ads.pending} icon={AlertTriangle} gradient="from-primary/70 to-primary/90" description="Needs attention" to="/ads" actionLabel="Review Now" />
                <PremiumStatCard title="Completed" value={stats.ads.expired + stats.ads.sold} icon={XCircle} gradient="from-primary/60 to-primary/80" description="Sold or Expired" to="/ads" actionLabel="View History" />
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Stats - Platform - Clickable */}
                <QuickStatsCard
                    title="Total Vehicles"
                    value={stats.vehicleTypes}
                    subtitle="Types Configured"
                    icon={Sparkles}
                    gradient="from-primary to-blue-600"
                    to="/vehicle-types"
                />
                <QuickStatsCard
                    title="Total Brands"
                    value={stats.brands}
                    subtitle="Manufacturers"
                    icon={Car}
                    gradient="from-blue-600 to-blue-700"
                    to="/vehicle-types"
                />
                <QuickStatsCard
                    title="Total Users"
                    value={stats.users}
                    subtitle="Registered Users"
                    icon={Users}
                    gradient="from-blue-700 to-secondary"
                    to="/users"
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-admin-border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h3 className="text-lg font-bold text-gray-900">Distribution</h3><p className="text-xs text-gray-500">Live Status</p></div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={adsByStatus} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {adsByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {adsByStatus.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                <span className="text-sm font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-admin-border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><Activity size={20} /></div>
                            <div><h3 className="text-lg font-bold text-gray-900">Recent Activity</h3><p className="text-xs text-gray-500">Real-time feed</p></div>
                        </div>
                        <Link to="/ads" className="text-xs font-bold text-primary hover:text-primary/80">View All</Link>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                        {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                            <ActivityItem key={idx} activity={activity} />
                        )) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No recent activity.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white rounded-3xl shadow-lg border border-admin-border p-6">
                <div className="flex items-center justify-between mb-6">
                    <div><h3 className="text-lg font-bold text-gray-900">Growth Analytics</h3><p className="text-xs text-gray-500">Last 6 months ads & users</p></div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="ads" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAds)" />
                            <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
