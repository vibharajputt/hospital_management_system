import api from "./axios";

export const getPatientProfileByUserId = (userId) =>
    api.get(`/api/v1/patients/${userId}`).then((r) => r.data);

export const createPatientProfile = (payload) =>
    api.post("/api/v1/patients/profile", payload).then((r) => r.data);

export const getPatientDashboard = () =>
    api.get("/api/v1/dashboard/patient").then((r) => r.data);