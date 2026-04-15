import React, { useEffect, useState } from "react";
import { Users, UserCheck, Stethoscope, DollarSign, ShieldCheck, FlaskConical, CreditCard, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import useAuthStore from "../../store/authStore";

import { getDoctorsPaged, approveDoctor } from "../../api/doctor";
import { createBill } from "../../api/billing";
import { updateLabResult } from "../../api/labTests";
import { getAdminDashboard } from "../../api/admin";

const statCardColors = [
  { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', iconBg: 'bg-blue-400/30', shadow: 'shadow-blue-500/25' },
  { bg: 'bg-gradient-to-br from-amber-500 to-orange-500', iconBg: 'bg-amber-400/30', shadow: 'shadow-amber-500/25' },
  { bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', iconBg: 'bg-emerald-400/30', shadow: 'shadow-emerald-500/25' },
  { bg: 'bg-gradient-to-br from-violet-500 to-purple-600', iconBg: 'bg-violet-400/30', shadow: 'shadow-violet-500/25' },
];

const StatCard = ({ title, value, icon: Icon, colorIndex = 0 }) => {
  const c = statCardColors[colorIndex % statCardColors.length];
  return (
    <div className={`stat-card ${c.bg} text-white shadow-lg ${c.shadow} group cursor-default`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${c.iconBg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5"></div>
    </div>
  );
};

export default function AdminPortal() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    const [bill, setBill] = useState({ appointmentId: "", amount: "" });
    const [lab, setLab] = useState({ id: "", status: "COMPLETED", resultText: "", file: null });

    const load = async () => {
        setErr("");
        setLoading(true);
        try {
            const [s, d] = await Promise.all([
                getAdminDashboard(),
                getDoctorsPaged({ page: 0, size: 20, sortBy: "id", direction: "desc" }),
            ]);
            setStats(s);
            setDoctors(d?.content || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load admin portal");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onApprove = async (doctorId) => {
        setErr("");
        try {
            await approveDoctor(doctorId);
            await load();
        } catch (e) {
            setErr(e?.response?.data?.message || "Approve failed");
        }
    };

    const onCreateBill = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await createBill({ appointmentId: Number(bill.appointmentId), amount: bill.amount ? Number(bill.amount) : null });
            setBill({ appointmentId: "", amount: "" });
        } catch (e2) {
            setErr(e2?.response?.data?.message || "Create bill failed");
        }
    };

    const onUpdateLab = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await updateLabResult({
                id: Number(lab.id),
                status: lab.status,
                resultText: lab.resultText,
                reportFile: lab.file,
            });
            setLab({ id: "", status: "COMPLETED", resultText: "", file: null });
        } catch (e2) {
            setErr(e2?.response?.data?.message || "Update lab failed");
        }
    };

    if (loading) return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading admin portal...</p>
        </div>
      </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Admin Portal <span className="text-primary-600">🏥</span>
              </h1>
              <p className="text-gray-500 mt-1">Manage approvals, billing, and lab updates</p>
            </div>

            {err ? <Alert type="error" title="Error">{err}</Alert> : null}

            {/* Stat Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} colorIndex={0} />
                <StatCard title="Pending Approvals" value={stats.doctorsPendingApproval} icon={UserCheck} colorIndex={1} />
                <StatCard title="Total Doctors" value={stats.totalDoctors} icon={Stethoscope} colorIndex={2} />
                <StatCard title="Paid Revenue" value={`₹${stats.totalRevenuePaid}`} icon={DollarSign} colorIndex={3} />
              </div>
            )}

            {/* Doctor Approvals & Admin Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doctor Approvals */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-primary-500" />
                      Doctor Approvals
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {doctors.map((d) => (
                            <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                    {d.user?.fullName?.charAt(0) || 'D'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{d.user?.fullName}</div>
                                    <div className="text-sm text-gray-500">{d.specialization}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {d.approved ? '✓ Approved' : 'Pending'}
                                  </span>
                                  {!d.approved && (
                                    <Button size="sm" variant="secondary" onClick={() => onApprove(d.id)}>
                                      Approve
                                    </Button>
                                  )}
                                </div>
                            </div>
                        ))}
                        {!doctors.length && <div className="text-sm text-gray-500 text-center py-4">No doctors found</div>}
                    </div>
                </div>

                {/* Admin Tools */}
                <div className="space-y-6">
                    {/* Create Bill */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard size={20} className="text-amber-500" />
                          Create Bill
                        </h2>
                        <form className="grid grid-cols-1 gap-4" onSubmit={onCreateBill}>
                            <Input label="Appointment ID" value={bill.appointmentId} onChange={(e) => setBill((p) => ({ ...p, appointmentId: e.target.value }))} />
                            <Input label="Amount (optional)" value={bill.amount} onChange={(e) => setBill((p) => ({ ...p, amount: e.target.value }))} />
                            <Button type="submit">Create Bill</Button>
                        </form>
                    </div>

                    {/* Update Lab */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FlaskConical size={20} className="text-violet-500" />
                          Update Lab Result
                        </h2>
                        <form className="grid grid-cols-1 gap-4" onSubmit={onUpdateLab}>
                            <Input label="Lab Test ID" value={lab.id} onChange={(e) => setLab((p) => ({ ...p, id: e.target.value }))} />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Status</label>
                                <select
                                    value={lab.status}
                                    onChange={(e) => setLab((p) => ({ ...p, status: e.target.value }))}
                                    className="w-full rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                >
                                    <option value="ORDERED">ORDERED</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                            <Input label="Result Text" value={lab.resultText} onChange={(e) => setLab((p) => ({ ...p, resultText: e.target.value }))} />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Report File</label>
                                <input
                                    type="file"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    onChange={(e) => setLab((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                                />
                            </div>
                            <Button type="submit">Update Result</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}