import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
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

    if (loading) return <div className="flex items-center gap-2 text-slate-700"><Spinner /> Loading</div>;

    return (
        <div className="space-y-6">
            <Card
                title="Appointments"
                subtitle="Review and update status"
                right={<Button variant="secondary" onClick={load}>Refresh</Button>}
            >
                {err ? <div className="mb-4"><Alert type="error" title="Error">{err}</Alert></div> : null}

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Id</th>
                                <th className="px-4 py-3 font-semibold">Patient</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-4 py-3 font-semibold">{a.id}</td>
                                    <td className="px-4 py-3">{a.patientName}</td>
                                    <td className="px-4 py-3">{a.appointmentDateTime}</td>
                                    <td className="px-4 py-3">{a.status}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={savingId === a.id}
                                                onClick={() => changeStatus(a.id, "CONFIRMED")}
                                            >
                                                Confirm
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={savingId === a.id}
                                                onClick={() => changeStatus(a.id, "COMPLETED")}
                                            >
                                                Complete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!list.length ? (
                                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No appointments found</td></tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}