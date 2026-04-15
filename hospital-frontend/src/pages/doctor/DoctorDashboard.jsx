import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Bell, FlaskConical, FileText, Users, Stethoscope, TrendingUp } from "lucide-react";
import Alert from "../../components/ui/Alert";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const statCards = [
  { key: 'todaysAppointments', title: "Today's Appointments", icon: Calendar, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
  { key: 'upcomingAppointments', title: 'Upcoming', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
  { key: 'unreadNotifications', title: 'Notifications', icon: Bell, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
  { key: 'pendingLabTests', title: 'Pending Labs', icon: FlaskConical, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
  { key: 'totalPrescriptionsWritten', title: 'Prescriptions', icon: FileText, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25' },
];

const StatCard = ({ title, value, icon: Icon, gradient, shadow }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} group cursor-default hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-4xl font-extrabold mt-2 tracking-tight">{value}</p>
      </div>
      <div className="p-4 rounded-2xl bg-white/15 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
        <Icon size={28} className="text-white" />
      </div>
    </div>
    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/10"></div>
  </div>
);

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/v1/dashboard/doctor");
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
  if (err) return <Alert type="error" title="Error">{err}</Alert>;
  if (!data) return null;

  const quickActions = [
    { label: 'View Appointments', icon: Calendar, path: '/doctor/appointments', bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-300' },
    { label: 'Write Prescription', icon: FileText, path: '/doctor/appointments', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
    { label: 'Manage Schedule', icon: Clock, path: '/doctor/schedule', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', hoverBorder: 'hover:border-amber-300' },
    { label: 'Lab Results', icon: FlaskConical, path: '/doctor/appointments', bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', hoverBorder: 'hover:border-rose-300' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Welcome, <span className="text-indigo-600">Dr. {user?.fullName?.replace('Dr ', '').replace('Dr. ', '') || 'Doctor'}</span> 🩺
          </h1>
          <p className="text-gray-500 mt-1">
            Approval: <span className={`font-bold ${data.approved ? 'text-emerald-600' : 'text-rose-600'}`}>{data.approved ? '✓ Approved' : '✗ Pending'}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/schedule')}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Clock size={16} />
          Manage Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.key} title={card.title} value={data[card.key] ?? 0} icon={card.icon} gradient={card.gradient} shadow={card.shadow} />
        ))}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope size={20} className="text-indigo-500" />
            Clinical Overview
          </h2>
          <div className="space-y-1">
            {[
              { title: 'Patient Consultation', desc: 'Rahul Kumar - Follow-up for hypertension management', time: '9:00 AM today', color: 'bg-blue-500' },
              { title: 'Lab Review Required', desc: 'Blood test results for patient Meera need review', time: '10:30 AM today', color: 'bg-amber-500' },
              { title: 'Prescription Renewal', desc: 'Anita Singh requested refill for diabetes medication', time: 'Yesterday', color: 'bg-emerald-500' },
              { title: 'New Appointment', desc: 'New booking from Amit Verma for Oct 28th', time: 'Yesterday', color: 'bg-violet-500' },
              { title: 'Schedule Update', desc: 'Your Monday 2-4 PM slot has been confirmed', time: '2 days ago', color: 'bg-rose-500' },
            ].map((n, i) => (
              <div key={i} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full ${n.color} shrink-0 group-hover:scale-150 transition-transform duration-300`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{n.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`p-5 ${action.bg} border border-gray-100 ${action.hoverBorder} rounded-xl text-left transition-all duration-200 flex flex-col items-start gap-3 group active:scale-95 hover:shadow-md`}
              >
                <div className={`p-3 ${action.iconBg} ${action.iconColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon size={22} />
                </div>
                <span className="font-semibold text-sm text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}