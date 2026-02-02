import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Eye, X, Search, Grid, List } from 'lucide-react';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import showToast from '../../utils/toast';

export default function Ads() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedAd, setSelectedAd] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAds = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`http://localhost:5000/api/cars/admin/all?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAds(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching ads", error);
            showToast.error('Failed to fetch ads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [filter]);

    const updateStatus = async (id, status) => {
        const loadingToast = showToast.loading('Updating status...');
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/cars/admin/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast.dismiss(loadingToast);
            showToast.success('Status updated successfully');
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            showToast.dismiss(loadingToast);
            showToast.error('Failed to update status');
        }
    };

    const StatusBadge = ({ status }) => {
        const variants = {
            ACTIVE: 'success',
            PENDING: 'warning',
            DRAFT: 'warning',
            SOLD: 'default',
            EXPIRED: 'danger',
            REJECTED: 'danger'
        };
        return <Badge variant={variants[status] || 'default'} size="sm">{status}</Badge>;
    };

    // Filter ads by search query
    const filteredAds = ads.filter(ad => 
        ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Ads Management</h1>
                    <p className="text-gray-500">Review and manage all vehicle advertisements</p>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                    {['', 'PENDING', 'ACTIVE', 'SOLD', 'EXPIRED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                                filter === s 
                                    ? 'bg-primary text-white shadow-primary' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {s || 'ALL'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <Card padding="sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title, seller, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth text-gray-800"
                    />
                </div>
            </Card>

            {/* Table */}
            {loading ? (
                <Card className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" message="Loading ads..." />
                </Card>
            ) : filteredAds.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Search}
                        title="No ads found"
                        description={searchQuery ? "No ads match your search criteria" : "No ads available for this filter"}
                    />
                </Card>
            ) : (
                <Card padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAds.map((ad, idx) => (
                                    <tr key={ad.id} className="hover:bg-gray-50 transition-smooth animate-slide-up" style={{animationDelay: `${idx * 0.05}s`}}>
                                        <td className="px-6 py-4">
                                            <img
                                                src={ad.AdImage?.[0]?.image_url || 'https://via.placeholder.com/50'}
                                                className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                                alt="ad thumb"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{ad.title}</p>
                                            <p className="text-sm text-gray-500">{ad.vehicle_type?.type_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-primary">${ad.price?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-700">{ad.seller?.name}</p>
                                            <p className="text-xs text-gray-500">{ad.seller?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={ad.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedAd(ad)}
                                                className="flex items-center gap-1 text-primary hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold transition-smooth"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Detail Modal */}
            {selectedAd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedAd.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedAd.vehicle_type?.type_name}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedAd(null)} 
                                className="p-2 hover:bg-gray-100 rounded-full transition-smooth"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Images */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Images</h3>
                                <div className="flex gap-3 overflow-x-auto">
                                    {selectedAd.AdImage?.map((img, idx) => (
                                        <img 
                                            key={img.id} 
                                            src={img.image_url} 
                                            className="h-40 rounded-lg object-cover shadow-md hover-lift cursor-pointer" 
                                            alt={`Ad image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Price</label>
                                    <p className="text-2xl font-bold text-primary">${selectedAd.price?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Location</label>
                                    <p className="text-lg font-medium text-gray-900">{selectedAd.location}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Status</label>
                                    <StatusBadge status={selectedAd.status} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Posted By</label>
                                    <p className="text-lg font-medium text-gray-900">{selectedAd.seller?.name}</p>
                                    <p className="text-sm text-gray-500">{selectedAd.seller?.email}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Description</label>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl">
                                    {selectedAd.description || 'No description provided'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                {(selectedAd.status === 'PENDING' || selectedAd.status === 'DRAFT') && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'ACTIVE')}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 font-semibold transition-smooth shadow-lg"
                                        >
                                            <CheckCircle size={20} /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                            className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 flex items-center gap-2 font-semibold transition-smooth"
                                        >
                                            <XCircle size={20} /> Reject
                                        </button>
                                    </>
                                )}
                                {selectedAd.status === 'ACTIVE' && (
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'EXPIRED')}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 font-semibold transition-smooth"
                                    >
                                        <Clock size={20} /> Mark as Expired
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
