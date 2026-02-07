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
    getUsers: () => api.get('/admin/users'),
};

// Ads API
export const adsApi = {
    getAll: (status) => api.get(status ? `/cars/admin/all?status=${status}` : '/cars/admin/all'),
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
    updateBrand: (id, data) => api.put(`/vehicle-config/brands/${id}`, data),
    addAttribute: (data) => api.post('/vehicle-config/attributes', data),
    addModel: (data) => api.post('/vehicle-config/models', data),
    addCondition: (data) => api.post('/vehicle-config/conditions', data),
    deleteCondition: (id) => api.delete(`/vehicle-config/conditions/${id}`),
};

// Pricing API
export const pricingApi = {
    // Items
    getItems: () => api.get('/pricing/admin/items'),
    createItem: (data) => api.post('/pricing/admin/items', data),
    updateItem: (id, data) => api.put(`/pricing/admin/items/${id}`, data),
    deleteItem: (id) => api.delete(`/pricing/admin/items/${id}`),

    // Rules
    getRules: () => api.get('/pricing/admin/rules'),
    createRule: (data) => api.post('/pricing/admin/rules', data),
    updateRule: (id, data) => api.put(`/pricing/admin/rules/${id}`, data),
    deleteRule: (id) => api.delete(`/pricing/admin/rules/${id}`),

    // Features
    getFeatures: (priceItemIds) => api.get(`/pricing/admin/features?priceItemIds=${priceItemIds || ''}`),
    addFeature: (data) => api.post('/pricing/admin/features', data),
    deleteFeature: (id) => api.delete(`/pricing/admin/features/${id}`),

    // Package Included Items
    getPackageItems: (packageId) => api.get(`/pricing/admin/package-items/${packageId}`),
    addPackageItem: (data) => api.post('/pricing/admin/package-items', data),
    deletePackageItem: (id) => api.delete(`/pricing/admin/package-items/${id}`),

    // Package Ad Limits
    getPackageAdLimits: (packageId) => api.get(`/pricing/admin/package-limits/${packageId}`),
    addPackageAdLimit: (data) => api.post('/pricing/admin/package-limits', data),
    deletePackageAdLimit: (id) => api.delete(`/pricing/admin/package-limits/${id}`),

    // Subscriptions
    getSubscribers: () => api.get('/pricing/admin/subscribers'),
    getSubscriberUsage: (userId, packageId) => api.get(`/pricing/admin/subscriber-usage/${userId}/${packageId}`),
};

// Discounts API
export const discountsApi = {
    getAll: () => api.get('/discounts'),
    create: (data) => api.post('/discounts', data),
    update: (id, data) => api.put(`/discounts/${id}`, data),
    delete: (id) => api.delete(`/discounts/${id}`),
};

// Reports API
export const reportsApi = {
    getAll: () => api.get('/reports/admin'),
    updateStatus: (id, data) => api.put(`/reports/admin/${id}`, data),
};

export default api;
