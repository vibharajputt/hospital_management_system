import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // We will create this next

const BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiPrivate.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
apiPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            const logout = useAuthStore.getState().logout;
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
