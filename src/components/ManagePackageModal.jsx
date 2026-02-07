import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Box, Settings, Layers, ListChecks } from 'lucide-react';
import { pricingApi } from '../api';

const ManagePackageModal = ({ isOpen, onClose, packageItem, allItems }) => {
    const [activeTab, setActiveTab] = useState('config'); // config | limits | items
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Config State (Features)
    const [features, setFeatures] = useState([]);
    const [config, setConfig] = useState({
        duration: '',
        color: '#000000',
        imageUrl: '',
        description: '',
        imageLimit: '5',
        descriptionLimit: '500',
        isImageUnlimited: false,
        isDescriptionUnlimited: false
    });

    // Lists
    const [includedItems, setIncludedItems] = useState([]);
    const [adLimits, setAdLimits] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);

    // Form States
    // 1. For Included Items
    const [newItemSelection, setNewItemSelection] = useState({
        included_item_id: '',
        vehicle_type_id: '',
        quantity: 1,
        is_unlimited: false
    });

    // 2. For Ad Limits
    const [newLimitSelection, setNewLimitSelection] = useState({
        vehicle_type_id: '',
        quantity: 1,
        is_unlimited: false
    });

    useEffect(() => {
        if (isOpen && packageItem) {
            fetchData();
        }
    }, [isOpen, packageItem]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Features (Config)
            const featRes = await pricingApi.getFeatures(packageItem.id);
            setFeatures(featRes.data);

            // Map common config keys to state
            const duration = featRes.data.find(f => f.feature_key === 'DURATION_DAYS')?.feature_value || '';
            const color = featRes.data.find(f => f.feature_key === 'COLOR_THEME')?.feature_value || '#000000';
            const imageUrl = featRes.data.find(f => f.feature_key === 'PACKAGE_IMAGE')?.feature_value || '';
            const desc = featRes.data.find(f => f.feature_key === 'DESCRIPTION')?.feature_value || '';
            const imgLimit = featRes.data.find(f => f.feature_key === 'IMAGE_LIMIT')?.feature_value || '5';
            const descLimit = featRes.data.find(f => f.feature_key === 'DESCRIPTION_LIMIT')?.feature_value || '500';

            setConfig({
                duration,
                color,
                imageUrl,
                description: desc,
                imageLimit: imgLimit === 'UNLIMITED' ? '' : imgLimit,
                descriptionLimit: descLimit === 'UNLIMITED' ? '' : descLimit,
                isImageUnlimited: imgLimit === 'UNLIMITED',
                isDescriptionUnlimited: descLimit === 'UNLIMITED'
            });

            // Fetch Included Items
            const itemsRes = await pricingApi.getPackageItems(packageItem.id);
            setIncludedItems(itemsRes.data);

            // Fetch Ad Limits
            const limitsRes = await pricingApi.getPackageAdLimits(packageItem.id);
            setAdLimits(limitsRes.data);

            // Fetch Vehicle Types if not already
            if (vehicleTypes.length === 0) {
                const typesRes = await import('../api').then(m => m.configApi.getTypes());
                setVehicleTypes(typesRes.data);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // available items to add (exclude self)
    const availableItems = allItems?.filter(i => i.id !== packageItem?.id);

    // --- Config Handlers ---

    const saveConfigValue = async (key, value, description) => {
        try {
            const existing = features.find(f => f.feature_key === key);
            if (existing) {
                await pricingApi.deleteFeature(existing.id);
            }
            if (value) {
                await pricingApi.addFeature({
                    price_item_id: packageItem.id,
                    feature_key: key,
                    feature_value: value,
                    feature_description: description
                });
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            await Promise.all([
                saveConfigValue('DURATION_DAYS', config.duration, 'Validity in days'),
                saveConfigValue('COLOR_THEME', config.color, 'Card color theme'),
                saveConfigValue('PACKAGE_IMAGE', config.imageUrl, 'Card display image'),
                saveConfigValue('DESCRIPTION', config.description, 'Package description text'),
                saveConfigValue('IMAGE_LIMIT', config.isImageUnlimited ? 'UNLIMITED' : config.imageLimit, 'Max images allowed per ad'),
                saveConfigValue('DESCRIPTION_LIMIT', config.isDescriptionUnlimited ? 'UNLIMITED' : config.descriptionLimit, 'Max characters in description')
            ]);
            await fetchData();
            alert('Configuration saved!');
        } catch (err) {
            setError('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    // --- Ad Limits Handlers ---

    const handleAddAdLimit = async () => {
        if (!newLimitSelection.vehicle_type_id) return;
        setLoading(true);
        try {
            await pricingApi.addPackageAdLimit({
                package_id: packageItem.id,
                ...newLimitSelection
            });
            setNewLimitSelection({ vehicle_type_id: '', quantity: 1, is_unlimited: false });
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdLimit = async (id) => {
        if (!window.confirm('Remove this limit?')) return;
        try {
            await pricingApi.deletePackageAdLimit(id);
            setAdLimits(adLimits.filter(l => l.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Included Items Handlers ---

    const handleAddItem = async () => {
        if (!newItemSelection.included_item_id) return;
        setLoading(true);
        try {
            await pricingApi.addPackageItem({
                package_id: packageItem.id,
                ...newItemSelection
            });
            setNewItemSelection({ included_item_id: '', vehicle_type_id: '', quantity: 1, is_unlimited: false });
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Remove this item from package?')) return;
        try {
            await pricingApi.deletePackageItem(id);
            setIncludedItems(includedItems.filter(i => i.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {packageItem?.item_type === 'BOOST_PACKAGE' ? 'Manage Boost Package' : 'Manage Package'}
                        </h2>
                        <p className="text-sm text-gray-500">Configuring: <span className="font-semibold text-primary">{packageItem?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b shrink-0 bg-gray-50/50">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'config' ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                        <Settings size={16} /> Configuration
                    </button>
                    {packageItem?.item_type !== 'BOOST_PACKAGE' && (
                        <button
                            onClick={() => setActiveTab('limits')}
                            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'limits' ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            <ListChecks size={16} /> Ad Limits
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'items' ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                        <Layers size={16} /> Included Items
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        placeholder="e.g. 30"
                                        value={config.duration}
                                        onChange={e => setConfig({ ...config, duration: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Leave empty for lifetime.</p>
                                </div>
                                {packageItem?.item_type !== 'BOOST_PACKAGE' && (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="h-10 w-10 p-1 border rounded-lg cursor-pointer"
                                                    value={config.color}
                                                    onChange={e => setConfig({ ...config, color: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 border rounded-lg p-2 uppercase"
                                                    value={config.color}
                                                    onChange={e => setConfig({ ...config, color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        placeholder="https://..."
                                        value={config.imageUrl}
                                        onChange={e => setConfig({ ...config, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description/Benefits</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2"
                                        rows={3}
                                        placeholder="Detailed description of the package..."
                                        value={config.description}
                                        onChange={e => setConfig({ ...config, description: e.target.value })}
                                    />
                                </div>
                                {packageItem?.item_type !== 'BOOST_PACKAGE' && (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Image Limit</label>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3.5 h-3.5 rounded text-primary"
                                                        checked={config.isImageUnlimited}
                                                        onChange={e => setConfig({ ...config, isImageUnlimited: e.target.checked })}
                                                    />
                                                    <span className="text-xs font-semibold text-gray-500">Unlimited</span>
                                                </label>
                                            </div>
                                            <input
                                                type="number"
                                                className="w-full border rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-400"
                                                placeholder={config.isImageUnlimited ? 'Unlimited' : 'e.g. 10'}
                                                disabled={config.isImageUnlimited}
                                                value={config.isImageUnlimited ? '' : config.imageLimit}
                                                onChange={e => setConfig({ ...config, imageLimit: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Description Limit</label>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3.5 h-3.5 rounded text-primary"
                                                        checked={config.isDescriptionUnlimited}
                                                        onChange={e => setConfig({ ...config, isDescriptionUnlimited: e.target.checked })}
                                                    />
                                                    <span className="text-xs font-semibold text-gray-500">Unlimited</span>
                                                </label>
                                            </div>
                                            <input
                                                type="number"
                                                className="w-full border rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-400"
                                                placeholder={config.isDescriptionUnlimited ? 'Unlimited' : 'e.g. 1000'}
                                                disabled={config.isDescriptionUnlimited}
                                                value={config.isDescriptionUnlimited ? '' : config.descriptionLimit}
                                                onChange={e => setConfig({ ...config, descriptionLimit: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'limits' && (
                        <div className="space-y-6">
                            <div className="bg-green-50/50 p-4 rounded-lg text-sm text-green-800 mb-4 border border-green-100 flex items-start gap-2">
                                <div className="mt-0.5"><ListChecks size={16} /></div>
                                <div>
                                    Set how many advertisements a user can post for each vehicle type with this package.
                                </div>
                            </div>

                            {/* Add Ad Limit Form */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Add Ad Limit</h3>
                                <div className="flex flex-col md:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Type</label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={newLimitSelection.vehicle_type_id}
                                            onChange={e => setNewLimitSelection({ ...newLimitSelection, vehicle_type_id: e.target.value })}
                                        >
                                            <option value="">Select Type...</option>
                                            {vehicleTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.type_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            disabled={newLimitSelection.is_unlimited}
                                            value={newLimitSelection.quantity}
                                            onChange={e => setNewLimitSelection({ ...newLimitSelection, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="pb-3 px-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary"
                                                checked={newLimitSelection.is_unlimited}
                                                onChange={e => setNewLimitSelection({ ...newLimitSelection, is_unlimited: e.target.checked })}
                                            />
                                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Unlimited</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleAddAdLimit}
                                        disabled={loading || !newLimitSelection.vehicle_type_id}
                                        className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {adLimits.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 italic">No ad limits configured.</div>
                                ) : (
                                    adLimits.map(limit => (
                                        <div key={limit.id} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                    <ListChecks size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {limit.vehicle_types?.type_name || 'Vehicle'} Ad Limit
                                                    </p>
                                                    <p className="text-xs text-gray-500">Allows posting this type</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
                                                    {limit.is_unlimited ? 'UNLIMITED' : `Qty: ${limit.quantity}`}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteAdLimit(limit.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 p-4 rounded-lg text-sm text-blue-800 mb-4 border border-blue-100 flex items-start gap-2">
                                <div className="mt-0.5"><Layers size={16} /></div>
                                <div>
                                    Include extra features (Boosts, Featured Status, etc.). You can optionally restrict these to specific vehicle types.
                                </div>
                            </div>

                            {/* Add Item Form */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Add Included Item</h3>
                                <div className="flex flex-col md:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Item</label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={newItemSelection.included_item_id}
                                            onChange={e => setNewItemSelection({ ...newItemSelection, included_item_id: e.target.value })}
                                        >
                                            <option value="">Select Item...</option>
                                            {availableItems?.map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.item_type})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-full md:w-48">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Limit to Vehicle Type</label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={newItemSelection.vehicle_type_id}
                                            onChange={e => setNewItemSelection({ ...newItemSelection, vehicle_type_id: e.target.value })}
                                        >
                                            <option value="">Any / Not Applicable</option>
                                            {vehicleTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.type_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-full md:w-24">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            disabled={newItemSelection.is_unlimited}
                                            value={newItemSelection.quantity}
                                            onChange={e => setNewItemSelection({ ...newItemSelection, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="pb-3 px-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary"
                                                checked={newItemSelection.is_unlimited}
                                                onChange={e => setNewItemSelection({ ...newItemSelection, is_unlimited: e.target.checked })}
                                            />
                                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Unlimited</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={loading || !newItemSelection.included_item_id}
                                        className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {includedItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 italic">No items included in this package yet.</div>
                                ) : (
                                    includedItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 flex items-center gap-2">
                                                        {item.price_items?.name}
                                                        {item.vehicle_types?.type_name && (
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                                                                For {item.vehicle_types.type_name}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{item.price_items?.item_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
                                                    {item.is_unlimited ? 'UNLIMITED' : `Qty: ${item.quantity}`}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagePackageModal;
