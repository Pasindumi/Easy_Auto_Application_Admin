import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Check, X, ArrowRight, Settings, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

export default function VehicleTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/vehicle-config/types');
            setTypes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleCreate = async () => {
        if (!newTypeName) return;
        setRefreshing(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/vehicle-config/types', {
                type_name: newTypeName
            }, { headers: { Authorization: `Bearer ${token}` } });

            setNewTypeName('');
            setShowModal(false);
            fetchTypes();
        } catch (error) {
            alert('Failed to create type');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
            await axios.put(`http://localhost:5000/api/vehicle-config/types/${id}/status`, {
                status: newStatus
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchTypes();
        } catch (error) {
            console.error('Error toggling status:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Failed to update status');
            }
        }
    };

    // Calculate stats
    const totalTypes = types.length;
    const activeTypes = types.filter(t => t.status === 'ACTIVE').length;
    const disabledTypes = totalTypes - activeTypes;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Vehicle Configuration" 
                subtitle="Manage vehicle types, brands, and attributes."
                breadcrumbs={['Dashboard', 'Settings', 'Vehicle Types']}
                actions={
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        Add New Type
                    </button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <Settings size={24} />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Total Configuration Types</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalTypes}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Active & Public</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{activeTypes}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Disabled / Hidden</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{disabledTypes}</h3>
                    </div>
                </div>
            </div>

            {/* Types Grid / Table */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">All Vehicle Types</h3>
                    <p className="text-sm text-gray-500"> manage categories like Cars, Bikes, Vans etc.</p>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading configurations...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {types.map((type, index) => (
                            <div key={type.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                                        index % 3 === 0 ? 'bg-blue-100 text-blue-600' :
                                        index % 3 === 1 ? 'bg-purple-100 text-purple-600' :
                                        'bg-orange-100 text-orange-600'
                                    }`}>
                                        {type.type_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                            {type.type_name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                type.status === 'ACTIVE' 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {type.status}
                                            </span>
                                            <span className="text-xs text-gray-400">• ID: {type.id.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleStatus(type.id, type.status)}
                                        className={`p-2 rounded-xl transition-all ${
                                            type.status === 'ACTIVE' 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                        title={type.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                    >
                                        {type.status === 'ACTIVE' ? <X size={18} /> : <Check size={18} />}
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate(`/vehicle-types/${type.id}`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                                    >
                                        <Settings size={16} />
                                        Configure
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {types.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="font-medium">No vehicle types found.</p>
                                <p className="text-sm">Get started by creating a new category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-slide-up border border-gray-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Add Vehicle Type</h3>
                            <p className="text-gray-500 mt-1">Create a new category for listings</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Type Name</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-lg"
                                    placeholder="e.g. Electric Scooter"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreate} 
                                    disabled={!newTypeName || refreshing}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {refreshing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
                                    Create Type
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
