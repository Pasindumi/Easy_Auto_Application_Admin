import React, { useEffect, useState } from 'react';
import { rentalsApi } from '../../api';
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
    DollarSign,
    Shield,
    FileText
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';

export default function Rentals() {
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
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await rentalsApi.getAll({
                status: filter,
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch
            });

            if (res.data?.success) {
                setAds(res.data.data || []);
                if (res.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: res.data.pagination.total,
                        pages: res.data.pagination.pages,
                        page: res.data.pagination.page
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching rental ads:", error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAds();
    }, [filter, pagination.page, debouncedSearch]);

    const updateStatus = async (id, status) => {
        try {
            await rentalsApi.updateStatus(id, { status });
            setSelectedAd(null);
            fetchAds();
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const verifyDocuments = async (id, status) => {
        setActionLoading(true);
        try {
            await rentalsApi.verify(id, { status });
            // Update local state for modal
            if (selectedAd && selectedAd.id === id) {
                setSelectedAd({ ...selectedAd, verification_status: status });
            }
            fetchAds();
        } catch (error) {
            alert("Verification failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            ACTIVE: 'bg-green-50 text-green-700 border-green-200',
            PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
            PENDING_PAYMENT: 'bg-blue-50 text-blue-700 border-blue-200',
            REJECTED: 'bg-red-50 text-red-700 border-red-200',
            EXPIRED: 'bg-gray-50 text-gray-600 border-gray-200'
        };

        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const columns = [
        {
            header: 'Vehicle',
            accessor: 'title',
            render: (ad) => (
                <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                        {ad.rental_ad_images?.[0] ? (
                            <img src={ad.rental_ad_images[0].image_url} className="w-full h-full object-cover" />
                        ) : <Car size={20} className="m-auto text-gray-400 mt-3" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{ad.title}</p>
                        <p className="text-xs text-gray-500 font-medium">{ad.rental_ad_details?.brand} {ad.rental_ad_details?.model}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Daily Price',
            accessor: 'price_per_day',
            render: (ad) => <span className="font-bold text-primary">Rs. {ad.price_per_day?.toLocaleString()}</span>
        },
        {
            header: 'Verification',
            accessor: 'verification_status',
            render: (ad) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ad.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        ad.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {ad.verification_status}
                </span>
            )
        },
        {
            header: 'Seller',
            render: (ad) => (
                <div className="text-xs">
                    <p className="font-semibold text-gray-900">{ad.users?.name}</p>
                    <p className="text-gray-500">{ad.users?.email}</p>
                </div>
            )
        },
        {
            header: 'Status',
            render: (ad) => <StatusBadge status={ad.status} />
        },
        {
            header: 'Action',
            align: 'right',
            render: (ad) => (
                <button onClick={() => setSelectedAd(ad)} className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg">
                    <Eye size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Rental Management"
                subtitle="Review and verify vehicle rental advertisements."
                breadcrumbs={['Dashboard', 'Rentals']}
                actions={
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                        {['', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === s ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
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
                pagination={{
                    ...pagination,
                    onPageChange: (p) => setPagination(prev => ({ ...prev, page: p }))
                }}
            />

            {selectedAd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Ad Review</h2>
                            <button onClick={() => setSelectedAd(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Document Verification Section */}
                        <div className="space-y-8">
                            <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <Shield size={18} />
                                    Document Verification Status: {selectedAd.verification_status}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">ID Front</p>
                                        <div className="aspect-[4/3] bg-white rounded-lg border border-blue-200 overflow-hidden cursor-pointer" onClick={() => window.open(selectedAd.doc_id_front)}>
                                            {selectedAd.doc_id_front ? <img src={selectedAd.doc_id_front} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><FileText size={32} /></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">ID Back</p>
                                        <div className="aspect-[4/3] bg-white rounded-lg border border-blue-200 overflow-hidden cursor-pointer" onClick={() => window.open(selectedAd.doc_id_back)}>
                                            {selectedAd.doc_id_back ? <img src={selectedAd.doc_id_back} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><FileText size={32} /></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">Log Book</p>
                                        <div className="aspect-[4/3] bg-white rounded-lg border border-blue-200 overflow-hidden cursor-pointer" onClick={() => window.open(selectedAd.doc_ownership)}>
                                            {selectedAd.doc_ownership ? <img src={selectedAd.doc_ownership} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><FileText size={32} /></div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => verifyDocuments(selectedAd.id, 'VERIFIED')}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-700"
                                        disabled={actionLoading}
                                    >Approve Documents</button>
                                    <button
                                        onClick={() => verifyDocuments(selectedAd.id, 'REJECTED')}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-red-700"
                                        disabled={actionLoading}
                                    >Reject Documents</button>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="font-bold text-lg">Vehicle Info</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500">Pricing</p>
                                        <p className="font-bold">Rs. {selectedAd.price_per_day}/day</p>
                                        <p className="text-xs text-gray-400">Week: {selectedAd.price_per_week || 'N/A'} | Month: {selectedAd.price_per_month || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500">Conditions</p>
                                        <p className="text-sm font-semibold">Min Age: {selectedAd.min_age} | Limit: {selectedAd.daily_mileage_limit}km</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-4 rounded-xl font-medium">{selectedAd.description}</p>
                            </section>

                            {/* Ad Status Actions */}
                            <div className="flex gap-4 pt-10">
                                {selectedAd.status === 'PENDING_APPROVAL' && (
                                    <>
                                        <button onClick={() => updateStatus(selectedAd.id, 'REJECTED')} className="flex-1 border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50">Reject Ad</button>
                                        <button onClick={() => updateStatus(selectedAd.id, 'ACTIVE')} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:shadow-lg transition-shadow">Activate Ad</button>
                                    </>
                                )}
                                {selectedAd.status === 'ACTIVE' && (
                                    <button onClick={() => updateStatus(selectedAd.id, 'REJECTED')} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700">Deactivate Ad</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
