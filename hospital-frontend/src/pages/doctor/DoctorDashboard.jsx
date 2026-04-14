import React, { useEffect, useState } from 'react';
import { Users, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { getDoctorDashboardStats } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-6 flex flex-col justify-between hover:shadow-xl transition-all border border-gray-100 bg-white group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm font-medium mt-1">{title}</p>
    </div>
  </div>
);

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingLabs: 0,
    completedConsultations: 0
  });

  useEffect(() => {
    // getDoctorDashboardStats().then(setStats)
    // using mocks until API strictly aligns
    setTimeout(() => {
        setStats({
            todayAppointments: 4,
            totalPatients: 152,
            pendingLabs: 2,
            completedConsultations: 38
        });
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user?.fullName || 'Doctor'}</h1>
            <p className="text-primary-100 max-w-xl">
                You have {stats.todayAppointments} appointments scheduled for today. Your first patient arrives at 09:30 AM.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="blue" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="indigo" />
        <StatCard title="Pending Lab Reviews" value={stats.pendingLabs} icon={Activity} color="orange" />
        <StatCard title="Completed Consults" value={stats.completedConsultations} icon={CheckCircle2} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick look schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                <a href="/dashboard/doctor/appointments" className="text-primary-600 text-sm font-medium hover:underline">View All</a>
            </div>
            
            <div className="space-y-3">
                {[
                    { time: '09:30 AM', patient: 'Alice Smith', type: 'Follow Up', status: 'WAITING' },
                    { time: '10:00 AM', patient: 'Bob Jones', type: 'General Checkup', status: 'IN_PROGRESS' },
                    { time: '11:15 AM', patient: 'Charlie Brown', type: 'Lab Results', status: 'SCHEDULED' }
                ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/50 transition-colors">
                        <div className="w-16 text-center shrink-0">
                            <span className="font-bold text-gray-900 block">{apt.time.split(' ')[0]}</span>
                            <span className="text-xs text-gray-500 font-medium">{apt.time.split(' ')[1]}</span>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{apt.patient}</h3>
                            <p className="text-sm text-gray-500">{apt.type}</p>
                        </div>
                        <div>
                             <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                 apt.status === 'WAITING' ? 'bg-orange-100 text-orange-700' :
                                 apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                             }`}>
                                 {apt.status.replace('_', ' ')}
                             </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activities</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                 {/* Activity timeline mock list */}
                 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-primary-500 z-10 shadow ml-[14px] md:mx-auto"></div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:odd:pr-3">
                        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <time className="mb-1 text-xs font-medium text-primary-600 block">10 mins ago</time>
                            <p className="text-sm text-gray-700 font-medium">Prescription sent to Alice Smith</p>
                        </div>
                    </div>
                </div>
                 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-slate-300 z-10 shadow ml-[14px] md:mx-auto"></div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:odd:pr-3">
                        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <time className="mb-1 text-xs font-medium text-gray-500 block">2 hours ago</time>
                            <p className="text-sm text-gray-700 font-medium">Ordered Lab Test #204</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
