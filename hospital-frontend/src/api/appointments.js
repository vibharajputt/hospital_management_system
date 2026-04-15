import api from "./axios";

export const bookAppointmentSelf = (payload) =>
    api.post("/api/v1/appointments/book", payload).then((r) => r.data);

export const getMyPatientAppointments = () =>
    api.get("/api/v1/appointments/my").then((r) => r.data);

export const getMyDoctorAppointments = () =>
    api.get("/api/v1/appointments/doctor/my").then((r) => r.data);

export const updateAppointmentStatus = (appointmentId, status) =>
    api.put(`/api/v1/appointments/${appointmentId}/status`, { status }).then((r) => r.data);

export const rescheduleAppointment = (appointmentId, payload) =>
    api.put(`/api/v1/appointments/${appointmentId}/reschedule`, payload).then((r) => r.data);

export const cancelAppointment = (appointmentId) =>
    api.delete(`/api/v1/appointments/${appointmentId}`).then((r) => r.data);