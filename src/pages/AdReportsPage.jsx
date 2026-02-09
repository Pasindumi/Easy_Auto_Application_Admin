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
    ShieldAlert,
    Trash2
} from 'lucide-react';
import { reportsApi } from '../api';
import PageHeader from '../components/PageHeader';
    Filter,
    ShieldAlert
} from 'lucide-react';
import { reportsApi, complaintsApi } from '../api';
import clsx from 'clsx';

export default function AdReportsPage() {
    const [view, setView] = useState('REPORTS'); // 'REPORTS' or 'COMPLAINTS'
    const [reports, setReports] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (view === 'REPORTS') {
                const response = await reportsApi.getAll();
                if (response.data.success) {
                    setReports(response.data.data);
                }
            } else {
                const response = await complaintsApi.getAll();
                if (response.data.success) {
                    setComplaints(response.data.data);
                }
            }
        } catch (error) {
            console.error(`Error fetching ${view.toLowerCase()}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            if (view === 'REPORTS') {
                const response = await reportsApi.updateStatus(id, { status });
                if (response.data.success) {
                    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
                }
            } else {
                const response = await complaintsApi.updateStatus(id, { status });
                if (response.data.success) {
                    setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
                }
            }
        } catch (error) {
            console.error(`Error updating ${view.toLowerCase()} status:`, error);
        }
    };

    const currentData = view === 'REPORTS' ? reports : complaints;

    const filteredData = currentData.filter(item => {
        const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

        let matchesSearch = false;
        if (view === 'REPORTS') {
            matchesSearch =
                item.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reason?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
            matchesSearch =
                item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.message?.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'REVIEWED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const pendingCount = reports.filter(r => r.status === 'PENDING').length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

    return (
        <div className="space-y-8">
            <PageHeader
                title="Report Moderation"
                subtitle="Review and resolve user reports for flagged content."
                breadcrumbs={['Dashboard', 'Reports']}
                actions={
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                            <AlertCircle size={14} />
                            <span>{pendingCount} Pending</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                            <CheckCircle2 size={14} />
                            <span>{resolvedCount} Resolved</span>
                        </div>
                    </div>
                }
            />
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {view === 'REPORTS' ? 'Ad Reports' : 'User Complaints'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {view === 'REPORTS'
                            ? 'Monitor and resolve reports for fake ads or spam'
                            : 'Manage and respond to user complaints and feedback'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => { setView('REPORTS'); setFilterStatus('ALL'); }}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                view === 'REPORTS' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Ad Reports
                        </button>
                        <button
                            onClick={() => { setView('COMPLAINTS'); setFilterStatus('ALL'); }}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                view === 'COMPLAINTS' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Complaints
                        </button>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder={view === 'REPORTS'
                            ? "Search by ad title, reporter, or reason..."
                            : "Search by user, email, category, or message..."}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                    {['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                filterStatus === status
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Grid */}
            <div className="space-y-4">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-48 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                                <div className="h-12 bg-gray-50 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-lg">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <ShieldAlert size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No reports found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">Everything looks clean! Checking regularly helps keep the platform safe.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 group overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border flex items-center gap-1.5 ${getStatusStyles(report.status)}`}>
                                            {report.status === 'RESOLVED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {report.status}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                                            <Flag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1" title={report.ad?.title}>
                                                {report.ad?.title || <span className="text-red-400 italic">Deleted Advertisement</span>}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <User size={12} />
                                                Reported by <span className="font-bold text-gray-700">{report.reporter?.name || 'Anonymous'}</span>
                                            </div>
                                            {report.ad_id && (
                                                <a 
                                                    href={`http://localhost:5173/cars/${report.ad_id}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-2 hover:underline"
                                                >
                                                    View Listing <ExternalLink size={10} />
                                                </a>
            {/* Content List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading {view.toLowerCase()}...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                            {view === 'REPORTS' ? <Flag size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {view.toLowerCase()} found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-1">There are no {view.toLowerCase()} matching your current filters.</p>
                    </div>
                ) : (
                    filteredData.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-all group">
                            <div className="p-5 md:p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                                        getStatusStyles(item.status)
                                                    )}>
                                                        {getStatusIcon(item.status)}
                                                        {item.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {view === 'REPORTS' ? (
                                                        <>
                                                            {item.ad?.title || "Deleted Ad"}
                                                            <a href={`http://localhost:5174/cars/${item.ad_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary">
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldAlert size={20} className="text-red-500" />
                                                            {item.category}
                                                        </>
                                                    )}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.status !== 'RESOLVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                                        title="Mark as Resolved"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                )}
                                                {item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'REVIEWED')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="Mark as Reviewed"
                                                    >
                                                        <AlertCircle size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className={clsx(
                                            "p-4 rounded-xl border flex gap-3",
                                            view === 'REPORTS' ? "bg-red-50/50 border-red-100/50" : "bg-blue-50/50 border-blue-100/50"
                                        )}>
                                            <MessageSquare className={clsx("shrink-0", view === 'REPORTS' ? "text-red-400" : "text-blue-400")} size={18} />
                                            <p className="text-sm text-gray-700 italic">"{view === 'REPORTS' ? item.reason : item.message}"</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-xs font-semibold text-gray-600">User:</span>
                                                <span className="text-xs text-gray-900 font-bold">
                                                    {view === 'REPORTS'
                                                        ? (item.reporter?.name || 'Anonymous')
                                                        : (item.user?.name || 'User') + ` (${item.user?.email || 'No email'})`}
                                                </span>
                                            </div>
                                            {view === 'REPORTS' && (
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-semibold text-gray-600">Ad Status:</span>
                                                    <span className={clsx(
                                                        "text-xs font-bold",
                                                        item.ad?.status === 'ACTIVE' ? "text-green-600" : "text-red-500"
                                                    )}>
                                                        {item.ad?.status || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative mb-4">
                                        <MessageSquare className="absolute top-4 left-4 text-gray-300" size={16} />
                                        <p className="text-sm text-gray-700 pl-6 italic font-medium">"{report.reason}"</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex gap-2">
                                    {report.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                                            className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={16} /> Mark Resolved
                                        </button>
                                    )}
                                    {report.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                                            className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                                        >
                                            <AlertCircle size={16} /> Review
                                        </button>
                                    )}
                                    <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
