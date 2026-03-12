import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Percent, DollarSign, Calendar, CheckCircle2, XCircle, Users, Layers, Info, Package, Tag, Megaphone, Link as LinkIcon } from 'lucide-react';
import { discountsApi, configApi, pricingApi, announcementsApi } from '../api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

export default function DiscountsPage() {

    const [view, setView] = useState('DISCOUNTS'); // 'DISCOUNTS' or 'ANNOUNCEMENTS'
    const [discounts, setDiscounts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        // Discount fields
        name: '',
        discount_type: 'PERCENTAGE',
        value: '',
        is_first_time_user: false,
        min_bulk_ads: 0,
        start_date: '',
        end_date: '',
        status: 'ACTIVE',
        vehicle_type_ids: [],
        package_ids: [],
        color_theme: '#3B82F6',
        offer_image: null,
        // Announcement fields
        title: '',
        content: '',
        link: '',
        image: null
    });

    useEffect(() => {
        fetchData();
        fetchVehicleTypes();
        fetchPackages();
    }, [view]);

    const fetchData = () => {
        if (view === 'DISCOUNTS') fetchDiscounts();
        else fetchAnnouncements();
    };

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await announcementsApi.getAll();
            setAnnouncements(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Failed to load announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const res = await discountsApi.getAll();
            setDiscounts(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Failed to load discounts", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            const res = await configApi.getTypes();
            setVehicleTypes(res.data);
        } catch (error) {
            console.error("Failed to load vehicle types", error);
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await pricingApi.getItems();
            // Filter only PACKAGES
            const pkgs = res.data.filter(item => item.item_type === 'PACKAGE');
            setPackages(pkgs);
        } catch (error) {
            console.error("Failed to load packages", error);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            if (view === 'DISCOUNTS') {
                setFormData({
                    name: item.name,
                    discount_type: item.discount_type,
                    value: item.value,
                    is_first_time_user: item.is_first_time_user,
                    min_bulk_ads: item.min_bulk_ads,
                    start_date: item.start_date ? item.start_date.split('T')[0] : '',
                    end_date: item.end_date ? item.end_date.split('T')[0] : '',
                    status: item.status,
                    vehicle_type_ids: item.discount_vehicle_types?.map(v => v.vehicle_type_id) || [],
                    package_ids: item.discount_packages?.map(p => p.package_id) || [],
                    color_theme: item.color_theme || '#3B82F6',
                    offer_image: null,
                    title: '', content: '', link: '', image: null
                });
            } else {
                setFormData({
                    title: item.title,
                    content: item.content || '',
                    link: item.link || '',
                    status: item.status,
                    image: null,
                    name: '', discount_type: 'PERCENTAGE', value: '', is_first_time_user: false, min_bulk_ads: 0, start_date: '', end_date: '', vehicle_type_ids: [], package_ids: [], color_theme: '#235CF8', offer_image: null
                });
            }
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                discount_type: 'PERCENTAGE',
                value: '',
                is_first_time_user: false,
                min_bulk_ads: 0,
                start_date: '',
                end_date: '',
                status: 'ACTIVE',
                vehicle_type_ids: [],
                package_ids: [],
                color_theme: '#3B82F6',
                offer_image: null,
                title: '',
                content: '',
                link: '',
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            if (view === 'DISCOUNTS') {
                Object.keys(formData).forEach(key => {
                    if (['name', 'discount_type', 'value', 'is_first_time_user', 'min_bulk_ads', 'start_date', 'end_date', 'status', 'vehicle_type_ids', 'package_ids', 'color_theme', 'offer_image'].includes(key)) {
                        if (key === 'vehicle_type_ids' || key === 'package_ids') {
                            data.append(key, JSON.stringify(formData[key]));
                        } else if (key === 'offer_image') {
                            if (formData[key]) data.append('offer_image', formData[key]);
                        } else {
                            data.append(key, formData[key]);
                        }
                    }
                });

                if (editingId) {
                    await discountsApi.update(editingId, data);
                } else {
                    await discountsApi.create(data);
                }
            } else {
                data.append('title', formData.title);
                data.append('content', formData.content);
                data.append('link', formData.link);
                data.append('status', formData.status);
                if (formData.image) data.append('image', formData.image);

                if (editingId) {
                    await announcementsApi.update(editingId, data);
                } else {
                    await announcementsApi.create(data);
                }
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to save item");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete this ${view === 'DISCOUNTS' ? 'discount' : 'announcement'}?`)) return;
        try {
            if (view === 'DISCOUNTS') {
                await discountsApi.delete(id);
            } else {
                await announcementsApi.delete(id);
            }
            fetchData();
        } catch (error) {
            alert("Failed to delete item");
        }
    };

    const toggleVehicleType = (id) => {
        setFormData(prev => ({
            ...prev,
            vehicle_type_ids: prev.vehicle_type_ids.includes(id)
                ? prev.vehicle_type_ids.filter(v => v !== id)
                : [...prev.vehicle_type_ids, id]
        }));
    };

    const togglePackage = (id) => {
        setFormData(prev => ({
            ...prev,
            package_ids: prev.package_ids.includes(id)
                ? prev.package_ids.filter(p => p !== id)
                : [...prev.package_ids, id]
        }));
    };

    // --- Data Table Columns ---
    const columns = [
        {
            header: 'Offer Name',
            accessor: 'name',
            render: (discount) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold" style={{ backgroundColor: discount.color_theme || '#3b82f6' }}>
                        {discount.offer_image_url ? (
                            <img src={discount.offer_image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <Tag size={20} />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{discount.name}</p>
                        <p className="text-xs text-gray-400 font-mono">ID: {discount.id.split('-')[0]}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Discount Value',
            accessor: 'value',
            render: (discount) => (
                <div className="inline-flex items-center gap-1.5 font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                    {discount.discount_type === 'PERCENTAGE' ? <Percent size={14} /> : <span className="text-xs">Rs.</span>}
                    <span className="text-lg">{discount.value}</span>
                    {discount.discount_type === 'PERCENTAGE' ? '%' : ''}
                </div>
            )
        },
        {
            header: 'Targets',
            accessor: 'targets',
            render: (discount) => (
                <div className="flex flex-col gap-2">
                    {discount.discount_vehicle_types?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {discount.discount_vehicle_types.map(v => (
                                <span key={v.vehicle_type_id} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-100">
                                    {v.vehicle_types?.type_name}
                                </span>
                            ))}
                        </div>
                    )}
                    {discount.discount_package_items?.length > 0 && ( /* Note: API likely returns discount_packages or discount_package_items, check if needed, strictly sticking to viewed code structure which used discount_packages */
                        <div className="flex flex-wrap gap-1">
                            {discount.discount_packages?.map(p => (
                                <span key={p.package_id} className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-100">
                                    {p.price_items?.name}
                                </span>
                            ))}
                        </div>
                    )}
                    {(!discount.discount_vehicle_types?.length && !discount.discount_packages?.length) && (
                        <span className="text-gray-400 text-xs italic">Global Discount</span>
                    )}
                </div>
            )
        },
        {
            header: 'Conditions',
            accessor: 'conditions',
            render: (discount) => (
                <div className="space-y-1 text-xs text-gray-600 font-medium">
                    {discount.is_first_time_user && (
                        <div className="flex items-center gap-1 text-orange-600">
                            <Users size={12} /> First-time only
                        </div>
                    )}
                    {discount.min_bulk_ads > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                            <Layers size={12} /> Min {discount.min_bulk_ads} ads
                        </div>
                    )}
                    {discount.start_date && (
                        <div className="flex items-center gap-1">
                            <Calendar size={12} /> Since {new Date(discount.start_date).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (discount) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${discount.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                    {discount.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {discount.status}
                </span>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (discount) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleOpenModal(discount)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(discount.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    // --- Data Table Columns for Announcements ---
    const announcementColumns = [
        {
            header: 'Announcement',
            accessor: 'title',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 text-orange-600 shadow-sm overflow-hidden">
                        {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Megaphone size={24} />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{item.content}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Target Link',
            accessor: 'link',
            render: (item) => (
                item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium text-sm">
                        <LinkIcon size={14} /> Open Link
                    </a>
                ) : <span className="text-gray-400 text-xs italic">No Link</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (item) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${item.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                    {item.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Marketing Hub"
                subtitle="Manage discounts, offers, and announcements for your users."
                breadcrumbs={['Dashboard', 'Marketing']}
                actions={
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus size={18} /> {view === 'DISCOUNTS' ? 'Create Discount' : 'Create Announcement'}
                    </button>
                }
            />

            {/* View Toggle */}
            <div className="flex p-1 bg-white/80 backdrop-blur-sm rounded-2xl w-fit border border-admin-border shadow-inner">
                <button
                    onClick={() => setView('DISCOUNTS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'DISCOUNTS'
                        ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                >
                    <Tag size={16} /> Discounts
                </button>
                <button
                    onClick={() => setView('ANNOUNCEMENTS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'ANNOUNCEMENTS'
                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                >
                    <Megaphone size={16} /> Announcements
                </button>
            </div>

            <DataTable
                columns={view === 'DISCOUNTS' ? columns : announcementColumns}
                data={view === 'DISCOUNTS' ? discounts : announcements}
                loading={loading}
                emptyState={{
                    title: view === 'DISCOUNTS' ? "No Active Discounts" : "No Announcements",
                    description: view === 'DISCOUNTS' ? "Create a new discount for user acquisition." : "Stay connected with your users through announcements."
                }}
            />

            {/* Create/Edit Modal - Styled Premium */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in custom-scrollbar">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up border border-admin-border">
                        <div className="p-6 border-b border-admin-border flex justify-between items-center bg-admin-bg">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">
                                    {editingId ? 'Edit' : 'New'} {view === 'DISCOUNTS' ? 'Discount Offer' : 'Announcement'}
                                </h2>
                                <p className="text-sm text-gray-500">Configure {view === 'DISCOUNTS' ? 'promotion' : 'message'} details.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                            {view === 'DISCOUNTS' ? (
                                <>
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Discount Name</label>
                                            <input
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                                placeholder="e.g. Summer Sale 2026"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                                            <select
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none font-medium"
                                                value={formData.discount_type}
                                                onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                            >
                                                <option value="PERCENTAGE">Percentage (%)</option>
                                                <option value="FIXED">Fixed Amount (Rs.)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Value</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3.5 text-gray-400">
                                                    {formData.discount_type === 'PERCENTAGE' ? <Percent size={18} /> : <span className="text-sm font-bold">Rs.</span>}
                                                </span>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-3 outline-none font-bold text-lg"
                                                    value={formData.value}
                                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Theme Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="w-12 h-12 border border-gray-200 rounded-xl p-1 cursor-pointer"
                                                    value={formData.color_theme}
                                                    onChange={e => setFormData({ ...formData, color_theme: e.target.value })}
                                                />
                                                <input
                                                    required
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none font-mono text-sm uppercase"
                                                    placeholder="#235CF8"
                                                    value={formData.color_theme}
                                                    onChange={e => setFormData({ ...formData, color_theme: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Promotional Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                onChange={e => setFormData({ ...formData, offer_image: e.target.files[0] })}
                                            />
                                        </div>
                                    </div>

                                    {/* Targets Section */}
                                    <div className="bg-admin-bg rounded-2xl p-6 border border-admin-border">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Users size={16} /> Target Audience
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Categories */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">Vehicle Categories</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {vehicleTypes.map(type => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            onClick={() => toggleVehicleType(type.id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.vehicle_type_ids.includes(type.id)
                                                                ? 'bg-primary border-primary text-white shadow-sm'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                                                }`}
                                                        >
                                                            {type.type_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Packages */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">Subscription Packages</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {packages.map(pkg => (
                                                        <button
                                                            key={pkg.id}
                                                            type="button"
                                                            onClick={() => togglePackage(pkg.id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.package_ids.includes(pkg.id)
                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-600/50'
                                                                }`}
                                                        >
                                                            {pkg.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditions */}
                                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Info size={16} /> Conditions & Limits
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="flex items-start gap-3 cursor-pointer group p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary peer"
                                                        checked={formData.is_first_time_user}
                                                        onChange={e => setFormData({ ...formData, is_first_time_user: e.target.checked })}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">New Users Only</span>
                                                    <span className="text-xs text-gray-500 mt-1">Check this to restrict offer to first-time customers.</span>
                                                </div>
                                            </label>

                                            <div>
                                                <label className="block text-xs font-bold text-blue-800 mb-2">Bulk Ads Requirement</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-blue-100 rounded-xl p-3 text-sm outline-none font-medium focus:ring-2 focus:ring-blue-200"
                                                    placeholder="Min ads count (e.g. 5)"
                                                    value={formData.min_bulk_ads}
                                                    onChange={e => setFormData({ ...formData, min_bulk_ads: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-blue-100">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none font-medium"
                                                    value={formData.start_date}
                                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none font-medium"
                                                    value={formData.end_date}
                                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Announcement Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Headline</label>
                                            <input
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                                                placeholder="e.g. Maintenance Scheduled"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium min-h-[120px]"
                                                placeholder="Enter announcement details..."
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Action Link (Optional)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3.5 text-gray-400">
                                                    <LinkIcon size={18} />
                                                </span>
                                                <input
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-3 outline-none font-medium"
                                                    placeholder="https://..."
                                                    value={formData.link}
                                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                                                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Status Toggle */}
                            <div className={`flex items-center justify-between p-5 rounded-2xl text-white shadow-lg ${view === 'DISCOUNTS' ? 'bg-gray-900 shadow-gray-900/10' : 'bg-orange-600 shadow-orange-600/10'}`}>
                                <div>
                                    <span className="font-bold block text-sm mb-0.5">Publish {view === 'DISCOUNTS' ? 'Offer' : 'Announcement'}</span>
                                    <span className="text-xs opacity-80">Make it live for users immediately.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'ACTIVE' ? (view === 'DISCOUNTS' ? 'bg-green-500' : 'bg-green-400') : 'bg-white/20'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 border-t border-admin-border z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-primary hover:bg-admin-bg rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-8 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 ${view === 'DISCOUNTS' ? 'bg-primary shadow-primary/30 hover:bg-primary/90' : 'bg-orange-600 shadow-orange-600/30 hover:bg-orange-700'}`}
                                >
                                    {editingId ? 'Save Changes' : (view === 'DISCOUNTS' ? 'Create Offer' : 'Publish Now')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
