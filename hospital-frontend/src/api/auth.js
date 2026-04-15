import api from "./axios";

export const registerUser = (payload) => api.post("/api/v1/auth/register", payload).then((r) => r.data);
export const loginUser = (payload) => api.post("/api/v1/auth/login", payload).then((r) => r.data);
export const me = () => api.get("/api/v1/auth/me").then((r) => r.data);