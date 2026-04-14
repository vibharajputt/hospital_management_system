import { apiPrivate } from './axios';

// --- Dashboard ---
export const getDoctorDashboardStats = async () => {
    const res = await apiPrivate.get('/dashboard/doctor');
    return res.data;
};

// --- Appointments ---
export const getMyDoctorAppointments = async () => {
    const res = await apiPrivate.get('/appointments/doctor/my');
    return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
    // Assuming backend takes PUT /appointments/{id}/status 
    const res = await apiPrivate.put(`/appointments/${id}/status`, { status });
    return res.data;
};

// --- Schedules (Slots) ---
export const createDoctorSchedule = async (scheduleData) => {
    const res = await apiPrivate.post('/doctor-schedules', scheduleData);
    return res.data;
};

export const getMySchedules = async () => {
    const res = await apiPrivate.get('/doctor-schedules/my');
    return res.data;
};

// --- Lab Tests ---
export const orderLabTest = async (testData) => {
    const res = await apiPrivate.post('/lab-tests', testData);
    return res.data;
};

// --- Prescriptions ---
export const writePrescription = async (prescriptionData) => {
    const res = await apiPrivate.post('/prescriptions', prescriptionData);
    return res.data;
};

// --- Doctor specific Patient Records view ---
export const getPatientRecordsList = async (patientId) => {
    const res = await apiPrivate.get(`/medical-records/patient/${patientId}`);
    return res.data;
};
