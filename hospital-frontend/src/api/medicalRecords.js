import api from "./axios";

export const uploadMedicalRecord = async ({ file, recordType, title, description }) => {
    const form = new FormData();
    form.append("file", file);
    form.append("recordType", recordType);
    form.append("title", title);
    if (description) form.append("description", description);

    const res = await api.post("/api/v1/medical-records/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const getMyMedicalRecords = () => api.get("/api/v1/medical-records/my").then((r) => r.data);

export const downloadMedicalRecordUrl = (recordId) =>
    `${api.defaults.baseURL}/api/v1/medical-records/${recordId}/download`;

export const getPatientRecordsAsDoctor = (patientId) =>
    api.get(`/api/v1/medical-records/patient/${patientId}`).then((r) => r.data);