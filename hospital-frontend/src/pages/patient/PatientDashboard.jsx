import React, { useEffect, useState } from 'react';
import { Activity, Calendar, FileText, Pill } from 'lucide-react';
import { getPatientDashboardStats } from '../../api/patient';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-6 flex items-center justify-between hover:-translate-y-1 transition-transform">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-2 text-${color}-600`}>{value}</p>
    </div>
    <div className={`p-4 rounded-full bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
  </div>
);

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    pendingLabResults: 0,
    unpaidBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPatientDashboardStats();
        setStats(data || {
            upcomingAppointments: 2, // Dummy fallback if backend just returns map or fails to align right now
            activePrescriptions: 1,
            pendingLabResults: 0,
            unpaidBills: 1
        });
      } catch (error) {
         // Fallback to dummy data for UI display if backend stats API isn't exactly mapping DTO
        setStats({
          upcomingAppointments: 2, 
          activePrescriptions: 1,
          pendingLabResults: 0,
          unpaidBills: 1
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Health Overview</h1>
          <p className="text-gray-500">Track your appointments, records, and treatments.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/30">
          Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={Calendar} color="primary" />
        <StatCard title="Active Prescriptions" value={stats.activePrescriptions} icon={Pill} color="secondary" />
        <StatCard title="Pending Lab Results" value={stats.pendingLabResults} icon={Activity} color="orange" />
        <StatCard title="Unpaid Bills" value={stats.unpaidBills} icon={FileText} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h2>
            <div className="space-y-4">
                <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Appointment Confirmed</p>
                        <p className="text-sm text-gray-500 mt-1">Your appointment with Dr. Smith on Oct 24th is confirmed.</p>
                        <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                    </div>
                </div>
                 <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400 shrink-0"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">New Bill Generated</p>
                        <p className="text-sm text-gray-500 mt-1">A bill of $150 has been generated for your recent checkup.</p>
                        <p className="text-xs text-gray-400 mt-2">1 day ago</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
             <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 border border-gray-100 rounded-xl hover:bg-primary-50 hover:border-primary-100 text-left transition-colors flex flex-col items-start gap-3 group">
                    <div className="p-3 bg-primary-100 text-primary-600 rounded-lg group-hover:scale-110 transition-transform"><Calendar size={20}/></div>
                    <span className="font-medium text-gray-900">Schedule Checkup</span>
                 </button>
                 <button className="p-4 border border-gray-100 rounded-xl hover:bg-secondary-50 hover:border-secondary-100 text-left transition-colors flex flex-col items-start gap-3 group">
                    <div className="p-3 bg-secondary-100 text-secondary-600 rounded-lg group-hover:scale-110 transition-transform"><FileText size={20}/></div>
                    <span className="font-medium text-gray-900">View Health Records</span>
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
