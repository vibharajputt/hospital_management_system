import { apiPrivate } from './axios';

// --- Dashboard ---
export const getPatientDashboardStats = async () => {
    const res = await apiPrivate.get('/dashboard/patient');
    return res.data;
};

// --- Doctors ---
export const getDoctors = async (page = 0, size = 10, search = '') => {
    const res = await apiPrivate.get('/doctors/paged', {
        params: { page, size, search }
    });
    return res.data; // expects Page<DoctorResponse>
};

export const getDoctorSlots = async (doctorId, date) => {
    // Usually backend might have a specific slot endpoint, or we infer from doctor schedules
    // Using a generic endpoint pattern. Adjust if backend uses different URL.
    const res = await apiPrivate.get(`/doctors/${doctorId}/slots`, {
        params: { date }
    });
    return res.data; 
};

// --- Appointments ---
export const bookAppointment = async (appointmentData) => {
    const res = await apiPrivate.post('/appointments/book', appointmentData);
    return res.data;
};

export const getMyAppointments = async () => {
    const res = await apiPrivate.get('/appointments/my');
    return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
    // For patients to cancel/reschedule. Wait, the API might be PUT or POST on specific actions
    // Using PUT /appointments/{id}/status as generic or specific action
    const res = await apiPrivate.put(`/appointments/${id}/status`, { status });
    return res.data;
};

// --- Billing ---
export const getMyBills = async () => {
    const res = await apiPrivate.get('/billing/my');
    return res.data;
};

export const payBill = async (id) => {
    // Dummy "Pay/Charge" endpoint hit
    const res = await apiPrivate.post(`/billing/${id}/pay`);
    return res.data;
};

// --- Medical Records ---
export const getMyRecords = async () => {
    const res = await apiPrivate.get('/medical-records/my');
    return res.data;
};

export const uploadPatientRecord = async (formData) => {
    // multipart/form-data
    const res = await apiPrivate.post('/medical-records/patient', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// --- Prescriptions & Lab Tests ---
export const getMyPrescriptions = async () => {
    const res = await apiPrivate.get('/prescriptions/my');
    return res.data;
};

export const getMyLabTests = async () => {
    const res = await apiPrivate.get('/lab-tests/my');
    return res.data;
};
