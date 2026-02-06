import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Percent, DollarSign, Calendar, CheckCircle, XCircle, Users, Layers, Info, Package } from 'lucide-react';
import { discountsApi, configApi, pricingApi } from '../api';

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Discounts & Offers</h1>
                    <p className="text-gray-500">Create and manage promotional offers for your customers.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                    <Plus size={18} /> Create Discount
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Discount Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Target Categories</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Target Packages</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Image/Theme</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {discounts.map((discount) => (
                                <tr key={discount.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{discount.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">{discount.id.split('-')[0]}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-bold text-green-600">
                                            {discount.discount_type === 'PERCENTAGE' ? <Percent size={14} /> : <DollarSign size={14} />}
                                            {discount.value}{discount.discount_type === 'PERCENTAGE' ? '%' : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {discount.discount_vehicle_types?.length > 0 ? (
                                                discount.discount_vehicle_types.map(v => (
                                                    <span key={v.vehicle_type_id} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                        {v.vehicle_types?.type_name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">All Categories</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {discount.discount_packages?.length > 0 ? (
                                                discount.discount_packages.map(p => (
                                                    <span key={p.package_id} className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                        {p.price_items?.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">All/None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-xs text-gray-600">
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
                                                    <Calendar size={12} /> From {new Date(discount.start_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: discount.color_theme }}></div>
                                            {discount.offer_image_url && (
                                                <img src={discount.offer_image_url} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${discount.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {discount.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(discount)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(discount.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {discounts.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No discounts found. Click "Create Discount" to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Discount' : 'Create New Discount'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Name</label>
                                    <input
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. New Year Special Offer"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none"
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400">
                                            {formData.discount_type === 'PERCENTAGE' ? <Percent size={16} /> : <DollarSign size={16} />}
                                        </span>
                                        <input
                                            required
                                            type="number"
                                            className="w-full border border-gray-200 rounded-lg pl-10 p-2.5 outline-none"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Color Theme</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-12 h-10 border border-gray-200 rounded-lg p-1 outline-none"
                                            value={formData.color_theme}
                                            onChange={e => setFormData({ ...formData, color_theme: e.target.value })}
                                        />
                                        <input
                                            required
                                            className="flex-1 border border-gray-200 rounded-lg p-2.5 outline-none font-mono"
                                            placeholder="#235CF8"
                                            value={formData.color_theme}
                                            onChange={e => setFormData({ ...formData, color_theme: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Offer Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
                                        onChange={e => setFormData({ ...formData, offer_image: e.target.files[0] })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {/* Categories */}
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Layers size={16} /> Target Categories
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {vehicleTypes.map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => toggleVehicleType(type.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${formData.vehicle_type_ids.includes(type.id)
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                                    }`}
                                            >
                                                {type.type_name}
                                            </button>
                                        ))}
                                        {vehicleTypes.length === 0 && <p className="text-xs text-gray-400 italic">No categories loaded.</p>}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 italic">Select categories for ad posting discounts.</p>
                                </div>

                                {/* Packages */}
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Package size={16} /> Target Packages
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {packages.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                type="button"
                                                onClick={() => togglePackage(pkg.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${formData.package_ids.includes(pkg.id)
                                                    ? 'bg-purple-600 border-purple-600 text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-purple-600/50'
                                                    }`}
                                            >
                                                {pkg.name}
                                            </button>
                                        ))}
                                        {packages.length === 0 && <p className="text-xs text-gray-400 italic">No packages loaded.</p>}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 italic">Select packages for subcription discounts.</p>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <Info size={16} /> Applicability Conditions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={formData.is_first_time_user}
                                            onChange={e => setFormData({ ...formData, is_first_time_user: e.target.checked })}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">First-time users only</span>
                                            <span className="text-[11px] text-gray-400 text-wrap max-w-64">Only applies to users with no prior paid ads.</span>
                                        </div>
                                    </label>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bulk Ads Requirement</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
                                            placeholder="Min ads count"
                                            value={formData.min_bulk_ads}
                                            onChange={e => setFormData({ ...formData, min_bulk_ads: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100/50">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <span className="font-semibold text-gray-700 block text-sm">Active Status</span>
                                    <span className="text-xs text-gray-400">Enable or disable this discount globally.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                                >
                                    {editingId ? 'Update Discount' : 'Create Discount'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
