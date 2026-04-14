import { api, apiPrivate } from './axios';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const fetchMe = async () => {
    const response = await apiPrivate.get('/auth/me');
    return response.data;
};
