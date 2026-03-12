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
    Trash2,
    Filter,
    Star,
    MessageCircle,
    Send
} from 'lucide-react';
import { reportsApi, complaintsApi, appReviewsApi } from '../api';
import PageHeader from '../components/PageHeader';
import clsx from 'clsx';

export default function AdReportsPage() {
    const [view, setView] = useState('REPORTS'); // 'REPORTS', 'COMPLAINTS', 'REVIEWS'
    const [reports, setReports] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Reply State
    const [replyingTo, setReplyingTo] = useState(null); // Review ID
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

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
            } else if (view === 'COMPLAINTS') {
                const response = await complaintsApi.getAll();
                if (response.data.success) {
                    setComplaints(response.data.data);
                }
            } else if (view === 'REVIEWS') {
                const response = await appReviewsApi.getAll();
                if (response.data.success) {
                    setReviews(response.data.data);
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
            } else if (view === 'COMPLAINTS') {
                const response = await complaintsApi.updateStatus(id, { status });
                if (response.data.success) {
                    setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
                }
            }
        } catch (error) {
            console.error(`Error updating ${view.toLowerCase()} status:`, error);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        try {
            const response = await appReviewsApi.reply(reviewId, { reply: replyText });
            if (response.data.success) {
                setReviews(reviews.map(r => r.id === reviewId ? { ...r, reply: replyText, reply_at: new Date() } : r));
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (error) {
            console.error("Error replying to review:", error);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const response = await appReviewsApi.delete(id);
            if (response.data.success) {
                setReviews(reviews.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const currentData = view === 'REPORTS' ? reports : (view === 'COMPLAINTS' ? complaints : reviews);

    const filteredData = currentData.filter(item => {
        let matchesStatus = true;
        if (view !== 'REVIEWS') {
            matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
        } else {
            // For reviews, filterStatus could reuse logic or differ. 
            // Let's say filterStatus 'ALL' means all, 'PENDING' means not replied, 'RESOLVED' means replied
            if (filterStatus === 'PENDING') matchesStatus = !item.reply;
            if (filterStatus === 'RESOLVED') matchesStatus = !!item.reply;
        }

        let matchesSearch = false;
        if (view === 'REPORTS') {
            matchesSearch =
                item.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reason?.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (view === 'COMPLAINTS') {
            matchesSearch =
                item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.message?.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (view === 'REVIEWS') {
            matchesSearch =
                item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.comment?.toLowerCase().includes(searchQuery.toLowerCase());
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={12} />;
            case 'REVIEWED': return <AlertCircle size={12} />;
            case 'RESOLVED': return <CheckCircle2 size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const pendingCount = reports.filter(r => r.status === 'PENDING').length;
    // Ideally we'd fetch counts for all tabs safely but keeping logic simple for now

    return (
        <div className="space-y-8">
            <PageHeader
                title="Report Moderation"
                subtitle="Review reports, complaints, and app reviews."
                breadcrumbs={['Dashboard', 'Reports']}
                actions={
                    view === 'REPORTS' && (
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2 px-3 py-1 bg-admin-bg text-primary rounded-lg border border-admin-border">
                                <AlertCircle size={14} />
                                <span>{pendingCount} Pending</span>
                            </div>
                        </div>
                    )
                }
            />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {view === 'REPORTS' ? 'Ad Reports' : (view === 'COMPLAINTS' ? 'User Complaints' : 'App Reviews')}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {view === 'REPORTS'
                                ? 'Monitor and resolve reports for fake ads or spam'
                                : (view === 'COMPLAINTS' ? 'Manage and respond to user complaints' : 'See what users are saying about the app')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/80 p-1 rounded-2xl flex border border-admin-border shadow-sm backdrop-blur-sm">
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
                            <button
                                onClick={() => { setView('REVIEWS'); setFilterStatus('ALL'); }}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    view === 'REVIEWS' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Reviews
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
                <div className="bg-white p-4 rounded-3xl border border-admin-border shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={view === 'REVIEWS' ? "Search reviews..." : "Search..."}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex p-1 bg-admin-bg rounded-xl border border-admin-border">
                        {view === 'REVIEWS' ? (
                            ['ALL', 'PENDING', 'RESOLVED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filterStatus === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All' : (status === 'PENDING' ? 'Unreplied' : 'Replied')}
                                </button>
                            ))
                        ) : (
                            ['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filterStatus === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content List */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading {view.toLowerCase()}...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-admin-border p-16 text-center shadow-lg">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                {view === 'REPORTS' ? <Flag size={40} /> : (view === 'COMPLAINTS' ? <ShieldAlert size={40} /> : <Star size={40} />)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No data found</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredData.map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl border border-admin-border shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 group overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            {view !== 'REVIEWS' ? (
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border flex items-center gap-1.5",
                                                    getStatusStyles(item.status)
                                                )}>
                                                    {getStatusIcon(item.status)}
                                                    {item.status}
                                                </span>
                                            ) : (
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} size={14} className={star <= item.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4 mb-6">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                view === 'REPORTS' ? "bg-red-50 text-red-500" : (view === 'COMPLAINTS' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500")
                                            )}>
                                                {view === 'REPORTS' ? <Flag size={20} /> : (view === 'COMPLAINTS' ? <ShieldAlert size={20} /> : <MessageCircle size={20} />)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
                                                    {view === 'REPORTS' ? (item.ad?.title || "Deleted Ad") : (view === 'COMPLAINTS' ? item.category : "App Review")}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <User size={12} />
                                                    <span className="font-bold text-gray-700">
                                                        {view === 'REPORTS'
                                                            ? (item.reporter?.name || 'Anonymous')
                                                            : (item.user?.name || 'User')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={clsx(
                                            "p-4 rounded-xl border flex gap-3 mb-4",
                                            "bg-gray-50/50 border-gray-100"
                                        )}>
                                            <MessageSquare className="shrink-0 text-gray-400" size={18} />
                                            <p className="text-sm text-gray-700 font-medium italic">"{view === 'REPORTS' ? item.reason : (view === 'COMPLAINTS' ? item.message : item.comment)}"</p>
                                        </div>

                                        {view === 'REVIEWS' && item.reply && (
                                            <div className="ml-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30 mb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="bg-admin-bg text-primary p-1 rounded border border-admin-border">
                                                        <Send size={12} />
                                                    </div>
                                                    <span className="text-xs font-bold text-blue-800">Admin Response</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{item.reply}</p>
                                            </div>
                                        )}

                                        {/* Reply Input for Reviews */}
                                        {view === 'REVIEWS' && replyingTo === item.id && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <textarea
                                                    className="w-full p-3 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    rows="3"
                                                    placeholder="Write a reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                ></textarea>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReplySubmit(item.id)}
                                                        disabled={submittingReply}
                                                        className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50"
                                                    >
                                                        {submittingReply ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex gap-2">
                                        {view !== 'REVIEWS' ? (
                                            <>
                                                {item.status !== 'RESOLVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                                                        className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={16} /> Mark Resolved
                                                    </button>
                                                )}
                                                {item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'REVIEWED')}
                                                        className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <AlertCircle size={16} /> Review
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {!item.reply && !replyingTo && (
                                                    <button
                                                        onClick={() => { setReplyingTo(item.id); setReplyText(''); }}
                                                        className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <MessageCircle size={16} /> Reply
                                                    </button>
                                                )}
                                                {item.reply && (
                                                    <div className="flex-1 py-2.5 text-xs font-bold text-green-600 flex items-center justify-center gap-2 cursor-default">
                                                        <CheckCircle2 size={16} /> Replied
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {(view === 'REVIEWS' || view === 'REPORTS') && (
                                            <button
                                                onClick={() => view === 'REVIEWS' ? handleDeleteReview(item.id) : null}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
