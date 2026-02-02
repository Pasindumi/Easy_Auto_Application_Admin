import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Check, X, ArrowRight, Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import showToast from '../../utils/toast';

export default function VehicleTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const navigate = useNavigate();

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/vehicle-config/types');
            setTypes(res.data);
        } catch (error) {
            console.error(error);
            showToast.error('Failed to fetch vehicle types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleCreate = async () => {
        if (!newTypeName) {
            showToast.error('Please enter a type name');
            return;
        }
        const loadingToast = showToast.loading('Creating vehicle type...');
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/vehicle-config/types', {
                type_name: newTypeName
            }, { headers: { Authorization: `Bearer ${token}` } });

            showToast.dismiss(loadingToast);
            showToast.success('Vehicle type created successfully');
            setNewTypeName('');
            setShowModal(false);
            fetchTypes();
        } catch (error) {
            showToast.dismiss(loadingToast);
            showToast.error('Failed to create type');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        const loadingToast = showToast.loading(`${newStatus === 'ACTIVE' ? 'Enabling' : 'Disabling'} type...`);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/vehicle-config/types/${id}`, {
                status: newStatus
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            showToast.dismiss(loadingToast);
            showToast.success(`Type ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'} successfully`);
            fetchTypes();
        } catch (error) {
            showToast.dismiss(loadingToast);
            showToast.error('Failed to update status');
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Vehicle Types</h1>
                    <p className="text-gray-500">Manage vehicle categories and their configurations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-smooth shadow-primary font-semibold"
                >
                    <Plus size={20} />
                    Add Type
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <Card className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" message="Loading vehicle types..." />
                </Card>
            ) : types.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Tags}
                        title="No vehicle types"
                        description="Get started by creating your first vehicle type"
                        action={() => setShowModal(true)}
                        actionLabel="Add Type"
                    />
                </Card>
            ) : (
                <Card padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {types.map((type, idx) => (
                                    <tr key={type.id} className="hover:bg-gray-50 transition-smooth animate-slide-up" style={{animationDelay: `${idx * 0.05}s`}}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Tags className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="font-semibold text-gray-900 text-lg">{type.type_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={type.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                                                {type.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/vehicle-types/${type.id}`)}
                                                    className="flex items-center gap-1 text-primary hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
                                                >
                                                    Configure <ArrowRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(type.id, type.status)}
                                                    className={`p-2 rounded-lg transition-smooth ${
                                                        type.status === 'ACTIVE' 
                                                            ? 'text-red-500 hover:bg-red-50' 
                                                            : 'text-green-500 hover:bg-green-50'
                                                    }`}
                                                    title={type.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                                >
                                                    {type.status === 'ACTIVE' ? <X size={20} /> : <Check size={20} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900">Add Vehicle Type</h3>
                            <p className="text-sm text-gray-500 mt-1">Create a new vehicle category</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Type Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth text-gray-800"
                                    placeholder="e.g. Electric Scooter"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleCreate()}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewTypeName('');
                                    }} 
                                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-smooth"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreate} 
                                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 font-semibold transition-smooth shadow-primary"
                                >
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
