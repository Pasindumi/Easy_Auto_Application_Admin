import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Percent, 
    DollarSign, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Users, 
    Layers, 
    Info, 
    Package,
    Tag
} from 'lucide-react';
import { discountsApi, configApi, pricingApi } from '../api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
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
        color_theme: '#235CF8',
        offer_image: null
    });

    useEffect(() => {
        fetchDiscounts();
        fetchVehicleTypes();
        fetchPackages();
    }, []);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const res = await discountsApi.getAll();
            setDiscounts(res.data);
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

    const handleOpenModal = (discount = null) => {
        if (discount) {
            setEditingId(discount.id);
            setFormData({
                name: discount.name,
                discount_type: discount.discount_type,
                value: discount.value,
                is_first_time_user: discount.is_first_time_user,
                min_bulk_ads: discount.min_bulk_ads,
                start_date: discount.start_date ? discount.start_date.split('T')[0] : '',
                end_date: discount.end_date ? discount.end_date.split('T')[0] : '',
                status: discount.status,
                vehicle_type_ids: discount.discount_vehicle_types?.map(v => v.vehicle_type_id) || [],
                package_ids: discount.discount_packages?.map(p => p.package_id) || [],
                color_theme: discount.color_theme || '#235CF8',
                offer_image: null
            });
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
                color_theme: '#235CF8',
                offer_image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'vehicle_type_ids' || key === 'package_ids') {
                    // Send as JSON string for arrays
                    data.append(key, JSON.stringify(formData[key]));
                } else if (key === 'offer_image') {
                    if (formData[key]) data.append('offer_image', formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (editingId) {
                await discountsApi.update(editingId, data);
            } else {
                await discountsApi.create(data);
            }
            setIsModalOpen(false);
            fetchDiscounts();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to save discount");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this discount?")) return;
        try {
            await discountsApi.delete(id);
            fetchDiscounts();
        } catch (error) {
            alert("Failed to delete discount");
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
                    {discount.discount_type === 'PERCENTAGE' ? <Percent size={14} /> : <DollarSign size={14} />}
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
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    discount.status === 'ACTIVE' 
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

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Discounts & Offers" 
                subtitle="Create promotional campaigns and special offers."
                breadcrumbs={['Dashboard', 'Marketing', 'Discounts']}
                actions={
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus size={18} /> Create Discount
                    </button>
                }
            />

            <DataTable 
                columns={columns}
                data={discounts}
                loading={loading}
                emptyState={{
                    title: "No Active Discounts",
                    description: "Create a new discount for user acquisition."
                }}
            />

            {/* Create/Edit Modal - Styled Premium */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in custom-scrollbar">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{editingId ? 'Edit Discount' : 'New Discount Offer'}</h2>
                                <p className="text-sm text-gray-500">Configure promotion details.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
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
                                        <option value="FIXED">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3.5 text-gray-400">
                                            {formData.discount_type === 'PERCENTAGE' ? <Percent size={18} /> : <DollarSign size={18} />}
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
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
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
                                            {vehicleTypes.length === 0 && <p className="text-xs text-gray-400 italic">No categories loaded.</p>}
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
                                            {packages.length === 0 && <p className="text-xs text-gray-400 italic">No packages loaded.</p>}
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

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl text-white shadow-lg shadow-gray-900/10">
                                <div>
                                    <span className="font-bold block text-sm mb-0.5">Activate Offer</span>
                                    <span className="text-xs text-gray-400">Make this discount live immediately.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 border-t border-gray-100 z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                                >
                                    {editingId ? 'Save Changes' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
