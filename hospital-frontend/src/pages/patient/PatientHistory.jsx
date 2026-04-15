import React, { useEffect, useMemo, useState } from "react";
import { 
    CalendarCheck, Receipt, FlaskConical, FileText, ClipboardList, Bell, 
    Download, CreditCard, Ban, CalendarClock, UploadCloud, CheckCircle2 
} from "lucide-react";
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

function TabButton({ active, onClick, icon: Icon, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                active 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105" 
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:text-indigo-600"
            }`}
        >
            <Icon size={18} className={active ? "text-indigo-200" : ""} />
            {children}
        </button>
    );
}

export default function PatientHistory() {
    const tabs = useMemo(() => ([
        { key: "appointments", label: "Appointments", icon: CalendarCheck },
        { key: "bills", label: "Bills", icon: Receipt },
        { key: "lab", label: "Lab Tests", icon: FlaskConical },
        { key: "prescriptions", label: "Prescriptions", icon: FileText },
        { key: "records", label: "Medical Records", icon: ClipboardList },
        { key: "notifications", label: "Notifications", icon: Bell },
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

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading your health history...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header section with gradient */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Health Records</h1>
                        <p className="text-indigo-100/80 text-lg max-w-xl">Manage your appointments, lab results, billing, and prescriptions.</p>
                    </div>
                </div>
            </div>

            {err ? <Alert type="error" title="Error">{err}</Alert> : null}

            {/* Custom Tabs */}
            <div className="flex flex-wrap items-center gap-3 py-2">
                {tabs.map((t) => (
                    <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} icon={t.icon}>
                        {t.label}
                    </TabButton>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all duration-500">
                {/* APPOINTMENTS */}
                {tab === "appointments" && (
                    <div className="space-y-8 animate-slide-up">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <CalendarClock className="text-indigo-600" size={20} /> Reschedule Appointment
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <Input label="Appointment ID" placeholder="e.g. 1" value={reschedule.id} onChange={(e) => setReschedule((p) => ({ ...p, id: e.target.value }))} className="!bg-white" />
                                <Input label="New Date & Time" type="datetime-local" value={reschedule.dt} onChange={(e) => setReschedule((p) => ({ ...p, dt: e.target.value }))} className="!bg-white" />
                                <Button onClick={onReschedule} className="h-[46px] shadow-md hover:shadow-lg">Reschedule Now</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Doctor</th>
                                        <th className="px-6 py-4">Date Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((a) => (
                                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">#{a.id}</td>
                                            <td className="px-6 py-4 font-semibold text-indigo-900">{a.doctorName}</td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {new Date(a.appointmentDateTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    a.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                                    a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                    a.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex justify-end">
                                                {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                                                    <Button variant="danger" size="sm" onClick={() => onCancel(a.id)} className="flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 shadow-none">
                                                        <Ban size={14} /> Cancel
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BILLS */}
                {tab === "bills" && (
                    <div className="animate-slide-up overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bills.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{b.invoiceNumber}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">₹{b.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                b.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {b.status === 'PAID' ? '✓ PAID' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end">
                                            {b.status === "PENDING" ? (
                                                <Button size="sm" onClick={() => onPay(b.id)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md text-white">
                                                    <CreditCard size={14} /> Pay Now
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400 font-medium">No action needed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* LAB TESTS */}
                {tab === "lab" && (
                    <div className="animate-slide-up overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Test Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Report</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lab.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{t.testName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end">
                                            <a className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors" href={downloadLabReportUrl(t.id)} target="_blank" rel="noreferrer">
                                                <Download size={14} /> Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* RECORDS */}
                {tab === "records" && (
                    <div className="animate-slide-up space-y-8">
                        <div className="bg-white border text-center border-gray-100 shadow-sm rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                                <UploadCloud className="text-indigo-600" size={24} /> Upload New Record
                            </h3>
                            <form onSubmit={onUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Record Type</label>
                                    <select
                                        value={upload.recordType}
                                        onChange={(e) => setUpload((p) => ({ ...p, recordType: e.target.value }))}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                                    >
                                        <option value="LAB_REPORT">Lab Report</option>
                                        <option value="PRESCRIPTION">Prescription</option>
                                        <option value="IMAGING">Imaging (X-Ray, MRI)</option>
                                        <option value="VACCINATION">Vaccination</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <Input label="Title" placeholder="e.g. Blood Test Results" value={upload.title} onChange={(e) => setUpload((p) => ({ ...p, title: e.target.value }))} />
                                <div className="md:col-span-2">
                                    <Input label="Description (optional)" placeholder="Details about this record" value={upload.description} onChange={(e) => setUpload((p) => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="space-y-1 md:col-span-2 border-2 border-dashed border-indigo-100 bg-indigo-50/30 rounded-xl p-4 flex flex-col items-center justify-center">
                                    <input
                                        type="file"
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        onChange={(e) => setUpload((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={uploading}>
                                        {uploading ? "Uploading..." : "Save Record"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Upload Date</th>
                                        <th className="px-6 py-4 text-right">Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold text-gray-900">{r.title}</td>
                                            <td className="px-6 py-4 font-medium text-gray-500">{r.recordType.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 flex justify-end">
                                                <a className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors" href={downloadMedicalRecordUrl(r.id)} target="_blank" rel="noreferrer">
                                                    <Download size={14} /> File
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* NOTIFICATIONS */}
                {tab === "notifications" && (
                    <div className="animate-slide-up space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="font-semibold text-gray-600">You have {notifications.filter(n => !n.isRead).length} unread notifications</div>
                            <Button variant="outline" size="sm" onClick={onReadAll} className="bg-white">Mark all read</Button>
                        </div>
                        {notifications.map((n) => (
                            <div key={n.id} className={`rounded-2xl border p-5 transition-colors ${!n.isRead ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-full h-fit flex-shrink-0 ${!n.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">{n.type.replace('_', ' ')}</div>
                                            <div className="text-base font-bold text-gray-900">{n.title}</div>
                                            <div className="mt-1 text-sm text-gray-600">{n.message}</div>
                                            <div className="mt-2 text-xs font-medium text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <Button size="sm" variant="ghost" onClick={() => onMarkRead(n.id)} className="text-indigo-600 hover:bg-indigo-50 whitespace-nowrap">
                                            <CheckCircle2 size={16} /> Mark read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PRESCRIPTIONS */}
                {tab === "prescriptions" && (
                    <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {prescriptions.map((p) => (
                            <div key={p.id} className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="font-extrabold text-lg flex items-center gap-2">
                                            <FileText size={20} /> {p.diagnosis || "Medical Prescription"}
                                        </h3>
                                        <p className="text-emerald-100 text-sm mt-1">Appt #{p.appointmentId} • {new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3">
                                        {p.items?.map((it) => (
                                            <div key={it.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div>
                                                    <div className="font-bold text-gray-900">{it.medicineName}</div>
                                                    <div className="text-xs text-gray-500">{it.duration}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-teal-600">{it.dosage}</div>
                                                    <div className="text-xs font-medium text-gray-500">{it.frequency}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!prescriptions.length && (
                            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                                <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-900 text-lg">No Prescriptions Yet</h3>
                                <p className="text-gray-500 text-sm">Your doctors have not issued any prescriptions.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}