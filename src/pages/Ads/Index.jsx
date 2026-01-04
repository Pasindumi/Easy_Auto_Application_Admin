import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';

export default function Ads() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedAd, setSelectedAd] = useState(null);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/cars/admin/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            DRAFT: 'bg-yellow-100 text-yellow-700',
            SOLD: 'bg-gray-100 text-gray-700',
            EXPIRED: 'bg-red-100 text-red-700',
            REJECTED: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Ads Management</h1>
                <div className="flex gap-2">
                    {['', 'PENDING', 'ACTIVE', 'SOLD'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {s || 'ALL'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <img
                                        src={ad.AdImage?.[0]?.image_url || 'https://via.placeholder.com/50'}
                                        className="w-12 h-12 rounded object-cover"
                                        alt="ad thumb"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{ad.title}</p>
                                    <p className="text-xs text-gray-500">{ad.vehicle_type?.type_name}</p>
                                </td>
                                <td className="px-6 py-4 text-primary font-bold">
                                    ${ad.price?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {ad.seller?.name}<br />
                                    <span className="text-xs opacity-70">{ad.seller?.email}</span>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={ad.status} /></td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setSelectedAd(ad)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View / Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedAd && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">{selectedAd.title}</h2>
                            <button onClick={() => setSelectedAd(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-4 overflow-x-auto">
                                {selectedAd.AdImage?.map(img => (
                                    <img key={img.id} src={img.image_url} className="h-32 rounded-lg" />
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Price</label>
                                    <p className="text-lg font-bold">${selectedAd.price?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Location</label>
                                    <p className="text-lg">{selectedAd.location}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Description</label>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedAd.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {(selectedAd.status === 'PENDING' || selectedAd.status === 'DRAFT') && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'ACTIVE')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-2"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                    </>
                                )}
                                {selectedAd.status === 'ACTIVE' && (
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'EXPIRED')}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                                    >
                                        <Clock size={18} /> Expire / Disable
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
