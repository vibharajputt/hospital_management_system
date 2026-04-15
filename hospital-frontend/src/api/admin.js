import api from "./axios";

export const getAdminDashboard = () => api.get("/api/v1/dashboard/admin").then((r) => r.data);
export const approveDoctorAdmin = (doctorId) => api.put(`/api/v1/doctors/${doctorId}/approve`).then((r) => r.data);