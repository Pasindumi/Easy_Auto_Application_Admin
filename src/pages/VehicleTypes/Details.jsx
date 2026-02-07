import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { configApi } from '../../api';
import { 
    ArrowLeft, 
    Trash2, 
    Plus, 
    Info, 
    Image as ImageIcon, 
    X, 
    Edit2,
    Layers,
    Tag,
    List,
    Box,
    CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function VehicleTypeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [type, setType] = useState(null);
    const [brands, setBrands] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [models, setModels] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('brands');

    // Forms
    const [newBrand, setNewBrand] = useState('');
    const [brandImage, setBrandImage] = useState(null);
    const [brandImagePreview, setBrandImagePreview] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null);
    const [newAttr, setNewAttr] = useState({ name: '', dataType: 'TEXT', unit: '', required: false });
    const [newModel, setNewModel] = useState({ brand_id: '', model_name: '' });
    const [newCondition, setNewCondition] = useState('');

    const fetchDetails = async () => {
        try {
            const typesRes = await configApi.getTypes();
            const found = typesRes.data.find(t => t.id === id);
            setType(found);

            const [brandsRes, attrsRes, modelsRes, conditionsRes] = await Promise.all([
                configApi.getBrands(id),
                configApi.getAttributes(id),
                configApi.getModels(id),
                configApi.getConditions(id)
            ]);

            setBrands(brandsRes.data);
            setAttributes(attrsRes.data);
            setModels(modelsRes.data);
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
        setBrandImage(null);
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
                options: []
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

    if (!type && !loading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;

    const tabs = [
        { id: 'brands', label: 'Brands', icon: <Layers size={18} />, count: brands.length },
        { id: 'models', label: 'Models', icon: <Box size={18} />, count: models.length },
        { id: 'attributes', label: 'Attributes', icon: <List size={18} />, count: attributes.length },
        { id: 'conditions', label: 'Conditions', icon: <Tag size={18} />, count: conditions.length },
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title={`${type?.type_name || 'Vehicle'} Settings`}
                subtitle="Configure brands, models, and attributes for this category."
                breadcrumbs={['Dashboard', 'Vehicle Types', type?.type_name]}
                actions={
                    <button 
                        onClick={() => navigate('/vehicle-types')} 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                }
            />

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                            activeTab === tab.id 
                                ? 'bg-primary text-white shadow-md shadow-primary/20 transform scale-[1.02]' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 min-h-[500px] animate-fade-in">
                
                {/* BRANDS TAB */}
                {activeTab === 'brands' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Plus size={20} className="text-primary" />
                                    {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="e.g. Toyota"
                                            value={newBrand}
                                            onChange={e => setNewBrand(e.target.value)}
                                        />
                                        {editingBrand && (
                                            <button onClick={cancelEdit} className="px-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <label className="relative group cursor-pointer">
                                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden bg-white hover:border-primary transition-colors">
                                                {brandImagePreview ? (
                                                    <img src={brandImagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon className="text-blue-300" size={24} />
                                                )}
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            <div className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none">
                                                Change
                                            </div>
                                        </label>
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-600/70 font-medium mb-3">Upload a clean logo image (PNG/JPG)</p>
                                            <button
                                                onClick={addBrand}
                                                disabled={!newBrand}
                                                className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                            >
                                                {editingBrand ? 'Update Brand' : 'Save Brand'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {brands.map(b => (
                                    <div key={b.id} className="group relative bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => handleEditBrand(b)}>
                                        <div className="w-16 h-16 mb-3 flex items-center justify-center bg-white rounded-xl shadow-sm p-2">
                                            {b.brand_image ? (
                                                <img src={b.brand_image} alt={b.brand_name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-300">{b.brand_name[0]}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 w-full truncate">{b.brand_name}</span>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                <Edit2 size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {brands.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                        No brands added yet. Start by adding one.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ATTRIBUTES TAB */}
                {activeTab === 'attributes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 sticky top-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 text-purple-900">Add Attribute</h3>
                                <div className="space-y-4">
                                    <input
                                        className="w-full bg-white border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                                        placeholder="Name (e.g. Mileage)"
                                        value={newAttr.name}
                                        onChange={e => setNewAttr({ ...newAttr, name: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-white border border-purple-200 rounded-xl px-3 py-3 flex-1 text-sm font-semibold"
                                            value={newAttr.dataType}
                                            onChange={e => setNewAttr({ ...newAttr, dataType: e.target.value })}
                                        >
                                            <option value="TEXT">Text</option>
                                            <option value="NUMBER">Number</option>
                                            <option value="BOOLEAN">Yes/No</option>
                                            <option value="DROPDOWN">Dropdown</option>
                                        </select>
                                        <input
                                            className="bg-white border border-purple-200 rounded-xl px-3 py-3 w-24 text-sm font-medium"
                                            placeholder="Unit"
                                            value={newAttr.unit}
                                            onChange={e => setNewAttr({ ...newAttr, unit: e.target.value })}
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${newAttr.required ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                                            {newAttr.required && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={newAttr.required}
                                            onChange={e => setNewAttr({ ...newAttr, required: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-gray-700">Required Field</span>
                                    </label>
                                    <button 
                                        onClick={addAttribute} 
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        Add Field
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 space-y-3">
                            {attributes.map(a => (
                                <div key={a.id} className="group flex justify-between items-center p-5 border border-gray-100 rounded-2xl bg-white hover:shadow-lg transition-all hover:border-purple-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                                            {a.data_type.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{a.attribute_name}</p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                Type: <span className="text-purple-600 uppercase">{a.data_type}</span>
                                                {a.unit && <span className="ml-2">• Unit: {a.unit}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {a.is_required && (
                                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-100">
                                                Required
                                            </span>
                                        )}
                                        <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {attributes.length === 0 && (
                                <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-3xl">
                                    No custom attributes defined.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODELS TAB */}
                {activeTab === 'models' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex-1 min-w-[200px]">
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-primary/20"
                                    value={newModel.brand_id}
                                    onChange={e => setNewModel({ ...newModel, brand_id: e.target.value })}
                                >
                                    <option value="">Select Brand...</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.brand_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-[2]">
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary/20"
                                    placeholder="Model Name (e.g. Camry Hybrid)"
                                    value={newModel.model_name}
                                    onChange={e => setNewModel({ ...newModel, model_name: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={addModel}
                                disabled={!newModel.brand_id || !newModel.model_name}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-gray-900/20"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {models.map(m => (
                                <div key={m.id} className="bg-white border border-gray-100 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow group">
                                    <div>
                                        <p className="font-bold text-gray-900">{m.model_name}</p>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">{m.vehicle_brands?.brand_name}</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {models.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-400">
                                    No models added yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CONDITIONS TAB */}
                {activeTab === 'conditions' && (
                    <div className="max-w-2xl mx-auto space-y-8 text-center">
                        <div className="flex gap-3">
                             <input
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-lg font-medium focus:ring-2 focus:ring-primary/20"
                                placeholder="Condition (e.g. Brand New)"
                                value={newCondition}
                                onChange={e => setNewCondition(e.target.value)}
                            />
                            <button 
                                onClick={addCondition} 
                                className="px-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {conditions.map(c => (
                                <div key={c.id} className="bg-white border border-gray-200 pl-4 pr-2 py-2 rounded-full text-base font-bold text-gray-700 flex items-center gap-2 hover:border-green-300 hover:shadow-md transition-all">
                                    {c.condition_name}
                                    <button onClick={() => deleteCondition(c.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
