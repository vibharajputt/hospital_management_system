import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";

import { getMyPatientAppointments, cancelAppointment, rescheduleAppointment } from "../../api/appointments";
import { getMyBills, payBill } from "../../api/billing";
import { getMyLabTests, downloadLabReportUrl } from "../../api/labTests";
import { getMyPrescriptions } from "../../api/prescriptions";
import { getMyMedicalRecords, uploadMedicalRecord, downloadMedicalRecordUrl } from "../../api/medicalRecords";
import { getMyNotifications, markAllRead, markNotificationRead } from "../../api/notifications";

function TabButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
        >
            {children}
        </button>
    );
}

export default function PatientHistory() {
    const tabs = useMemo(() => ([
        { key: "appointments", label: "Appointments" },
        { key: "bills", label: "Bills" },
        { key: "lab", label: "Lab tests" },
        { key: "prescriptions", label: "Prescriptions" },
        { key: "records", label: "Medical records" },
        { key: "notifications", label: "Notifications" },
    ]), []);

    const [tab, setTab] = useState("appointments");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [lab, setLab] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [records, setRecords] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [reschedule, setReschedule] = useState({ id: "", dt: "" });

    const [upload, setUpload] = useState({ file: null, recordType: "LAB_REPORT", title: "", description: "" });
    const [uploading, setUploading] = useState(false);

    const loadAll = async () => {
        setErr("");
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getMyPatientAppointments(),
                getMyBills(),
                getMyLabTests(),
                getMyPrescriptions(),
                getMyMedicalRecords(),
                getMyNotifications(),
            ]);
            setAppointments(results[0].status === "fulfilled" ? results[0].value || [] : []);
            setBills(results[1].status === "fulfilled" ? results[1].value || [] : []);
            setLab(results[2].status === "fulfilled" ? results[2].value || [] : []);
            setPrescriptions(results[3].status === "fulfilled" ? results[3].value || [] : []);
            setRecords(results[4].status === "fulfilled" ? results[4].value || [] : []);
            setNotifications(results[5].status === "fulfilled" ? results[5].value || [] : []);

            const failures = results.filter(r => r.status === "rejected");
            if (failures.length > 0) {
                setErr("Some data could not be loaded. Please try refreshing.");
            }
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const onCancel = async (id) => {
        try {
            await cancelAppointment(id);
            await loadAll();
        } catch (e) {
            setErr(e?.response?.data?.message || "Cancel failed");
        }
    };

    const onReschedule = async () => {
        if (!reschedule.id || !reschedule.dt) return;
        try {
            await rescheduleAppointment(reschedule.id, { appointmentDateTime: reschedule.dt, symptoms: "", notes: "" });
            setReschedule({ id: "", dt: "" });
            await loadAll();
        } catch (e) {
            setErr(e?.response?.data?.message || "Reschedule failed");
        }
    };

    const onPay = async (billId) => {
        try {
            await payBill(billId, "UPI");
            await loadAll();
        } catch (e) {
            setErr(e?.response?.data?.message || "Payment failed");
        }
    };

    const onUpload = async (e) => {
        e.preventDefault();
        if (!upload.file || !upload.title) return;

        setUploading(true);
        setErr("");
        try {
            await uploadMedicalRecord(upload);
            setUpload({ file: null, recordType: "LAB_REPORT", title: "", description: "" });
            await loadAll();
        } catch (ex) {
            setErr(ex?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const onMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            await loadAll();
        } catch (e) {
            setErr(e?.response?.data?.message || "Action failed");
        }
    };

    const onReadAll = async () => {
        try {
            await markAllRead();
            await loadAll();
        } catch (e) {
            setErr(e?.response?.data?.message || "Action failed");
        }
    };

    if (loading) return <div className="flex items-center gap-2 text-slate-700"><Spinner /> Loading</div>;

    return (
        <div className="space-y-6">
            <Card
                title="My health"
                subtitle="Appointments, billing, lab, prescriptions, records and notifications"
                right={<Button variant="secondary" onClick={loadAll}>Refresh</Button>}
            >
                {err ? <div className="mb-4"><Alert type="error" title="Error">{err}</Alert></div> : null}

                <div className="flex flex-wrap gap-2">
                    {tabs.map((t) => (
                        <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                            {t.label}
                        </TabButton>
                    ))}
                </div>

                <div className="mt-6">
                    {tab === "appointments" ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <Input label="Appointment id" value={reschedule.id} onChange={(e) => setReschedule((p) => ({ ...p, id: e.target.value }))} />
                                <Input label="New date time" placeholder="2026-04-13T10:30:00" value={reschedule.dt} onChange={(e) => setReschedule((p) => ({ ...p, dt: e.target.value }))} />
                                <div className="flex items-end gap-2">
                                    <Button className="w-full" onClick={onReschedule}>Reschedule</Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full bg-white text-sm">
                                    <thead className="bg-slate-50 text-left text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Id</th>
                                            <th className="px-4 py-3 font-semibold">Doctor</th>
                                            <th className="px-4 py-3 font-semibold">Date</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((a) => (
                                            <tr key={a.id} className="border-t">
                                                <td className="px-4 py-3 font-semibold">{a.id}</td>
                                                <td className="px-4 py-3">{a.doctorName}</td>
                                                <td className="px-4 py-3">{a.appointmentDateTime}</td>
                                                <td className="px-4 py-3">{a.status}</td>
                                                <td className="px-4 py-3">
                                                    <Button variant="danger" size="sm" onClick={() => onCancel(a.id)}>Cancel</Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!appointments.length ? (
                                            <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No appointments found</td></tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}

                    {tab === "bills" ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-slate-50 text-left text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Invoice</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((b) => (
                                        <tr key={b.id} className="border-t">
                                            <td className="px-4 py-3 font-semibold">{b.invoiceNumber}</td>
                                            <td className="px-4 py-3">{b.amount}</td>
                                            <td className="px-4 py-3">{b.status}</td>
                                            <td className="px-4 py-3">
                                                {b.status === "PENDING" ? (
                                                    <Button size="sm" onClick={() => onPay(b.id)}>Pay</Button>
                                                ) : (
                                                    <span className="text-slate-600">Paid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!bills.length ? (
                                        <tr><td className="px-4 py-6 text-slate-600" colSpan={4}>No bills found</td></tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    ) : null}

                    {tab === "lab" ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-slate-50 text-left text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Test</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Report</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lab.map((t) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="px-4 py-3 font-semibold">{t.testName}</td>
                                            <td className="px-4 py-3">{t.status}</td>
                                            <td className="px-4 py-3">
                                                <a
                                                    className="font-semibold text-slate-900 underline underline-offset-4"
                                                    href={downloadLabReportUrl(t.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {!lab.length ? (
                                        <tr><td className="px-4 py-6 text-slate-600" colSpan={3}>No lab tests found</td></tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    ) : null}

                    {tab === "prescriptions" ? (
                        <div className="space-y-4">
                            {prescriptions.map((p) => (
                                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="text-sm text-slate-600">Appointment {p.appointmentId}</div>
                                        <div className="text-sm text-slate-600">{p.createdAt}</div>
                                    </div>
                                    <div className="mt-2 text-lg font-extrabold text-slate-900">{p.diagnosis || "Prescription"}</div>
                                    {p.items?.length ? (
                                        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                                            <table className="min-w-full bg-white text-sm">
                                                <thead className="bg-slate-50 text-left text-slate-600">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold">Medicine</th>
                                                        <th className="px-4 py-3 font-semibold">Dosage</th>
                                                        <th className="px-4 py-3 font-semibold">Frequency</th>
                                                        <th className="px-4 py-3 font-semibold">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {p.items.map((it) => (
                                                        <tr key={it.id} className="border-t">
                                                            <td className="px-4 py-3 font-semibold">{it.medicineName}</td>
                                                            <td className="px-4 py-3">{it.dosage}</td>
                                                            <td className="px-4 py-3">{it.frequency}</td>
                                                            <td className="px-4 py-3">{it.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            {!prescriptions.length ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                    No prescriptions found
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {tab === "records" ? (
                        <div className="space-y-6">
                            <form onSubmit={onUpload} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Record type</label>
                                    <select
                                        value={upload.recordType}
                                        onChange={(e) => setUpload((p) => ({ ...p, recordType: e.target.value }))}
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    >
                                        <option value="LAB_REPORT">Lab report</option>
                                        <option value="PRESCRIPTION">Prescription</option>
                                        <option value="IMAGING">Imaging</option>
                                        <option value="VACCINATION">Vaccination</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <Input label="Title" value={upload.title} onChange={(e) => setUpload((p) => ({ ...p, title: e.target.value }))} />
                                <Input label="Description" value={upload.description} onChange={(e) => setUpload((p) => ({ ...p, description: e.target.value }))} />
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">File</label>
                                    <input
                                        type="file"
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                        onChange={(e) => setUpload((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={uploading}>
                                        {uploading ? "Uploading" : "Upload record"}
                                    </Button>
                                </div>
                            </form>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full bg-white text-sm">
                                    <thead className="bg-slate-50 text-left text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Title</th>
                                            <th className="px-4 py-3 font-semibold">Type</th>
                                            <th className="px-4 py-3 font-semibold">Date</th>
                                            <th className="px-4 py-3 font-semibold">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r) => (
                                            <tr key={r.id} className="border-t">
                                                <td className="px-4 py-3 font-semibold">{r.title}</td>
                                                <td className="px-4 py-3">{r.recordType}</td>
                                                <td className="px-4 py-3">{r.createdAt}</td>
                                                <td className="px-4 py-3">
                                                    <a className="font-semibold text-slate-900 underline underline-offset-4" href={downloadMedicalRecordUrl(r.id)} target="_blank" rel="noreferrer">
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {!records.length ? (
                                            <tr><td className="px-4 py-6 text-slate-600" colSpan={4}>No records found</td></tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}

                    {tab === "notifications" ? (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={onReadAll}>Mark all read</Button>
                            </div>
                            <div className="space-y-3">
                                {notifications.map((n) => (
                                    <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-600">{n.type}</div>
                                                <div className="mt-1 text-base font-extrabold text-slate-900">{n.title}</div>
                                                <div className="mt-1 text-sm text-slate-700">{n.message}</div>
                                                <div className="mt-2 text-xs text-slate-500">{n.createdAt}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`text-xs font-semibold ${n.isRead ? "text-slate-500" : "text-emerald-700"}`}>
                                                    {n.isRead ? "Read" : "Unread"}
                                                </div>
                                                {!n.isRead ? (
                                                    <Button size="sm" variant="secondary" onClick={() => onMarkRead(n.id)}>
                                                        Mark read
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!notifications.length ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                        No notifications
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>
            </Card>
        </div>
    );
}