import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { configApi } from '../../api';
import { ArrowLeft, Trash2, Plus, Info, Image as ImageIcon, X, Edit2 } from 'lucide-react';

export default function VehicleTypeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [type, setType] = useState(null);
    const [brands, setBrands] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [models, setModels] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [newBrand, setNewBrand] = useState('');
    const [brandImage, setBrandImage] = useState(null);
    const [brandImagePreview, setBrandImagePreview] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null); // { id, name, image }
    const [newAttr, setNewAttr] = useState({ name: '', dataType: 'TEXT', unit: '', required: false });
    const [newModel, setNewModel] = useState({ brand_id: '', model_name: '' });
    const [newCondition, setNewCondition] = useState('');

    const fetchDetails = async () => {
        try {
            // Fetch Type Info
            const typesRes = await configApi.getTypes();
            const found = typesRes.data.find(t => t.id === id);
            setType(found);

            const brandsRes = await configApi.getBrands(id);
            setBrands(brandsRes.data);

            const attrsRes = await configApi.getAttributes(id);
            setAttributes(attrsRes.data);

            const modelsRes = await configApi.getModels(id);
            setModels(modelsRes.data);

            const conditionsRes = await configApi.getConditions(id);
            setConditions(conditionsRes.data);

        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImage(file);
            setBrandImagePreview(URL.createObjectURL(file));
        }
    };

    const addBrand = async () => {
        if (!newBrand) return;
        try {
            const formData = new FormData();
            formData.append('vehicle_type_id', id);
            formData.append('brand_name', newBrand);
            if (brandImage) {
                formData.append('brand_image', brandImage);
            }

            if (editingBrand) {
                await configApi.updateBrand(editingBrand.id, formData);
            } else {
                await configApi.addBrand(formData);
            }

            setNewBrand('');
            setBrandImage(null);
            setBrandImagePreview(null);
            setEditingBrand(null);
            fetchDetails();
        } catch (e) {
            console.error('Error saving brand:', e);
            alert('Error saving brand');
        }
    };

    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        setNewBrand(brand.brand_name);
        setBrandImagePreview(brand.brand_image);
        setBrandImage(null); // Only set if user selects a new one
    };

    const cancelEdit = () => {
        setEditingBrand(null);
        setNewBrand('');
        setBrandImage(null);
        setBrandImagePreview(null);
    };

    const addAttribute = async () => {
        if (!newAttr.name) return;
        try {
            await configApi.addAttribute({
                vehicle_type_id: id,
                attribute_name: newAttr.name,
                data_type: newAttr.dataType,
                unit: newAttr.unit,
                is_required: newAttr.required,
                options: [] // Simplified for now
            });
            setNewAttr({ name: '', dataType: 'TEXT', unit: '', required: false });
            fetchDetails();
        } catch (e) {
            console.error('Error adding attribute:', e);
            alert('Error adding attribute');
        }
    };

    const addModel = async () => {
        if (!newModel.brand_id || !newModel.model_name) return;
        try {
            await configApi.addModel({
                vehicle_type_id: id,
                brand_id: newModel.brand_id,
                model_name: newModel.model_name
            });
            setNewModel({ brand_id: '', model_name: '' });
            fetchDetails();
        } catch (e) {
            console.error('Error adding model:', e);
            alert('Error adding model');
        }
    };

    const addCondition = async () => {
        if (!newCondition) return;
        try {
            await configApi.addCondition({
                vehicle_type_id: id,
                condition_name: newCondition
            });
            setNewCondition('');
            fetchDetails();
        } catch (e) {
            console.error('Error adding condition:', e);
            alert('Error adding condition');
        }
    };

    const deleteCondition = async (condId) => {
        if (!window.confirm('Are you sure you want to delete this condition?')) return;
        try {
            await configApi.deleteCondition(condId);
            fetchDetails();
        } catch (e) {
            console.error('Error deleting condition:', e);
            alert('Error deleting condition');
        }
    };

    if (!type && !loading) return <div>Type not found</div>;

    return (
        <div>
            <button onClick={() => navigate('/vehicle-types')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} /> Back to Types
            </button>

            <p className="text-gray-500 mb-8">Manage brands and specific attributes for this vehicle type.</p>

            {/* Expiry Settings Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Info size={20} className="text-blue-500" />
                    Ad Expiry Settings
                </h2>
                <div className="flex items-end gap-4 max-w-md">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Period (Days)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="e.g. 30"
                            value={type?.expiry_days || ''}
                            onChange={e => setType({ ...type, expiry_days: parseInt(e.target.value) })}
                        />
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                await configApi.updateType(id, { expiry_days: type.expiry_days });
                                alert('Expiry settings updated successfully');
                                fetchDetails();
                            } catch (e) {
                                console.error('Error updating expiry:', e);
                                alert('Error updating expiry settings');
                            }
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600"
                    >
                        Save Settings
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">This is the default duration for advertisements of this vehicle type. After this period, ads will be automatically marked as EXPIRED.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Brands Column */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold mb-4">Brands</h2>
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-gray-300 rounded-lg p-2"
                                placeholder="Brand Name (e.g. Toyota)"
                                value={newBrand}
                                onChange={e => setNewBrand(e.target.value)}
                            />
                            {editingBrand && (
                                <button onClick={cancelEdit} className="px-3 text-gray-400 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                                    {brandImagePreview ? (
                                        <img src={brandImagePreview} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={24} />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Upload brand logo (PNG/JPG, max 5MB)</p>
                                <button
                                    onClick={addBrand}
                                    className={`w-full py-2 rounded-lg font-medium transition ${editingBrand ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                                >
                                    {editingBrand ? 'Update Brand' : 'Add Brand'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {brands.map(b => (
                            <div key={b.id} className="group relative bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center text-center hover:border-blue-200 transition-all shadow-sm">
                                <div className="w-12 h-12 mb-2 flex items-center justify-center bg-white rounded-lg shadow-inner overflow-hidden">
                                    {b.brand_image ? (
                                        <img src={b.brand_image} alt={b.brand_name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-300">{b.brand_name[0]}</span>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 truncate w-full">{b.brand_name}</span>

                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1">
                                    <button onClick={() => handleEditBrand(b)} className="text-blue-500 hover:text-blue-700 p-1">
                                        <Edit2 size={14} />
                                    </button>
                                    {/* <button className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 size={14} />
                                    </button> */}
                                </div>
                            </div>
                        ))}
                        {brands.length === 0 && <p className="text-gray-400 text-sm col-span-full">No brands added yet.</p>}
                    </div>
                </div>

                {/* Attributes Column */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold mb-4">Attributes</h2>

                    {/* Add Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                        <input
                            className="w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Attribute Name (e.g. Mileage)"
                            value={newAttr.name}
                            onChange={e => setNewAttr({ ...newAttr, name: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <select
                                className="border border-gray-300 rounded-lg p-2 flex-1"
                                value={newAttr.dataType}
                                onChange={e => setNewAttr({ ...newAttr, dataType: e.target.value })}
                            >
                                <option value="TEXT">Text</option>
                                <option value="NUMBER">Number</option>
                                <option value="BOOLEAN">Boolean</option>
                                <option value="DROPDOWN">Dropdown</option>
                            </select>
                            <input
                                className="border border-gray-300 rounded-lg p-2 w-24"
                                placeholder="Unit"
                                value={newAttr.unit}
                                onChange={e => setNewAttr({ ...newAttr, unit: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="req"
                                checked={newAttr.required}
                                onChange={e => setNewAttr({ ...newAttr, required: e.target.checked })}
                            />
                            <label htmlFor="req" className="text-sm font-medium">Required Field</label>
                        </div>
                        <button onClick={addAttribute} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600">Add Attribute</button>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {attributes.map(a => (
                            <div key={a.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                                <div>
                                    <p className="font-semibold text-gray-800">{a.attribute_name} <span className="text-xs text-gray-400 font-normal">({a.data_type})</span></p>
                                    {a.unit && <p className="text-xs text-gray-500">Unit: {a.unit}</p>}
                                </div>
                                <div className="flex gap-2">
                                    {a.is_required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Reqiured</span>}
                                </div>
                            </div>
                        ))}
                        {attributes.length === 0 && <p className="text-gray-400 text-sm">No attributes added yet.</p>}
                    </div>
                </div>
            </div>

            {/* Conditions Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4">Conditions</h2>
                <div className="flex gap-2 mb-4 max-w-md">
                    <input
                        className="flex-1 border border-gray-300 rounded-lg p-2"
                        placeholder="Add Condition (e.g. Brand New)"
                        value={newCondition}
                        onChange={e => setNewCondition(e.target.value)}
                    />
                    <button onClick={addCondition} className="bg-gray-900 text-white px-4 rounded-lg hover:bg-black">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                        <div key={c.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                            {c.condition_name}
                            <button onClick={() => deleteCondition(c.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {conditions.length === 0 && <p className="text-gray-400 text-sm">No conditions added yet (e.g. Used, Brand New).</p>}
                </div>
            </div>

            {/* Models Section - Full Width */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4">Models</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Model Form */}
                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg h-fit">
                        <h3 className="font-semibold mb-3 text-gray-700">Add New Model</h3>
                        <div className="space-y-3">
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newModel.brand_id}
                                onChange={e => setNewModel({ ...newModel, brand_id: e.target.value })}
                            >
                                <option value="">Select Brand</option>
                                {brands.map(b => (
                                    <option key={b.id} value={b.id}>{b.brand_name}</option>
                                ))}
                            </select>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-2"
                                placeholder="Model Name (e.g. Corolla)"
                                value={newModel.model_name}
                                onChange={e => setNewModel({ ...newModel, model_name: e.target.value })}
                            />
                            <button
                                onClick={addModel}
                                disabled={!newModel.brand_id || !newModel.model_name}
                                className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Model
                            </button>
                        </div>
                    </div>

                    {/* Models List */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {models.map(m => (
                                <div key={m.id} className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col">
                                    <span className="font-bold text-gray-800">{m.model_name}</span>
                                    <span className="text-sm text-gray-500">{m.vehicle_brands?.brand_name}</span>
                                </div>
                            ))}
                            {models.length === 0 && <p className="text-gray-400 text-sm col-span-full">No models added yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
