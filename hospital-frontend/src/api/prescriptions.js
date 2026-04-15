import api from "./axios";

export const createPrescription = (payload) => api.post("/api/v1/prescriptions", payload).then((r) => r.data);

export const getMyPrescriptions = () => api.get("/api/v1/prescriptions/my").then((r) => r.data);

export const getMyDoctorPrescriptions = () => api.get("/api/v1/prescriptions/doctor/my").then((r) => r.data);

export const getPrescriptionByAppointment = (appointmentId) =>
    api.get(`/api/v1/prescriptions/appointment/${appointmentId}`).then((r) => r.data);