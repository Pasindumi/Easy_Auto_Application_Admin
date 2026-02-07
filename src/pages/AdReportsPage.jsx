import React, { useState, useEffect } from 'react';
import {
    Flag,
    MessageSquare,
    User,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    Filter
} from 'lucide-react';
import { reportsApi } from '../api';
import clsx from 'clsx';

export default function AdReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportsApi.getAll();
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await reportsApi.updateStatus(id, { status });
            if (response.data.success) {
                setReports(reports.map(r => r.id === id ? { ...r, status } : r));
            }
        } catch (error) {
            console.error("Error updating report status:", error);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchesSearch =
            report.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.reason?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'REVIEWED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'RESOLVED':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={14} />;
            case 'REVIEWED':
                return <AlertCircle size={14} />;
            case 'RESOLVED':
                return <CheckCircle2 size={14} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ad Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">Monitor and resolve reports for fake ads or spam</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReports}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ad title, reporter, or reason..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Filter size={18} className="text-gray-400 mr-2" />
                    {['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                                filterStatus === status
                                    ? "bg-primary text-white shadow-md shadow-blue-500/20"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading reports...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Flag size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No reports found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-1">There are no reports matching your current filters.</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-all group">
                            <div className="p-5 md:p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Action/Details */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                                        getStatusStyles(report.status)
                                                    )}>
                                                        {getStatusIcon(report.status)}
                                                        {report.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {report.ad?.title || "Deleted Ad"}
                                                    <a href={`http://localhost:5174/cars/${report.ad_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {report.status !== 'RESOLVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                                        title="Mark as Resolved"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                )}
                                                {report.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="Mark as Reviewed"
                                                    >
                                                        <AlertCircle size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50 flex gap-3">
                                            <MessageSquare className="text-red-400 shrink-0" size={18} />
                                            <p className="text-sm text-gray-700 italic">"{report.reason}"</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-xs font-semibold text-gray-600">Reporter:</span>
                                                <span className="text-xs text-gray-900 font-bold">{report.reporter?.name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <span className="text-xs font-semibold text-gray-600">Status:</span>
                                                <span className={clsx(
                                                    "text-xs font-bold",
                                                    report.ad?.status === 'ACTIVE' ? "text-green-600" : "text-red-500"
                                                )}>
                                                    Ad is {report.ad?.status || 'UNKNOWN'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
