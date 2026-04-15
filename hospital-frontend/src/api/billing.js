import api from "./axios";

export const getMyBills = () => api.get("/api/v1/billing/my").then((r) => r.data);

export const payBill = (billId, paymentMode) =>
    api.put(`/api/v1/billing/${billId}/pay`, { paymentMode }).then((r) => r.data);

export const createBill = (payload) => api.post("/api/v1/billing", payload).then((r) => r.data);

export const getDoctorBills = () => api.get("/api/v1/billing/doctor/my").then((r) => r.data);