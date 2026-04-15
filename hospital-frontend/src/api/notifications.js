import api from "./axios";

export const getMyNotifications = () => api.get("/api/v1/notifications/my").then((r) => r.data);
export const markNotificationRead = (id) => api.put(`/api/v1/notifications/${id}/read`).then((r) => r.data);
export const markAllRead = () => api.put("/api/v1/notifications/read-all").then((r) => r.data);