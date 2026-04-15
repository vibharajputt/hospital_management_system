import api from "./axios";

export const createDoctorSchedule = (payload) =>
    api.post("/api/v1/doctor-schedules", payload).then((r) => r.data);

export const getDoctorSchedules = (doctorId) =>
    api.get(`/api/v1/doctor-schedules/doctor/${doctorId}`).then((r) => r.data);

export const getDoctorSlotsByDate = (doctorId, date) =>
    api.get(`/api/v1/doctor-schedules/doctor/${doctorId}/slots`, { params: { date } }).then((r) => r.data);