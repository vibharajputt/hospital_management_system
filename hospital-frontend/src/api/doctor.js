import api from "./axios";

export const getDoctorsPaged = (params) =>
    api.get("/api/v1/doctors/paged", { params }).then((r) => r.data);

export const getDoctorById = (id) => api.get(`/api/v1/doctors/${id}`).then((r) => r.data);

export const getMyDoctorProfile = () => api.get("/api/v1/doctors/me").then((r) => r.data);

export const approveDoctor = (doctorId) =>
    api.put(`/api/v1/doctors/${doctorId}/approve`).then((r) => r.data);