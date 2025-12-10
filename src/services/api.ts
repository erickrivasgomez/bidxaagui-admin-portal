import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API base URL from environment variable
// API base URL configuration
let API_URL = import.meta.env.VITE_API_URL;

// Fallback logic if env var is missing but we are clearly in production
if (!API_URL) {
    if (typeof window !== 'undefined' &&
        (window.location.hostname.includes('bidxaagui.com') || window.location.hostname.includes('pages.dev'))) {
        API_URL = 'https://api.bidxaagui.com';
    } else {
        API_URL = 'http://localhost:8787';
    }
}

console.log('Using API URL:', API_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors (auto-logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Authentication error (401) detected on request to:', error.config?.url);
            // Token invalid or expired - logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

interface MagicLinkResponse {
    success: boolean;
    message: string;
}

interface VerifyMagicLinkResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: string;
            email: string;
            name?: string;
        };
    };
}

export const authAPI = {
    // Request magic link
    requestMagicLink: async (email: string): Promise<MagicLinkResponse> => {
        const response = await api.post('/api/auth/magic-link/request', { email });
        return response.data;
    },

    // Verify magic link token
    verifyMagicLink: async (token: string): Promise<VerifyMagicLinkResponse> => {
        const response = await api.get(`/api/auth/magic-link/verify?token=${token}`);
        return response.data;
    },

    // Subscribe (Public/Admin use)
    subscribeNewsletter: async (email: string, name?: string): Promise<{ success: boolean }> => {
        const response = await api.post('/api/newsletter/subscribe', { email, name });
        return response.data;
    },
};

// ============================================
// SUBSCRIBERS API
// ============================================

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    subscribed: number;
    subscribed_at: string;
    unsubscribed_at?: string;
}

export interface SubscribersResponse {
    success: boolean;
    message: string;
    data: {
        subscribers: Subscriber[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface StatsResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        growthRate: number;
        recentGrowth: Array<{ date: string; count: number }>;
    };
}

// Editions API
export interface Edition {
    id: string;
    titulo: string;
    descripcion?: string;
    cover_url?: string;
    fecha?: string;
    publicada: number;
    created_at: string;
}

export const editionsAPI = {
    getAll: async () => {
        const response = await api.get<APIResponse<Edition[]>>('/api/admin/editions');
        return response.data.data!;
    },
    create: async (data: { titulo: string; descripcion: string; fecha: string }) => {
        console.log('Creating edition, sending request to /api/admin/editions with', data);
        const response = await api.post<APIResponse<{ id: string }>>('/api/admin/editions', data);
        return response.data.data!;
    },
    delete: async (id: string) => {
        await api.delete(`/api/admin/editions/${id}`);
    },
    uploadPage: async (id: string, formData: FormData) => {
        const response = await api.post<APIResponse>(`/api/admin/editions/${id}/pages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getPages: async (id: string) => {
        const response = await api.get<APIResponse<Array<{ id: string; imagen_url: string; numero: number }>>>(`/api/admin/editions/${id}/pages`);
        return response.data.data!;
    }
};

export const subscribersAPI = {
    // Get all subscribers with pagination and search
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }): Promise<SubscribersResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const response = await api.get(`/api/admin/subscribers?${queryParams.toString()}`);
        return response.data;
    },

    // Get subscriber statistics
    stats: async (): Promise<StatsResponse> => {
        const response = await api.get('/api/admin/subscribers/stats');
        return response.data;
    },

    // Delete a subscriber
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/api/admin/subscribers/${id}`);
        return response.data;
    },

    // Export subscribers to CSV
    exportCSV: async (): Promise<Blob> => {
        const response = await api.get('/api/admin/subscribers/export', {
            responseType: 'blob',
        });
        return response.data;
    },
};

export const edicionesAPI = {
    // getAll: async () => { ... },
    // create: async (data) => { ... },
    // update: async (id, data) => { ... },
    // delete: async (id) => { ... },
};

export const emailsAPI = {
    // send: async (data) => { ... },
    // preview: async (data) => { ... },
    // history: async () => { ... },
};

export default api;
