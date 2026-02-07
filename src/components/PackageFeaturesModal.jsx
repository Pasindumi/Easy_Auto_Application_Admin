import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { pricingApi } from '../api';

const PackageFeaturesModal = ({ isOpen, onClose, packageItem }) => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newFeature, setNewFeature] = useState({ key: '', value: '', description: '' });

    useEffect(() => {
        if (isOpen && packageItem) {
            fetchFeatures();
        }
    }, [isOpen, packageItem]);

    const fetchFeatures = async () => {
        try {
            setLoading(true);
            const response = await pricingApi.getFeatures(packageItem.id);
            setFeatures(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAddFeature = async () => {
        if (!newFeature.key || !newFeature.value) return;

        try {
            setLoading(true);
            const payload = {
                price_item_id: packageItem.id,
                feature_key: newFeature.key,
                feature_value: newFeature.value,
                feature_description: newFeature.description,
            };
            const response = await pricingApi.addFeature(payload);
            setFeatures([...features, response.data]);
            setNewFeature({ key: '', value: '', description: '' });
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDeleteFeature = async (id) => {
        try {
            await pricingApi.deleteFeature(id);
            setFeatures(features.filter(f => f.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Features</h2>
                        <p className="text-sm text-gray-500">For package: <span className="font-semibold text-primary">{packageItem?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Add New Feature Form */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Add New Feature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <input
                                placeholder="Key (e.g., MAX_PHOTOS)"
                                value={newFeature.key}
                                onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value.toUpperCase() })}
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <input
                                placeholder="Value (e.g., UNLIMITED)"
                                value={newFeature.value}
                                onChange={(e) => setNewFeature({ ...newFeature, value: e.target.value })}
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <input
                                placeholder="Description (e.g., Unlimited Photos)"
                                value={newFeature.description}
                                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddFeature}
                            disabled={loading || !newFeature.key || !newFeature.value}
                            className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Add Feature
                        </button>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {features.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No features added yet.
                            </div>
                        ) : (
                            features.map((feature) => (
                                <div key={feature.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                        <div>
                                            <span className="text-xs text-gray-400 block">KEY</span>
                                            <span className="font-mono text-sm font-bold text-gray-700">{feature.feature_key}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">VALUE</span>
                                            <span className="font-medium text-gray-900">{feature.feature_value}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">DESCRIPTION</span>
                                            <span className="text-sm text-gray-600">{feature.feature_description || '-'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFeature(feature.id)}
                                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageFeaturesModal;
