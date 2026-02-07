import React, { useEffect, useState } from 'react';
import { dashApi } from '../../api';
import {
    Users,
    Car,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashApi.getStats();
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <LoadingSpinner size="lg" message="Loading Analytics..." />
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, gradient, trend, trendValue }) => (
        <Card 
            variant="default" 
            hover={true}
            className="relative overflow-hidden animate-slide-up"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl`}></div>
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{value?.toLocaleString() || 0}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-sm">
                            {trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                {trendValue}
                            </span>
                            <span className="text-gray-500">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </Card>
    );

    // Mock data for charts
    const adsByStatus = [
        { name: 'Active', value: stats?.ads?.active || 0, color: '#10b981' },
        { name: 'Pending', value: (stats?.ads?.total || 0) - (stats?.ads?.active || 0) - (stats?.ads?.expired || 0), color: '#f59e0b' },
        { name: 'Expired', value: stats?.ads?.expired || 0, color: '#ef4444' },
    ];

    const monthlyData = [
        { month: 'Jan', ads: 45 },
        { month: 'Feb', ads: 52 },
        { month: 'Mar', ads: 61 },
        { month: 'Apr', ads: 58 },
        { month: 'May', ads: 70 },
        { month: 'Jun', ads: stats?.ads?.total || 75 },
    ];

    const vehicleTypeData = [
        { type: 'Car', count: Math.floor((stats?.ads?.total || 100) * 0.4) },
        { type: 'Van', count: Math.floor((stats?.ads?.total || 100) * 0.25) },
        { type: 'Bike', count: Math.floor((stats?.ads?.total || 100) * 0.2) },
        { type: 'Truck', count: Math.floor((stats?.ads?.total || 100) * 0.15) },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">System Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Ads"
                    value={stats?.ads?.total}
                    icon={Car}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="up"
                    trendValue="+12%"
                />
                <StatCard
                    title="Active Ads"
                    value={stats?.ads?.active}
                    icon={CheckCircle}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                    trend="up"
                    trendValue="+8%"
                />
                <StatCard
                    title="Pending Approval"
                    value={(stats?.ads?.total || 0) - (stats?.ads?.active || 0) - (stats?.ads?.expired || 0)}
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
                />
                <StatCard
                    title="Expired/Sold"
                    value={stats?.ads?.expired}
                    icon={XCircle}
                    gradient="bg-gradient-to-br from-red-500 to-red-600"
                    trend="down"
                    trendValue="-5%"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Total Vehicle Types"
                    value={stats?.vehicleTypes}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Total Brands"
                    value={stats?.brands}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ads by Status - Pie Chart */}
                <Card className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ads Distribution by Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={adsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {adsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {adsByStatus.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Monthly Growth - Area Chart */}
                <Card className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Ads Growth</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#235CF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#235CF8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#9ca3af" style={{fontSize: '12px'}} />
                                <YAxis stroke="#9ca3af" style={{fontSize: '12px'}} />
                                <Tooltip 
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area type="monotone" dataKey="ads" stroke="#235CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorAds)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Ads by Vehicle Type - Bar Chart */}
                <Card className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ads by Vehicle Type</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vehicleTypeData}>
                                <XAxis dataKey="type" stroke="#9ca3af" style={{fontSize: '12px'}} />
                                <YAxis stroke="#9ca3af" style={{fontSize: '12px'}} />
                                <Tooltip 
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="count" fill="#235CF8" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card variant="gradient" className="animate-slide-up flex flex-col justify-center" style={{animationDelay: '0.4s'}}>
                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <a 
                            href="/ads" 
                            className="flex items-center justify-between p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-smooth backdrop-blur-sm"
                        >
                            <span className="font-medium">Review Pending Ads</span>
                            <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                                {(stats?.ads?.total || 0) - (stats?.ads?.active || 0) - (stats?.ads?.expired || 0)}
                            </span>
                        </a>
                        <a 
                            href="/vehicle-types" 
                            className="flex items-center justify-between p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-smooth backdrop-blur-sm"
                        >
                            <span className="font-medium">Manage Vehicle Types</span>
                            <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                                {stats?.vehicleTypes || 0}
                            </span>
                        </a>
                        <a 
                            href="/settings/limits" 
                            className="flex items-center justify-between p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-smooth backdrop-blur-sm"
                        >
                            <span className="font-medium">System Settings</span>
                            <TrendingUp className="w-5 h-5" />
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
}
