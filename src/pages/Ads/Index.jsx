import React, { useEffect, useState } from 'react';
import { adsApi } from '../../api';
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    X,
    Filter,
    MoreHorizontal,
    AlertTriangle,
    Search,
    Car,
    User,
    MapPin,
    Calendar,
    DollarSign
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';

export default function Ads() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedAd, setSelectedAd] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [showBanModal, setShowBanModal] = useState(false);
    const [banDuration, setBanDuration] = useState('24');
    const [banReason, setBanReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAds = async () => {
        setLoading(true);
        console.log("🚀 Starting fetchAds...");
        try {
            console.log("📡 Requesting: ", "/cars/admin/all", { filter, page: pagination.page, search: debouncedSearch });
            const res = await adsApi.getAll({
                status: filter,
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch
            });
            console.log("✅ Response Status:", res.status);

            const payload = res.data;
            let data = [];
            let paginfo = { total: 0, pages: 0, page: 1, limit: 10 };

            if (payload?.success) {
                data = payload.data || [];
                if (payload.pagination) {
                    paginfo = payload.pagination;
                }
            } else if (Array.isArray(payload)) {
                data = payload;
            }

            setAds(data);
            setPagination(prev => ({
                ...prev,
                total: paginfo.total || data.length,
                pages: paginfo.pages || 1,
                page: paginfo.page || prev.page
            }));

        } catch (error) {
            console.error("❌ Error fetching ads:", error);
            if (error.response) {
                console.error("❌ Error Response:", error.response.status, error.response.data);
                alert(`Connection Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else {
                alert(`Network Error: ${error.message}`);
            }
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAds();
    }, [filter, pagination.page, debouncedSearch]);

    const updateStatus = async (id, status) => {
        try {
            await adsApi.updateStatus(id, { status });
            setSelectedAd(null);
            fetchAds(); // Refresh list to remove from current filter if needed
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleBanAd = async () => {
        if (!selectedAd) return;
        setActionLoading(true);
        try {
            await adsApi.banAd(selectedAd.id, {
                durationHours: banDuration,
                reason: banReason
            });
            setShowBanModal(false);
            setBanReason('');
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            console.error("Failed to ban ad", error);
            alert("Failed to ban ad. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnbanAd = async (id) => {
        setActionLoading(true);
        try {
            await adsApi.unbanAd(id);
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            console.error("Failed to unban ad", error);
            alert("Failed to unban ad. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const safeStatus = status || 'PENDING';
        const styles = {
            ACTIVE: 'bg-green-50 text-green-700 border-green-200',
            PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
            DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
            SOLD: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            EXPIRED: 'bg-red-50 text-red-700 border-red-200',
            REJECTED: 'bg-red-50 text-red-700 border-red-200',
            BANNED: 'bg-red-100 text-red-700 border-red-300'
        };

        const icons = {
            ACTIVE: <CheckCircle size={12} />,
            PENDING: <Clock size={12} />,
            DRAFT: <MoreHorizontal size={12} />,
            SOLD: <DollarSign size={12} />,
            EXPIRED: <AlertTriangle size={12} />,
            REJECTED: <XCircle size={12} />,
            BANNED: <XCircle size={12} />
        };

        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[safeStatus] || 'bg-gray-100'}`}>
                {icons[safeStatus] || <Clock size={12} />}
                {safeStatus}
            </span>
        );
    };


    // Columns config for DataTable
    const columns = [
        {
            header: 'Vehicle',
            accessor: 'title',
            render: (ad) => {
                const vehicleType = ad.vehicle_type?.type_name || ad.CarDetails?.[0]?.vehicle_type || 'Vehicle';
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-admin-bg overflow-hidden border border-admin-border shadow-sm flex-shrink-0">
                            {ad.AdImage && ad.AdImage[0] ? (
                                <img
                                    src={ad.AdImage[0].image_url}
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                    alt={ad.title}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Car size={20} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{ad.title || 'Untitled'}</p>
                            <p className="text-xs text-gray-500 font-medium">{vehicleType}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Price',
            accessor: 'price',
            render: (ad) => (
                <span className="font-bold text-primary bg-admin-bg px-2 py-1 rounded-lg border border-admin-border">
                    Rs. {ad.price?.toLocaleString()}
                </span>
            )
        },
        {
            header: 'Seller',
            accessor: 'seller',
            render: (ad) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-admin-bg flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white shadow-sm border border-admin-border">
                        {ad.seller?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{ad.seller?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{ad.seller?.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'location',
            render: (ad) => (
                <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <MapPin size={12} />
                    {ad.location}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'created_at',
            render: (ad) => (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar size={12} />
                    {new Date(ad.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (ad) => <StatusBadge status={ad.status} />
        },
        {
            header: 'Action',
            align: 'right',
            render: (ad) => (
                <button
                    onClick={() => setSelectedAd(ad)}
                    className="p-2 hover:bg-admin-bg text-gray-500 hover:text-primary rounded-lg transition-colors"
                >
                    <Eye size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Listing Management"
                subtitle="Review, approve, and manage vehicle advertisements."
                breadcrumbs={['Dashboard', 'Ads']}
                actions={
                    <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-admin-border shadow-sm backdrop-blur-sm">
                        {['', 'PENDING', 'ACTIVE', 'SOLD', 'EXPIRED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filter === s
                                    ? 'bg-primary text-white shadow-md shadow-primary/30 outline outline-2 outline-white/20'
                                    : 'text-gray-500 hover:bg-admin-bg hover:text-primary'
                                    }`}
                            >
                                {s || 'ALL'}
                            </button>
                        ))}
                    </div>
                }
            />

            <DataTable
                columns={columns}
                data={ads}
                loading={loading}
                onSearch={setSearchTerm}
                searchPlaceholder="Search by vehicle, seller email, or ID..."
                pagination={{
                    page: pagination.page,
                    limit: pagination.limit,
                    total: pagination.total,
                    pages: pagination.pages,
                    onPageChange: (p) => setPagination(prev => ({ ...prev, page: p }))
                }}
                emptyState={{
                    title: "No listings found",
                    description: filter ? `No ads found with status "${filter}"` : "Try adjusting your search terms."
                }}
            />

            {/* Premium Detail Modal/Drawer */}
            {selectedAd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in custom-scrollbar">
                    <div className="w-full max-w-2xl bg-white h-full shadow-2xl animate-slide-in-right overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-admin-border p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Review Listing</h2>
                                <p className="text-sm text-gray-500 font-mono">ID: {selectedAd.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAd(null)}
                                className="p-2 bg-admin-bg hover:bg-admin-border rounded-full text-primary transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 pb-32">
                            {/* Image Gallery */}
                            <div className="relative aspect-video bg-admin-bg rounded-2xl overflow-hidden border border-admin-border shadow-inner group">
                                {selectedAd.AdImage && selectedAd.AdImage.length > 0 ? (
                                    <>
                                        <img
                                            src={selectedAd.AdImage[0].image_url}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            alt={selectedAd.title}
                                        />
                                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                                            1 / {selectedAd.AdImage.length}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <Car size={48} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No images uploaded</p>
                                    </div>
                                )}
                            </div>

                            {/* Title & Price */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">{selectedAd.title}</h1>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={selectedAd.status} />
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin size={14} /> {selectedAd.location}
                                        </span>
                                    </div>
                                    {/* Seller Info */}
                                    <section className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Seller Details
                                        </h3>
                                        {selectedAd.seller ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-0.5">Full Name</p>
                                                    <p className="font-semibold text-gray-900">{selectedAd.seller.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-0.5">Email Address</p>
                                                    <p className="font-medium text-gray-800">{selectedAd.seller.email}</p>
                                                </div>
                                                {selectedAd.seller.phone && (
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-0.5">Phone Number</p>
                                                        <p className="font-medium text-gray-800">{selectedAd.seller.phone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Seller information not available</p>
                                        )}
                                    </section>

                                    {/* Boost Info */}
                                    {selectedAd.active_boosts && selectedAd.active_boosts.length > 0 && (
                                        <section className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm shadow-yellow-100">
                                            <h3 className="text-sm font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                                Active Boost Information
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedAd.active_boosts.map((boost, idx) => (
                                                    <div key={idx} className="pb-3 border-b border-yellow-200/50 last:border-0 last:pb-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="bg-yellow-400 p-1 rounded">
                                                                <Eye size={14} className="text-white" />
                                                            </div>
                                                            <p className="font-bold text-yellow-900">{boost.package?.name || 'Boost Active'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-yellow-700 ml-7">
                                                            <Clock size={12} />
                                                            <span>Expires: {new Date(boost.end_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Ad Ban Info */}
                                    {selectedAd.is_banned && (
                                        <section className="bg-red-50 p-5 rounded-2xl border border-red-200">
                                            <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
                                                <AlertTriangle size={16} />
                                                Banned Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Reason</p>
                                                    <p className="text-sm text-gray-900 font-medium">{selectedAd.ban_reason}</p>
                                                </div>
                                                {selectedAd.ban_expires_at && (
                                                    <div>
                                                        <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Expires At</p>
                                                        <p className="text-sm text-gray-900 font-medium">{new Date(selectedAd.ban_expires_at).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-primary">Rs. {selectedAd.price?.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Asking Price</p>
                                </div>
                            </div>

                            {/* Seller Card */}
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 font-bold text-lg">
                                    {selectedAd.seller?.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide opacity-70">Seller</p>
                                    <p className="font-bold text-gray-900">{selectedAd.seller?.name}</p>
                                    <p className="text-sm text-gray-600">{selectedAd.seller?.email}</p>
                                </div>
                                <button className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
                                    Contact
                                </button>
                            </div>

                            {/* Specs Grid */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Car size={20} className="text-gray-400" />
                                    Vehicle Specifications
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Type', value: selectedAd.vehicle_type?.type_name },
                                        { label: 'Condition', value: selectedAd.CarDetails?.[0]?.condition },
                                        { label: 'Brand', value: selectedAd.CarDetails?.[0]?.brand },
                                        { label: 'Model', value: selectedAd.CarDetails?.[0]?.model },
                                        { label: 'Year', value: selectedAd.CarDetails?.[0]?.year },
                                        { label: 'Mileage', value: selectedAd.CarDetails?.[0]?.mileage },
                                        { label: 'Engine', value: selectedAd.CarDetails?.[0]?.engine_capacity },
                                        { label: 'Transmission', value: selectedAd.CarDetails?.[0]?.transmission },
                                        { label: 'Fuel', value: selectedAd.CarDetails?.[0]?.fuel_type },
                                    ].map((item, i) => (
                                        item.value && (
                                            <div key={i} className="bg-admin-bg rounded-xl p-3 border border-admin-border">
                                                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                                                <p className="font-bold text-gray-900 capitalize">{item.value}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                                <div className="bg-admin-bg p-6 rounded-2xl border border-admin-border">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedAd.description || 'No description provided.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-6 border-t border-admin-border shadow-lg-reverse flex gap-3">
                            <div className="flex-1"></div>
                            {selectedAd.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                        className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'ACTIVE')}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Approve & Publish
                                    </button>
                                </>
                            )}
                            {selectedAd.status === 'ACTIVE' && (
                                <>
                                    <button
                                        onClick={() => setShowBanModal(true)}
                                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                                    >
                                        <AlertTriangle size={18} />
                                        Ban Listing
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'EXPIRED')}
                                        className="px-6 py-3 bg-admin-bg text-primary font-bold rounded-xl hover:bg-admin-border transition-all flex items-center gap-2"
                                    >
                                        <Clock size={18} />
                                        Mark as Expired
                                    </button>
                                </>
                            )}
                            {selectedAd.status === 'BANNED' && (
                                <button
                                    onClick={() => handleUnbanAd(selectedAd.id)}
                                    disabled={actionLoading}
                                    className="px-6 py-3 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-all border border-green-100 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={18} />
                                    {actionLoading ? 'Unbanning...' : 'Unban Listing'}
                                </button>
                            )}
                            {selectedAd.status === 'REJECTED' && (
                                <button
                                    onClick={() => updateStatus(selectedAd.id, 'PENDING')}
                                    className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2"
                                >
                                    <Clock size={18} />
                                    Restore to Pending
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .shadow-lg-reverse {
                    box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.05), 0 -2px 4px -2px rgb(0 0 0 / 0.05);
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>

            {/* Ban Duration/Reason Modal */}
            {showBanModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900">Ban Advertisement</h3>
                            <button onClick={() => setShowBanModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ban Duration</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={banDuration}
                                    onChange={(e) => setBanDuration(e.target.value)}
                                >
                                    <option value="24">24 Hours (1 Day)</option>
                                    <option value="48">48 Hours (2 Days)</option>
                                    <option value="72">72 Hours (3 Days)</option>
                                    <option value="168">1 Week</option>
                                    <option value="720">1 Month</option>
                                    <option value="8760">1 Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Banning</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Enter detailed reason for the seller..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">This reason will be visible to the seller in their "My Ads" panel.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-white hover:text-gray-900 rounded-xl transition-all border border-transparent hover:border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBanAd}
                                disabled={actionLoading || !banReason.trim()}
                                className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? 'Banning...' : 'Confirm Ban'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
