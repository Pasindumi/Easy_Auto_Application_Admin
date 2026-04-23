import axios from 'axios';

// Use environment variable for API base URL, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://easy-auto-application-backend-1.onrender.com';

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
    banUser: (id, data) => api.put(`/admin/users/${id}/ban`, data),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
};

// Ads API
export const adsApi = {
    getAll: (params = {}) => {
        const { status, page = 1, limit = 20, search = '' } = params;
        let url = `/cars/admin/all?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return api.get(url);
    },
    updateStatus: (id, data) => api.put(`/cars/admin/${id}/status`, data),
    banAd: (id, data) => api.put(`/cars/admin/${id}/ban`, data),
    unbanAd: (id) => api.put(`/cars/admin/${id}/unban`),
};

// Rentals API
export const rentalsApi = {
    getAll: (params = {}) => {
        const { status, page = 1, limit = 20, search = '' } = params;
        let url = `/rentals/admin/all?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return api.get(url);
    },
    updateStatus: (id, data) => api.put(`/rentals/admin/${id}/status`, data),
    verify: (id, data) => api.put(`/rentals/admin/${id}/verify`, data),
};

// Vehicle Config API
export const configApi = {
    getTypes: () => api.get('/vehicle-config/types'),
    getBrands: (typeId) => api.get(`/vehicle-config/brands/${typeId}`),
    getAttributes: (typeId) => api.get(`/vehicle-config/attributes/${typeId}`),
    getModels: (typeId) => api.get(`/vehicle-config/models/${typeId}`),
    getConditions: (typeId) => api.get(`/vehicle-config/conditions/${typeId}`),

    addType: (data) => api.post('/vehicle-config/types', data),
    addBrand: (data) => api.post('/vehicle-config/brands', data),
    updateType: (id, data) => api.put(`/vehicle-config/types/${id}`, data),
    updateTypeStatus: (id, data) => api.put(`/vehicle-config/types/${id}/status`, data),
    deleteType: (id) => api.delete(`/vehicle-config/types/${id}`),
    updateBrand: (id, data) => api.put(`/vehicle-config/brands/${id}`, data),

    addAttribute: (data) => api.post('/vehicle-config/attributes', data),
    addModel: (data) => api.post('/vehicle-config/models', data),
    addCondition: (data) => api.post('/vehicle-config/conditions', data),

    deleteBrand: (id) => api.delete(`/vehicle-config/brands/${id}`),
    deleteAttribute: (id) => api.delete(`/vehicle-config/attributes/${id}`),
    deleteModel: (id) => api.delete(`/vehicle-config/models/${id}`),
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

// Announcements API
export const announcementsApi = {
    getAll: () => api.get('/announcements'),
    getActive: () => api.get('/announcements/active'),
    create: (data) => api.post('/announcements', data),
    update: (id, data) => api.put(`/announcements/${id}`, data),
    delete: (id) => api.delete(`/announcements/${id}`),
};

// Reports API
export const reportsApi = {
    getAll: () => api.get('/reports/admin'),
    updateStatus: (id, data) => api.put(`/reports/admin/${id}`, data),
};

// Complaints API
export const complaintsApi = {
    getAll: () => api.get('/complaints/admin'),
    updateStatus: (id, data) => api.put(`/complaints/admin/${id}`, data),
};

// Boost API
export const boostApi = {
    getItems: () => api.get('/boosts/items'),
    getPackages: () => api.get('/boosts/packages'),
    apply: (data) => api.post('/boosts/apply', data),
};

// App Reviews API
export const appReviewsApi = {
    getAll: (params) => {
        let url = '/app-reviews';
        if (params?.rating) url += `?rating=${params.rating}`;
        return api.get(url);
    },
    reply: (id, data) => api.post(`/app-reviews/${id}/reply`, data),
    delete: (id) => api.delete(`/app-reviews/${id}/admin`),
};

export default api;
