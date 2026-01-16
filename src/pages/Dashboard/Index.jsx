import React, { useEffect, useState } from 'react';
import { dashApi } from '../../api';
import {
    Users,
    Car,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';

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

    if (loading) return <div>Loading Analytics...</div>;

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Ads"
                    value={stats?.ads?.total || 0}
                    icon={Car}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Active Ads"
                    value={stats?.ads?.active || 0}
                    icon={CheckCircle}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    title="Pending Approval"
                    value={(stats?.ads?.total || 0) - (stats?.ads?.active || 0) - (stats?.ads?.expired || 0)}
                    icon={AlertTriangle}
                    color="text-yellow-600"
                    bg="bg-yellow-50"
                />
                <StatCard
                    title="Expired/Sold"
                    value={stats?.ads?.expired || 0}
                    icon={XCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard
                    title="Total Vehicle Types"
                    value={stats?.vehicleTypes || 0}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Total Brands"
                    value={stats?.brands || 0}
                    icon={TrendingUp}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center text-gray-400">
                    <p>Ads by Vehicle Type (Chart Coming Soon)</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center text-gray-400">
                    <p>Monthly Growth (Chart Coming Soon)</p>
                </div>
            </div>
        </div>
    );
}
