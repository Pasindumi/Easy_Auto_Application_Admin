import React, { useEffect, useState } from 'react';
import { adsApi } from '../../api';
import { CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';

export default function Ads() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedAd, setSelectedAd] = useState(null);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await adsApi.getAll(filter);
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
            await adsApi.updateStatus(id, { status });
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            console.error("Failed to update status", error);
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
                    {['', 'DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'REJECTED'].map(s => (
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
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedAd.title}</h2>
                                <p className="text-sm text-gray-500">Ad ID: {selectedAd.id}</p>
                            </div>
                            <button onClick={() => setSelectedAd(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Images Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Advertisement Images</h3>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {selectedAd.AdImage?.length > 0 ? (
                                        selectedAd.AdImage.map(img => (
                                            <img key={img.id} src={img.image_url} className="h-48 w-72 object-cover rounded-xl border border-gray-100 flex-shrink-0" alt="car" />
                                        ))
                                    ) : (
                                        <div className="h-48 w-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">No images available</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic & Seller Info */}
                                <div className="space-y-8">
                                    {/* Basic Info */}
                                    <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 mb-0.5">Price</p>
                                                <p className="font-bold text-lg text-primary">${selectedAd.price?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-0.5">Status</p>
                                                <StatusBadge status={selectedAd.status} />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-0.5">Location</p>
                                                <p className="font-medium">{selectedAd.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-0.5">Vehicle Type</p>
                                                <p className="font-medium">{selectedAd.vehicle_type?.type_name || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </section>

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
                                </div>

                                {/* Right Column: Vehicle & Dynamic Attributes */}
                                <div className="space-y-8">
                                    {/* Vehicle Specifications (Static + Dynamic merged) */}
                                    {(() => {
                                        const detailsData = selectedAd.CarDetails;
                                        const details = Array.isArray(detailsData) ? (detailsData[0] || {}) : (detailsData || {});

                                        const staticSpecs = [
                                            { label: 'Condition', value: details.condition },
                                            { label: 'Brand', value: details.brand },
                                            { label: 'Model', value: details.model },
                                            { label: 'Year', value: details.year },
                                            { label: 'Mileage', value: details.mileage },
                                            { label: 'Engine', value: details.engine_capacity },
                                            { label: 'Fuel Type', value: details.fuel_type },
                                            { label: 'Transmission', value: details.transmission },
                                            { label: 'Body Type', value: details.body_type },
                                        ].filter(item => {
                                            const val = item.value;
                                            return val !== null && val !== undefined && val !== '' && val !== '—' && val !== 'undefined' && val !== 'null';
                                        });

                                        if (staticSpecs.length === 0) return null;

                                        return (
                                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    Vehicle Specifications
                                                </h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                                    {staticSpecs.map((item, idx) => (
                                                        <div key={idx}>
                                                            <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                                                            <p className="font-semibold text-gray-700 capitalize">{item.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        );
                                    })()}

                                    {/* Additional Attributes (Dynamic) */}
                                    {(() => {
                                        const dynamicAttrs = (selectedAd.attributes || []).filter(attr =>
                                            attr.value && attr.value !== 'undefined' && attr.value !== 'null' && attr.value !== ''
                                        );

                                        if (dynamicAttrs.length === 0) return null;

                                        return (
                                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                    Additional Features
                                                </h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                                    {dynamicAttrs.map((attr, idx) => (
                                                        <div key={idx}>
                                                            <p className="text-gray-400 text-xs mb-0.5">{attr.attribute?.attribute_name}</p>
                                                            <p className="font-semibold text-gray-700">
                                                                {attr.value} {attr.attribute?.unit && attr.attribute.unit !== 'none' ? attr.attribute.unit : ''}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedAd.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                                {(selectedAd.status === 'PENDING' || selectedAd.status === 'DRAFT') && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'ACTIVE')}
                                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center gap-2 transition-all shadow-lg shadow-green-200"
                                        >
                                            <CheckCircle size={20} /> Approve Ad
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                            className="px-6 py-2.5 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 flex items-center gap-2 transition-all"
                                        >
                                            <XCircle size={20} /> Reject
                                        </button>
                                    </>
                                )}
                                {selectedAd.status === 'ACTIVE' && (
                                    <button
                                        onClick={() => updateStatus(selectedAd.id, 'EXPIRED')}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 flex items-center gap-2 transition-all"
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
