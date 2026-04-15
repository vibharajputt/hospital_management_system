import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, FileText, Pill, CreditCard, Bell, Users, TrendingUp } from 'lucide-react';
import { getPatientDashboard } from '../../api/patient';
import useAuthStore from '../../store/authStore';

const statCards = [
  { key: 'totalAppointments', title: 'Total Appointments', icon: Calendar, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
  { key: 'upcomingAppointments', title: 'Upcoming', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
  { key: 'totalPrescriptions', title: 'Prescriptions', icon: Pill, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
  { key: 'unpaidBills', title: 'Unpaid Bills', icon: CreditCard, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25' },
  { key: 'unreadNotifications', title: 'Notifications', icon: Bell, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
];

const StatCard = ({ title, value, icon: Icon, gradient, shadow, delay }) => (
  <div 
    className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} group cursor-default hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
    style={{ animationDelay: `${delay}ms` }}
  >
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
    <div className="absolute -top-6 -right-10 w-20 h-20 rounded-full bg-white/5"></div>
  </div>
);

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPatientDashboard();
        setStats(data);
      } catch (error) {
        setStats({
          upcomingAppointments: 1,
          totalAppointments: 12,
          totalPrescriptions: 5,
          unpaidBills: 5,
          totalBills: 11,
          unreadNotifications: 2,
          pendingLabTests: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Find Doctors', icon: Users, path: '/patient/doctors', bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-300' },
    { label: 'View Records', icon: FileText, path: '/patient/history', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
    { label: 'Pay Bills', icon: CreditCard, path: '/patient/history', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', hoverBorder: 'hover:border-amber-300' },
    { label: 'Lab Reports', icon: Activity, path: '/patient/history', bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', hoverBorder: 'hover:border-rose-300' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Welcome back, <span className="text-indigo-600">{user?.fullName?.split(' ')[0] || 'Patient'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your health overview for today</p>
        </div>
        <button 
          onClick={() => navigate('/patient/doctors')}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-2"
        >
          <Calendar size={16} />
          Book Appointment
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {statCards.map((card, i) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={stats?.[card.key] ?? 0}
            icon={card.icon}
            gradient={card.gradient}
            shadow={card.shadow}
            delay={i * 100}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-indigo-500" />
            Recent Notifications
          </h2>
          <div className="space-y-1">
            {[
              { title: 'Appointment Confirmed', desc: 'Your appointment with Dr. Amit Sharma on Oct 24th is confirmed.', time: '2 hours ago', color: 'bg-blue-500' },
              { title: 'Prescription Updated', desc: 'Dr. Priya Patel updated your prescription for hypertension.', time: '5 hours ago', color: 'bg-emerald-500' },
              { title: 'Lab Results Ready', desc: 'Your blood test results from Oct 20th are now available.', time: '1 day ago', color: 'bg-amber-500' },
              { title: 'New Bill Generated', desc: 'A bill of ₹1500 has been generated for your recent checkup.', time: '1 day ago', color: 'bg-rose-500' },
              { title: 'Appointment Reminder', desc: 'Reminder: Follow-up with Dr. Vikram Singh tomorrow at 10 AM.', time: '2 days ago', color: 'bg-violet-500' },
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

          {/* Health Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
            <h3 className="font-bold text-sm text-indigo-900 mb-3">Health Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Bills</span>
                <span className="font-bold text-gray-900 text-lg">{stats?.totalBills ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Pending Labs</span>
                <span className="font-bold text-gray-900 text-lg">{stats?.pendingLabTests ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
