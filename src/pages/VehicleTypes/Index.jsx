import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VehicleTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const navigate = useNavigate();

    const fetchTypes = async () => {
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
                alert('Session expired. Please login again.');
                navigate('/login');
            } else {
                alert('Failed to update status');
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Vehicle Types</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    <Plus size={20} />
                    Add Type
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Type Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {types.map(type => (
                            <tr key={type.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{type.type_name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${type.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {type.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => navigate(`/vehicle-types/${type.id}`)}
                                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium"
                                    >
                                        Configure <ArrowRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(type.id, type.status)}
                                        className={`p-2 rounded-lg ${type.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                        title={type.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                    >
                                        {type.status === 'ACTIVE' ? <X size={18} /> : <Check size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Add Vehicle Type</h3>
                        <input
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                            placeholder="e.g. Electric Scooter"
                            value={newTypeName}
                            onChange={e => setNewTypeName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
