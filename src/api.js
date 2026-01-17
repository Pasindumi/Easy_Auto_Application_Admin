import axios from 'axios';

// Change this to your ngrok URL if testing remotely
export const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Add a request interceptor to include the admin token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (data) => api.post('/admin/login', data),
    signup: (data) => api.post('/admin/signup', data),
};

// Dash API
export const dashApi = {
    getStats: () => api.get('/admin/stats'),
};

// Ads API
export const adsApi = {
    getAll: (status) => api.get(`/cars/admin/all?status=${status || ''}`),
    updateStatus: (id, data) => api.put(`/cars/admin/${id}/status`, data),
};

// Vehicle Config API
export const configApi = {
    getTypes: () => api.get('/vehicle-config/types'),
    getBrands: (typeId) => api.get(`/vehicle-config/brands/${typeId}`),
    getAttributes: (typeId) => api.get(`/vehicle-config/attributes/${typeId}`),
    getModels: (typeId) => api.get(`/vehicle-config/models/${typeId}`),
    getConditions: (typeId) => api.get(`/vehicle-config/conditions/${typeId}`),

    addBrand: (data) => api.post('/vehicle-config/brands', data),
    addAttribute: (data) => api.post('/vehicle-config/attributes', data),
    addModel: (data) => api.post('/vehicle-config/models', data),
    addCondition: (data) => api.post('/vehicle-config/conditions', data),
    deleteCondition: (id) => api.delete(`/vehicle-config/conditions/${id}`),
};

// Pricing API
export const pricingApi = {
    // Items
    getItems: () => api.get('/pricing/items'),
    createItem: (data) => api.post('/pricing/items', data),
    updateItem: (id, data) => api.put(`/pricing/items/${id}`, data),
    deleteItem: (id) => api.delete(`/pricing/items/${id}`),

    // Rules
    getRules: () => api.get('/pricing/rules'),
    createRule: (data) => api.post('/pricing/rules', data),
    deleteRule: (id) => api.delete(`/pricing/rules/${id}`),

    // Features
    getFeatures: (priceItemIds) => api.get(`/pricing/features?priceItemIds=${priceItemIds || ''}`),
    addFeature: (data) => api.post('/pricing/features', data),
    deleteFeature: (id) => api.delete(`/pricing/features/${id}`),

    // Package Included Items
    getPackageItems: (packageId) => api.get(`/pricing/package-items/${packageId}`),
    addPackageItem: (data) => api.post('/pricing/package-items', data),
    deletePackageItem: (id) => api.delete(`/pricing/package-items/${id}`),
};

// Discounts API
export const discountsApi = {
    getAll: () => api.get('/discounts'),
    create: (data) => api.post('/discounts', data),
    update: (id, data) => api.put(`/discounts/${id}`, data),
    delete: (id) => api.delete(`/discounts/${id}`),
};

export default api;
