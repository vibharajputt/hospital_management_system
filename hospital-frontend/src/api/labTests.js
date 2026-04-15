import api from "./axios";

export const orderLabTest = (payload) => api.post("/api/v1/lab-tests", payload).then((r) => r.data);

export const getMyLabTests = () => api.get("/api/v1/lab-tests/my").then((r) => r.data);

export const getMyDoctorLabTests = () => api.get("/api/v1/lab-tests/doctor/my").then((r) => r.data);

export const updateLabResult = async ({ id, status, resultText, reportFile }) => {
    const form = new FormData();
    if (status) form.append("status", status);
    if (resultText != null) form.append("resultText", resultText);
    if (reportFile) form.append("reportFile", reportFile);

    const res = await api.put(`/api/v1/lab-tests/${id}/update`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const downloadLabReportUrl = (id) => `${api.defaults.baseURL}/api/v1/lab-tests/${id}/download`;