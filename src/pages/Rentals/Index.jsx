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
    FileText,
    Info,
    Mail,
    Phone
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

    const [reviewStep, setReviewStep] = useState(1);

    const reviewSteps = [
        { id: 1, title: 'Intro', icon: <Info size={14} /> },
        { id: 2, title: 'Vehicle', icon: <Car size={14} /> },
        { id: 3, title: 'Pricing & Rules', icon: <DollarSign size={14} /> },
        { id: 4, title: 'Media & Verification', icon: <Shield size={14} /> },
        { id: 5, title: 'Availability & Contact', icon: <Calendar size={14} /> },
    ];

    const columns = [
        {
            header: 'Vehicle',
            accessor: 'title',
            render: (ad) => (
                <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                        {ad.images?.[0] ? (
                            <img src={ad.images[0].image_url} className="w-full h-full object-cover" />
                        ) : <Car size={20} className="m-auto text-gray-400 mt-3" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{ad.title}</p>
                        <p className="text-xs text-gray-500 font-medium">{ad.rental_ad_details?.[0]?.brand || ad.rental_ad_details?.brand} {ad.rental_ad_details?.[0]?.model || ad.rental_ad_details?.model}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Daily Price',
            accessor: 'price_per_day',
            render: (ad) => <span className="font-bold text-primary text-sm">Rs. {ad.price_per_day?.toLocaleString()}</span>
        },
        {
            header: 'Verification',
            accessor: 'verification_status',
            render: (ad) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${ad.verification_status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' :
                    ad.verification_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {ad.verification_status}
                </span>
            )
        },
        {
            header: 'Seller',
            render: (ad) => (
                <div className="text-xs">
                    <p className="font-bold text-gray-900">{ad.seller?.name || ad.users?.name}</p>
                    <p className="text-gray-500">{ad.seller?.email || ad.users?.email}</p>
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
                <button onClick={() => { setSelectedAd(ad); setReviewStep(1); }} className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg group transition-colors">
                    <Eye size={18} className="group-hover:text-primary" />
                </button>
            )
        }
    ];

    const getDocUrl = (type) => {
        const doc = selectedAd.documents?.find(d => d.document_type === type);
        return doc ? doc.document_url : null;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Rental Management"
                subtitle="Review and verify vehicle rental advertisements."
                breadcrumbs={['Dashboard', 'Rentals']}
                actions={
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                        {['', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === s ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-end">
                    <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Review Rental Ad</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedAd.title}</p>
                            </div>
                            <button onClick={() => setSelectedAd(null)} className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* STEPPER NAVIGATION */}
                        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-1 overflow-x-auto">
                            {reviewSteps.map((step) => (
                                <button
                                    key={step.id}
                                    onClick={() => setReviewStep(step.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${reviewStep === step.id ? 'bg-primary text-white shadow-lg shadow-primary/20 transform scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black ${reviewStep === step.id ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
                                        {step.id}
                                    </span>
                                    {step.title}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 pt-6">
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                {reviewStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Basic Information</h3>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <p className="text-sm font-bold text-gray-400 mb-1">Ad Title</p>
                                                <p className="text-lg font-black text-gray-900">{selectedAd.title}</p>

                                                <div className="grid grid-cols-2 gap-6 mt-6">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Location</p>
                                                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                                            <MapPin size={14} className="text-primary" />
                                                            {selectedAd.location}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Ad Reference ID</p>
                                                        <p className="text-sm font-mono font-bold text-gray-600 truncate">{selectedAd.id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Description</h3>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-h-[150px]">
                                                <p className="text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedAd.description || 'No description provided.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {reviewStep === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Vehicle Specifications</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Brand', value: selectedAd.details?.[0]?.brand || selectedAd.details?.brand },
                                                { label: 'Model', value: selectedAd.details?.[0]?.model || selectedAd.details?.model },
                                                { label: 'Year', value: selectedAd.details?.[0]?.year || selectedAd.details?.year },
                                                { label: 'Condition', value: selectedAd.details?.[0]?.condition || selectedAd.details?.condition },
                                                { label: 'Mileage', value: `${(selectedAd.details?.[0]?.mileage || selectedAd.details?.mileage || 0).toLocaleString()} km` },
                                                { label: 'Fuel Type', value: selectedAd.details?.[0]?.fuel_type || selectedAd.details?.fuel_type },
                                                { label: 'Transmission', value: selectedAd.details?.[0]?.transmission || selectedAd.details?.transmission },
                                                { label: 'Body Type', value: selectedAd.details?.[0]?.body_type || selectedAd.details?.body_type },
                                                { label: 'Engine', value: `${selectedAd.details?.[0]?.engine_capacity || selectedAd.details?.engine_capacity || 'N/A'}cc` },
                                            ].map((spec, i) => (
                                                <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">{spec.label}</p>
                                                    <p className="font-black text-gray-800">{spec.value || 'N/A'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {reviewStep === 3 && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Pricing Details</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                                    <p className="text-[10px] font-black uppercase text-primary/60 mb-0.5">Daily Rate</p>
                                                    <p className="text-lg font-black text-primary">Rs. {selectedAd.price_per_day?.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Weekly Rate</p>
                                                    <p className="text-lg font-black text-gray-800">Rs. {selectedAd.price_per_week?.toLocaleString() || 'N/A'}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Monthly Rate</p>
                                                    <p className="text-lg font-black text-gray-800">Rs. {selectedAd.price_per_month?.toLocaleString() || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                                    <p className="text-[10px] font-black uppercase text-amber-600 mb-0.5">Security Deposit</p>
                                                    <p className="text-lg font-black text-amber-900">Rs. {selectedAd.security_deposit?.toLocaleString() || '0'}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Extra KM Fee</p>
                                                    <p className="text-lg font-black text-gray-800">Rs. {selectedAd.extra_mileage_fee || '0'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Rental Conditions</h3>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                                        <p className="text-sm font-bold text-gray-500">Min. Driver Age</p>
                                                        <p className="font-black text-gray-900">{selectedAd.min_age || '21'} Years</p>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                                        <p className="text-sm font-bold text-gray-500">Daily KM Limit</p>
                                                        <p className="font-black text-gray-900">{selectedAd.daily_mileage_limit || 'Unlimited'}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-bold text-gray-500">Allow Smoking</p>
                                                        <p className={`font-black ${selectedAd.allow_smoking ? 'text-green-600' : 'text-red-500'}`}>{selectedAd.allow_smoking ? 'YES' : 'NO'}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-bold text-gray-500">Allow Pets</p>
                                                        <p className={`font-black ${selectedAd.allow_pets ? 'text-green-600' : 'text-red-500'}`}>{selectedAd.allow_pets ? 'YES' : 'NO'}</p>
                                                    </div>
                                                </div>
                                                {selectedAd.other_conditions && (
                                                    <div className="mt-8 pt-4 border-t border-gray-200">
                                                        <p className="text-xs font-black uppercase text-gray-400 mb-2">Other Conditions</p>
                                                        <p className="text-sm font-semibold text-gray-700">{selectedAd.other_conditions}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {reviewStep === 4 && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Photo Gallery</h3>
                                            <div className="grid grid-cols-4 gap-3">
                                                {selectedAd.images?.length > 0 ? (
                                                    selectedAd.images.map((img, i) => (
                                                        <div key={i} className="aspect-square bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden group cursor-pointer" onClick={() => window.open(img.image_url)}>
                                                            <img src={img.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        </div>
                                                    ))
                                                ) : <div className="col-span-4 bg-gray-50 p-8 rounded-2xl text-center text-gray-400 font-bold">No photos uploaded.</div>}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Verification Documents</h3>
                                            <section className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h4 className="text-sm font-black text-primary flex items-center gap-2">
                                                        <Shield size={18} />
                                                        Verification: {selectedAd.verification_status}
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        { label: 'ID Front', url: getDocUrl('ID Front') },
                                                        { label: 'ID Back', url: getDocUrl('ID Back') },
                                                        { label: 'Ownership', url: getDocUrl('Ownership Document') }
                                                    ].map((doc, i) => (
                                                        <div key={i} className="space-y-2">
                                                            <p className="text-[10px] uppercase font-black text-gray-400">{doc.label}</p>
                                                            <div className="aspect-[4/3] bg-white rounded-2xl border border-primary/20 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow group" onClick={() => doc.url && window.open(doc.url)}>
                                                                {doc.url ? (
                                                                    <img src={doc.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                ) : (
                                                                    <div className="flex h-full flex-col items-center justify-center text-gray-300 gap-2">
                                                                        <FileText size={24} />
                                                                        <p className="text-[9px] font-bold">NOT PROVIDED</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-3 mt-8">
                                                    <button
                                                        onClick={() => verifyDocuments(selectedAd.id, 'VERIFIED')}
                                                        className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black text-xs hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:grayscale"
                                                        disabled={actionLoading}
                                                    >APPROVE DOCUMENTS</button>
                                                    <button
                                                        onClick={() => verifyDocuments(selectedAd.id, 'REJECTED')}
                                                        className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black text-xs hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95 disabled:grayscale"
                                                        disabled={actionLoading}
                                                    >REJECT DOCUMENTS</button>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {reviewStep === 5 && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Seller Information</h3>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <User size={28} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-gray-900">{selectedAd.seller?.name || selectedAd.users?.name}</p>
                                                        <p className="text-xs font-bold text-gray-400 italic">Registered Seller</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-3 bg-white rounded-2xl border border-gray-100">
                                                        <Mail size={16} className="text-primary" />
                                                        {selectedAd.seller?.email || selectedAd.users?.email}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-3 bg-white rounded-2xl border border-gray-100">
                                                        <Phone size={16} className="text-primary" />
                                                        {selectedAd.seller?.phone || selectedAd.users?.phone || 'Not Provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Availability Calendar</h3>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-primary" />
                                                    <p className="text-sm font-bold text-gray-700">Initial availability set for the vehicle.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ad Status Actions */}
                                <div className="pt-10 flex gap-4">
                                    {selectedAd.status === 'PENDING_APPROVAL' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                                className="flex-1 bg-white border-2 border-red-100 text-red-600 font-black py-4 rounded-3xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                REJECT AD
                                            </button>
                                            <button
                                                onClick={() => updateStatus(selectedAd.id, 'ACTIVE')}
                                                className="flex-1 bg-primary text-white font-black py-4 rounded-3xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95"
                                            >
                                                <CheckCircle size={18} />
                                                ACTIVATE AD
                                            </button>
                                        </>
                                    )}
                                    {selectedAd.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => updateStatus(selectedAd.id, 'REJECTED')}
                                            className="flex-1 bg-red-600 text-white font-black py-4 rounded-3xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            DEACTIVATE AD
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add necessary imports to Index.jsx if missing
// import { Info, Mail, Phone } from 'lucide-react';
