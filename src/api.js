import axios from 'axios';

// Change this to your ngrok URL if testing remotely
export const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Add a request interceptor to include the admin token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

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

export default api;
