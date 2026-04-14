import { apiPrivate } from './axios';

export const getAdminDashboardStats = async () => {
    const res = await apiPrivate.get('/dashboard/admin');
    return res.data;
};

// --- Doctor Approvals ---
export const getPendingDoctors = async () => {
    // Assuming backend endpoint exists for unapproved doctors, otherwise filter paged
    const res = await apiPrivate.get('/doctors/paged', { params: { size: 100 }});
    // Filter logic if backend returns all
    return res.data;
};

export const approveDoctor = async (id) => {
    // Assuming PUT /doctors/{id}/approve or similar
    const res = await apiPrivate.put(`/doctors/${id}/approve`);
    return res.data;
};

// --- Billing ---
export const createBill = async (billData) => {
    const res = await apiPrivate.post('/billing', billData);
    return res.data;
};

// --- Lab Tests ---
export const getPendingLabTests = async () => {
    // Mocking an endpoint that might exist or just fetching all
    const res = await apiPrivate.get('/lab-tests'); 
    return res.data;
};

export const uploadLabResult = async (id, formData) => {
    // Assuming PUT /lab-tests/{id}/update with multipart form data
    const res = await apiPrivate.put(`/lab-tests/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};
