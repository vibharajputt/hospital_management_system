import React, { useEffect, useState } from "react";
import { CalendarCheck, Search, Clock, BadgeCheck, CheckCircle, Clock3 } from "lucide-react";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import { getMyDoctorAppointments, updateAppointmentStatus } from "../../api/appointments";

export default function ManageAppointments() {
    const [list, setList] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);

    const load = async () => {
        setErr("");
        setLoading(true);
        try {
            const res = await getMyDoctorAppointments();
            setList(res || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const changeStatus = async (id, status) => {
        setSavingId(id);
        setErr("");
        try {
            await updateAppointmentStatus(id, status);
            await load();
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to update status");
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading appointments...</p>
        </div>
      </div>
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit"><CheckCircle size={14}/> Confirmed</span>;
            case 'COMPLETED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit"><BadgeCheck size={14}/> Completed</span>;
            case 'CANCELLED': return <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">Cancelled</span>;
            default: return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit"><Clock3 size={14}/> {status}</span>;
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Header section with gradient */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
                            <CalendarCheck className="text-teal-400" size={36} />
                            Appointments
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-xl">Review and update the status of your patient bookings.</p>
                    </div>
                    <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md">
                        <Clock size={18} className="mr-2" />
                        Refresh List
                    </Button>
                </div>
            </div>

            {err ? <div className="mb-4"><Alert type="error" title="Error">{err}</Alert></div> : null}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-5 rounded-tl-3xl">ID</th>
                                <th className="px-6 py-5">Patient Name</th>
                                <th className="px-6 py-5">Date & Time</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 rounded-tr-3xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {list.map((a) => (
                                <tr key={a.id} className="hover:bg-indigo-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-gray-900">#{a.id}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{a.patientName}</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        <div className="flex items-center gap-2">
                                            <CalendarCheck size={16} className="text-indigo-400" />
                                            {new Date(a.appointmentDateTime).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: 'numeric', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(a.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {a.status !== 'CONFIRMED' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={savingId === a.id}
                                                    onClick={() => changeStatus(a.id, "CONFIRMED")}
                                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                >
                                                    Confirm
                                                </Button>
                                            )}
                                            {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                                                <Button
                                                    size="sm"
                                                    disabled={savingId === a.id}
                                                    onClick={() => changeStatus(a.id, "COMPLETED")}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!list.length ? (
                                <tr>
                                    <td className="px-6 py-12 text-center text-gray-500" colSpan={5}>
                                        <div className="flex flex-col items-center justify-center">
                                            <CalendarCheck size={48} className="text-gray-300 mb-3" />
                                            <p className="text-lg font-medium text-gray-900">No appointments found</p>
                                            <p className="text-sm">You have no scheduled patient consultations right now.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}