import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Settings, Variable, ShieldAlert, Cpu } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function SystemLimits() {
    // Mock data - would come from an API endpoint like /api/config/system
    const [limits, setLimits] = useState([
        { id: 1, key: 'FREE_AD_LIMIT', label: 'Free Ads per User', value: '3', type: 'number', category: 'User Limits', description: 'Maximum free ads a standard user can post.' },
        { id: 2, key: 'FREE_IMAGE_LIMIT', label: 'Free Images per Ad', value: '5', type: 'number', category: 'User Limits', description: 'Number of images allowed for free listings.' },
        { id: 3, key: 'PREMIUM_PRICE_BASE', label: 'Base Premium Price ($)', value: '19.99', type: 'number', category: 'Pricing', description: 'Starting price for premium ad placement.' },
        { id: 4, key: 'AD_EXPIRY_DAYS', label: 'Ad Expiry Duration', value: '30', type: 'number', category: 'General', description: 'Days before an ad automatically expires.' },
        { id: 5, key: 'MAX_IMAGE_SIZE_MB', label: 'Max Image Size (MB)', value: '5', type: 'number', category: 'System', description: 'Maximum file size for image uploads.' },
        { id: 6, key: 'AUTO_APPROVE_ADS', label: 'Auto-Approve Ads', value: 'false', type: 'boolean', category: 'System', description: 'Automatically approve ads without review.' },
    ]);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // In a real app, show a toast notification here
            alert("System configuration updated successfully!");
        }, 1000);
    };

    const handleChange = (id, newValue) => {
        setLimits(limits.map(l => l.id === id ? { ...l, value: newValue } : l));
    };

    // Group limits by category
    const groupedLimits = limits.reduce((acc, limit) => {
        if (!acc[limit.category]) acc[limit.category] = [];
        acc[limit.category].push(limit);
        return acc;
    }, {});

    return (
        <div className="space-y-6 pb-20">
            <PageHeader 
                title="System Configuration" 
                subtitle="Manage global application parameters and constraints."
                breadcrumbs={['Dashboard', 'Settings', 'Limits']}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Configuration Form */}
                <div className="lg:col-span-2 space-y-8">
                    {Object.entries(groupedLimits).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up">
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                    {category === 'System' ? <Cpu size={18} /> : 
                                     category === 'Pricing' ? <Variable size={18} /> : 
                                     <Settings size={18} />}
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">{category}</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {items.map(limit => (
                                    <div key={limit.id} className="group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-1 group-hover:text-primary transition-colors">
                                                    {limit.label}
                                                </label>
                                                <p className="text-xs text-gray-500 mb-1">{limit.description}</p>
                                                <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-mono rounded">
                                                    {limit.key}
                                                </span>
                                            </div>
                                            <div className="w-full md:w-48">
                                                {limit.type === 'boolean' ? (
                                                    <select
                                                        value={limit.value}
                                                        onChange={(e) => handleChange(limit.id, e.target.value)}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-700 cursor-pointer"
                                                    >
                                                        <option value="true">Enabled</option>
                                                        <option value="false">Disabled</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={limit.type}
                                                        value={limit.value}
                                                        onChange={(e) => handleChange(limit.id, e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-800 text-right shadow-sm focus:shadow-md"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500 flex-shrink-0">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Critical Warning</h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                                    Changing these values affects the live environment immediately. 
                                    Ensure you understand the impact on user experience and pricing logic before saving.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-left flex items-center justify-between group"
                            >
                                <span>Reset Defaults</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↺</span>
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-left flex items-center justify-between group">
                                <span>Export Config</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">⬇</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Bar */}
            <div className="fixed bottom-6 right-6 lg:right-10 z-30">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${loading ? 'opacity-80 cursor-wait' : ''}`}
                >
                    <Save size={20} className={loading ? 'animate-pulse' : ''} />
                    {loading ? 'Committing Changes...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
}
