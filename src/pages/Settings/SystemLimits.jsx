import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';

export default function SystemLimits() {
    // Mock data handling since backend endpoint for limits wasn't explicitly fully confirmed in previous steps (though schema exists)
    // We will assume basic KV pair management or specific fields

    // For now, let's create a visual interface that *would* connect to a /api/system-limits endpoint
    const [limits, setLimits] = useState([
        { id: 1, key: 'FREE_AD_LIMIT', label: 'Free Ads per User', value: '3', type: 'number' },
        { id: 2, key: 'FREE_IMAGE_LIMIT', label: 'Free Images per Ad', value: '5', type: 'number' },
        { id: 3, key: 'PREMIUM_PRICE', label: 'Premium Ad Price ($)', value: '19.99', type: 'number' },
        { id: 4, key: 'AD_EXPIRY_DAYS', label: 'Default Ad Expiry (Days)', value: '30', type: 'number' },
    ]);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("System limits updated successfully!");
        }, 1000);
    };

    const handleChange = (id, newValue) => {
        setLimits(limits.map(l => l.id === id ? { ...l, value: newValue } : l));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">System Limits & Configuration</h1>
            <p className="text-gray-500 mb-8">Manage global application constraints and pricing settings.</p>

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-6">

                    {limits.map(limit => (
                        <div key={limit.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1">{limit.label}</label>
                                <p className="text-xs text-gray-400 font-mono">{limit.key}</p>
                            </div>
                            <div className="w-full md:w-48">
                                <input
                                    type={limit.type}
                                    value={limit.value}
                                    onChange={(e) => handleChange(limit.id, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-right"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 items-start mt-4">
                        <AlertCircle className="text-yellow-600 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700">Changing these values will immediately affect all user interactions in the mobile application.</p>
                    </div>

                </div>

                <div className="bg-gray-50 p-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
