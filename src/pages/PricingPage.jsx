import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Package, 
    Tag, 
    Layers, 
    DollarSign, 
    Settings, 
    CheckCircle2,
    XCircle,
    ShoppingBag
} from 'lucide-react';
import { pricingApi, configApi } from '../api';
import ManagePackageModal from '../components/ManagePackageModal';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('ads'); // 'ads' | 'items' | 'rules'
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

    // Selection States
    const [selectedItem, setSelectedItem] = useState(null); 
    const [newItem, setNewItem] = useState({ code: '', name: '', item_type: 'AD', description: '', status: 'ACTIVE' });
    const [editingItemId, setEditingItemId] = useState(null);
    const [newRule, setNewRule] = useState({ price_item_id: '', vehicle_type_id: '', price: '', unit: 'PER_AD', free_image_count: 0, description_limit: 500, min_qty: 1 });
    const [editingRuleId, setEditingRuleId] = useState(null);

    useEffect(() => {
        fetchData();
        fetchVehicleTypes();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, rulesRes] = await Promise.all([
                pricingApi.getItems(),
                pricingApi.getRules()
            ]);
            setItems(itemsRes.data);
            setRules(rulesRes.data);
        } catch (error) {
            console.error("Fetch Error:", error);
            if (error.response?.status === 404 || error.response?.status === 500) {
                 console.warn("Pricing endpoints are currently unavailable.");
            }
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

    // ... Handle Save Logic (Same as before but cleaner) ...
    const handleSaveItem = async () => {
        if (!newItem.name?.trim() || !newItem.code?.trim()) {
            alert("Item Name and Code are required.");
            return;
        }
        try {
            if (editingItemId) {
                await pricingApi.updateItem(editingItemId, newItem);
            } else {
                await pricingApi.createItem(newItem);
            }
            setIsItemModalOpen(false);
            setEditingItemId(null);
            fetchData();
            setNewItem({ code: '', name: '', item_type: 'AD', description: '', status: 'ACTIVE' });
        } catch (error) {
            console.error("Save Error:", error);
            if (!error.response) {
                alert(`Network/Connection Error: ${error.message}. Please ensure the backend server is running.`);
            } else {
                const backendMsg = error.response.data?.error || error.response.data?.message;
                const debugInfo = typeof error.response.data === 'string' ? 'HTML Response (404/500)' : JSON.stringify(error.response.data || {}, null, 2);
                alert(`Error ${error.response.status} on ${error.config?.method?.toUpperCase()} ${error.config?.url}:\n\n${backendMsg || 'No specific error message.'}\n\nDebug Details:\n${debugInfo}`);
            }
        }
    };

    const handleEditItem = (item) => {
        setNewItem({
            code: item.code,
            name: item.name,
            item_type: item.item_type,
            description: item.description || '',
            status: item.status
        });
        setEditingItemId(item.id);
        setIsItemModalOpen(true);
    };

    const handleSaveRule = async () => {
        try {
            let ruleToSubmit = { ...newRule };
            if (!ruleToSubmit.price_item_id) {
                const adItem = items.find(i => i.item_type === 'AD');
                if (adItem) {
                    ruleToSubmit.price_item_id = adItem.id;
                } else {
                    // Reverted: No auto-create. Instruct user to fix data manually.
                    alert("No 'AD' Price Item found. Please go to the 'Items' tab and create a new item with Type: 'AD (Basic Listing)' first.");
                    return; 
                }
            }
            if (ruleToSubmit.vehicle_type_id === '') ruleToSubmit.vehicle_type_id = null;
            if (ruleToSubmit.price === '') ruleToSubmit.price = 0;

            if (editingRuleId) {
                await pricingApi.updateRule(editingRuleId, ruleToSubmit);
            } else {
                await pricingApi.createRule(ruleToSubmit);
            }
            setIsRuleModalOpen(false);
            setEditingRuleId(null);
            fetchData();
            setNewRule({ price_item_id: '', vehicle_type_id: '', price: '', unit: 'PER_AD', free_image_count: 0, description_limit: 500, min_qty: 1 });
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving rule');
        }
    };

    const handleEditRule = (rule) => {
        setNewRule({
            price_item_id: rule.price_item_id,
            vehicle_type_id: rule.vehicle_type_id || '',
            price: rule.price,
            unit: rule.unit,
            free_image_count: rule.free_image_count || 0,
            description_limit: rule.description_limit || 500,
            min_qty: rule.min_qty || 1
        });
        setEditingRuleId(rule.id);
        setIsRuleModalOpen(true);
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

    // --- Columns Definitions ---

    const adsColumns = [
        {
            header: 'Vehicle Type',
            accessor: 'vehicle_types',
            render: (rule) => (
                <div className="flex items-center gap-2 font-bold text-gray-800">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Tag size={16} /></span>
                    {rule.vehicle_types?.type_name || 'All Vehicle Types'}
                </div>
            )
        },
        {
            header: 'Price',
            accessor: 'price',
            render: (rule) => (
                <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                    ${Number(rule.price).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Features Included',
            accessor: 'features',
            render: (rule) => (
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                        {rule.free_image_count >= 100 ? 'Unlimited Images' : `${rule.free_image_count} Images`}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                        {rule.description_limit >= 10000 ? 'Unlimited Text' : `${rule.description_limit} Chars`}
                    </span>
                </div>
            )
        },
        {
            header: '',
            align: 'right',
            render: (rule) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEditRule(rule)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const itemColumns = [
        {
            header: 'Item Details',
            accessor: 'name',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${item.item_type === 'PACKAGE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {item.item_type === 'PACKAGE' ? <Package size={20} /> : <Tag size={20} />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: 'item_type',
            render: (item) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    item.item_type === 'PACKAGE' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                    item.item_type === 'BOOST' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                    {item.item_type}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (item) => (
                <span className={`flex items-center gap-1.5 text-xs font-bold ${item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.status === 'ACTIVE' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {item.status}
                </span>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end gap-2">
                    {item.item_type === 'PACKAGE' && (
                        <button 
                            onClick={() => { setSelectedItem(item); setIsFeatureModalOpen(true); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 mr-2"
                        >
                            <Layers size={14} /> Features
                        </button>
                    )}
                    <button onClick={() => handleEditItem(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const rulesColumns = [
        {
            header: 'Target Item',
            accessor: 'price_items',
            render: (rule) => (
                <span className="font-bold text-gray-800">{rule.price_items?.name}</span>
            )
        },
        {
            header: 'Category Scope',
            accessor: 'vehicle_types',
            render: (rule) => (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {rule.vehicle_types?.type_name || 'Global (All Types)'}
                </span>
            )
        },
        {
            header: 'Pricing',
            accessor: 'price',
            render: (rule) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">${Number(rule.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-500 uppercase">/ {rule.unit.replace('_', ' ')}</span>
                </div>
            )
        },
        {
            header: '',
            align: 'right',
            render: (rule) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEditRule(rule)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Monetization Strategy" 
                subtitle="Configure pricing for ads, premium packages, and listing fees."
                breadcrumbs={['Dashboard', 'Pricing']}
                actions={
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                         {['ads', 'items', 'rules'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    activeTab === tab 
                                        ? 'bg-white text-primary shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {tab === 'ads' ? 'Ad Prices' : tab === 'items' ? 'Items' : 'All Rules'}
                            </button>
                         ))}
                    </div>
                }
            />

            {/* Content Area */}
            {activeTab === 'ads' && (
                <DataTable 
                    columns={adsColumns}
                    data={rules.filter(r => r.unit === 'PER_AD')}
                    loading={loading}
                    emptyState={{ title: "No Ad Prices", description: "Set the base price for posting advertisements." }}
                    actions={
                        <button 
                            onClick={() => {
                                setNewRule({ price_item_id: '', vehicle_type_id: '', price: '', unit: 'PER_AD', free_image_count: 0, description_limit: 500, min_qty: 1 });
                                setEditingRuleId(null);
                                setIsRuleModalOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <Plus size={16} /> Set Ad Price
                        </button>
                    }
                />
            )}

            {activeTab === 'items' && (
                <DataTable 
                    columns={itemColumns}
                    data={items}
                    loading={loading}
                    emptyState={{ title: "No Price Items", description: "Create items like 'Gold Package' or 'Ad Posting'." }}
                    actions={
                        <button 
                            onClick={() => {
                                setNewItem({ code: '', name: '', item_type: 'AD', description: '', status: 'ACTIVE' });
                                setEditingItemId(null);
                                setIsItemModalOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    }
                />
            )}

            {activeTab === 'rules' && (
                <DataTable 
                    columns={rulesColumns}
                    data={rules}
                    loading={loading}
                    emptyState={{ title: "No Rules", description: "No pricing rules defined yet." }}
                    actions={
                        <button 
                            onClick={() => {
                                setNewRule({ price_item_id: '', vehicle_type_id: '', price: '', unit: 'PER_AD', free_image_count: 0, description_limit: 500, min_qty: 1 });
                                setEditingRuleId(null);
                                setIsRuleModalOpen(true);
                            }}
                            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-gray-900/20"
                        >
                            <Plus size={16} /> Add Custom Rule
                        </button>
                    }
                />
            )}

            {/* Item Modal - Simplified inline for brevity */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                            <Tag className="text-primary" /> {editingItemId ? 'Edit Item' : 'New Price Item'}
                        </h2>
                        <div className="space-y-4">
                            <input className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder="Item Name (e.g. Gold Plan)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <input className="border-gray-200 bg-gray-50 rounded-xl p-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary/20" placeholder="CODE" value={newItem.code} onChange={e => setNewItem({ ...newItem, code: e.target.value })} />
                                <select className="border-gray-200 bg-gray-50 rounded-xl p-3 outline-none" value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <select className="width-full border-gray-200 bg-gray-50 rounded-xl p-3 w-full outline-none" value={newItem.item_type} onChange={e => setNewItem({ ...newItem, item_type: e.target.value })}>
                                <option value="AD">AD (Basic Listing)</option>
                                <option value="BOOST">BOOST (Promotion)</option>
                                <option value="PACKAGE">PACKAGE (Subscription)</option>
                                <option value="EXTRA">EXTRA (Add-on)</option>
                            </select>
                            <textarea className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none" rows={3} placeholder="Description..." value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}></textarea>
                            
                            <div className="flex gap-3 justify-end pt-2">
                                <button onClick={() => setIsItemModalOpen(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleSaveItem} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Save Item</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule Modal */}
            {isRuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                            <DollarSign className="text-green-600" /> {editingRuleId ? 'Edit Rule' : 'Pricing Rule'}
                        </h2>
                        
                        <div className="space-y-4">
                            {activeTab !== 'ads' && (
                                <select className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none" value={newRule.price_item_id} onChange={e => setNewRule({ ...newRule, price_item_id: e.target.value })}>
                                    <option value="">Select Item...</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                                </select>
                            )}
                            
                            <select className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none" value={newRule.vehicle_type_id || ''} onChange={e => setNewRule({ ...newRule, vehicle_type_id: e.target.value || null })}>
                                <option value="">All Vehicle Types (Global)</option>
                                {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.type_name}</option>)}
                            </select>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                                    <input type="number" className="w-full border-gray-200 bg-gray-50 rounded-xl pl-8 p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-green-500/20" value={newRule.price} onChange={e => setNewRule({ ...newRule, price: e.target.value })} placeholder="0.00" />
                                </div>
                                {activeTab !== 'ads' ? (
                                    <select className="border-gray-200 bg-gray-50 rounded-xl p-3 outline-none font-medium" value={newRule.unit} onChange={e => setNewRule({ ...newRule, unit: e.target.value })}>
                                        <option value="PER_AD">Per Ad</option>
                                        <option value="PER_IMAGE">Per Image</option>
                                        <option value="PER_DAY">Per Day</option>
                                        <option value="ONE_TIME">One Time</option>
                                        <option value="PER_MONTH">Per Month</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center px-4 bg-gray-100 rounded-xl text-gray-500 font-bold text-sm">PER POSTING</div>
                                )}
                            </div>

                            {activeTab === 'ads' && (
                                <div className="bg-blue-50/50 p-4 rounded-xl space-y-3 border border-blue-100">
                                    <label className="text-xs font-bold text-blue-800 uppercase tracking-wider">Plan Limits</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Free Images</p>
                                            <input type="number" className="w-full border-gray-200 bg-white rounded-xl p-2 text-sm font-bold" value={newRule.free_image_count} onChange={e => setNewRule({ ...newRule, free_image_count: e.target.value })} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Desc. Chars</p>
                                            <input type="number" className="w-full border-gray-200 bg-white rounded-xl p-2 text-sm font-bold" value={newRule.description_limit} onChange={e => setNewRule({ ...newRule, description_limit: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                             <div className="flex gap-3 justify-end pt-4">
                                <button onClick={() => setIsRuleModalOpen(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handleSaveRule} className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-900/20">Save Rule</button>
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
