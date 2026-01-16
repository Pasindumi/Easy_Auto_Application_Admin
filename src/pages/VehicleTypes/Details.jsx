import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { configApi } from '../../api';
import { ArrowLeft, Trash2, Plus, Info } from 'lucide-react';

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

    const addBrand = async () => {
        if (!newBrand) return;
        try {
            await configApi.addBrand({
                vehicle_type_id: id,
                brand_name: newBrand
            });
            setNewBrand('');
            fetchDetails();
        } catch (e) {
            console.error('Error adding brand:', e);
            alert('Error adding brand');
        }
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

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{type?.type_name} Configuration</h1>
            <p className="text-gray-500 mb-8">Manage brands and specific attributes for this vehicle type.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Brands Column */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold mb-4">Brands</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Add Brand (e.g. Toyota)"
                            value={newBrand}
                            onChange={e => setNewBrand(e.target.value)}
                        />
                        <button onClick={addBrand} className="bg-gray-900 text-white px-4 rounded-lg hover:bg-black">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {brands.map(b => (
                            <div key={b.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {b.brand_name}
                                {/* <button className="text-gray-400 hover:text-red-500"><X size={14} /></button> */}
                            </div>
                        ))}
                        {brands.length === 0 && <p className="text-gray-400 text-sm">No brands added yet.</p>}
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
