import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, Tag, Layers, MoreVertical, DollarSign, Calendar } from 'lucide-react';
import { pricingApi } from '../api';
import ManagePackageModal from '../components/ManagePackageModal';

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'rules'
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

    // Selection States
    const [selectedItem, setSelectedItem] = useState(null); // For editing or adding features
    const [newItem, setNewItem] = useState({ code: '', name: '', item_type: 'AD', description: '', status: 'ACTIVE' });
    const [newRule, setNewRule] = useState({ price_item_id: '', price: '', unit: 'PER_AD', min_qty: 1 });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'items') {
                const res = await pricingApi.getItems();
                setItems(res.data);
            } else {
                const res = await pricingApi.getRules();
                setRules(res.data);
                // Also need items for dropdown
                const itemRes = await pricingApi.getItems();
                setItems(itemRes.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async () => {
        try {
            await pricingApi.createItem(newItem);
            setIsItemModalOpen(false);
            fetchData();
            setNewItem({ code: '', name: '', item_type: 'AD', description: '', status: 'ACTIVE' });
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating item');
        }
    };

    const handleCreateRule = async () => {
        try {
            await pricingApi.createRule(newRule);
            setIsRuleModalOpen(false);
            fetchData();
            setNewRule({ price_item_id: '', price: '', unit: 'PER_AD', min_qty: 1 });
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating rule');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure? This will delete all associated rules and features!')) return;
        try {
            await pricingApi.deleteItem(id);
            fetchData();
        } catch (error) {
            alert('Error deleting item');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!window.confirm('Delete this pricing rule?')) return;
        try {
            await pricingApi.deleteRule(id);
            fetchData();
        } catch (error) {
            alert('Error deleting rule');
        }
    };

    const openFeatureModal = (item) => {
        setSelectedItem(item);
        setIsFeatureModalOpen(true);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Packages & Pricing</h1>
                <p className="text-gray-500">Manage your application's pricing packages, rules, and add-ons.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('items')}
                    className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${activeTab === 'items' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Price Items
                    {activeTab === 'items' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${activeTab === 'rules' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pricing Rules
                    {activeTab === 'rules' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {/* Content for Price Items */}
            {activeTab === 'items' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsItemModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Plus size={18} /> Add Price Item
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${item.item_type === 'PACKAGE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.item_type === 'PACKAGE' ? <Package size={24} /> : <Tag size={24} />}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{item.description || 'No description'}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono border border-gray-200">
                                            {item.code}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${item.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                {item.item_type === 'PACKAGE' && (
                                    <button
                                        onClick={() => openFeatureModal(item)}
                                        className="w-full mt-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Layers size={16} />
                                        Manage Package
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content for Pricing Rules */}
            {activeTab === 'rules' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsRuleModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Plus size={18} /> Add Pricing Rule
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle Type</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unit</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{rule.price_items?.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{rule.vehicle_types?.type_name || <span className="text-gray-400 italic">All Types</span>}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold font-mono">${rule.price}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{rule.unit}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rules.length === 0 && <div className="p-8 text-center text-gray-400">No pricing rules found.</div>}
                    </div>
                </div>
            )}

            {/* Modals */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add Price Item</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input className="w-full border rounded-lg p-2" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code (Unique)</label>
                                <input className="w-full border rounded-lg p-2 uppercase" value={newItem.code} onChange={e => setNewItem({ ...newItem, code: e.target.value })} placeholder="e.g. PACKAGE_GOLD" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select className="w-full border rounded-lg p-2" value={newItem.item_type} onChange={e => setNewItem({ ...newItem, item_type: e.target.value })}>
                                        <option value="AD">AD</option>
                                        <option value="BOOST">BOOST</option>
                                        <option value="EXTRA">EXTRA</option>
                                        <option value="PACKAGE">PACKAGE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select className="w-full border rounded-lg p-2" value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="w-full border rounded-lg p-2" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} rows={3} />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleCreateItem} className="px-4 py-2 bg-primary text-white rounded-lg">Create Item</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add Pricing Rule</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Item</label>
                                <select className="w-full border rounded-lg p-2" value={newRule.price_item_id} onChange={e => setNewRule({ ...newRule, price_item_id: e.target.value })}>
                                    <option value="">Select Item...</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                                </select>
                            </div>

                            {/* Note: Vehicle Types should technically be fetched too, simplified for now to generic or hardcoded if vehicle types API existed. Assuming null is allowed for All Types */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type (Optional)</label>
                                <select className="w-full border rounded-lg p-2" value={newRule.vehicle_type_id || ''} onChange={e => setNewRule({...newRule, vehicle_type_id: e.target.value || null})}>
                                    <option value="">All Types</option>
                                     Add vehicle types mapping here if available 
                                </select>
                            </div> */}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" className="w-full border rounded-lg pl-6 p-2" value={newRule.price} onChange={e => setNewRule({ ...newRule, price: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select className="w-full border rounded-lg p-2" value={newRule.unit} onChange={e => setNewRule({ ...newRule, unit: e.target.value })}>
                                        <option value="PER_AD">Per Ad</option>
                                        <option value="PER_IMAGE">Per Image</option>
                                        <option value="PER_DAY">Per Day</option>
                                        <option value="ONE_TIME">One Time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleCreateRule} className="px-4 py-2 bg-primary text-white rounded-lg">Create Rule</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ManagePackageModal
                isOpen={isFeatureModalOpen}
                onClose={() => setIsFeatureModalOpen(false)}
                packageItem={selectedItem}
                allItems={items}
            />

        </div>
    );
}
