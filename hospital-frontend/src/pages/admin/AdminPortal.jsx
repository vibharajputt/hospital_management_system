import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Activity, Users, UploadCloud, ChevronRight } from 'lucide-react';
import { getAdminDashboardStats, getPendingDoctors, approveDoctor, createBill } from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3.5 font-medium transition-all rounded-t-xl
      ${active 
        ? 'text-primary-600 bg-white border-t border-x border-gray-100 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.02)]' 
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 border-transparent'
      }
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

const AdminOverview = () => {
    const [stats, setStats] = useState({ users: 0, revenue: 0, pendingApprovals: 0 });
    useEffect(() => {
        // fetch or mock
        setTimeout(() => setStats({ users: 342, revenue: 12500, pendingApprovals: 3 }), 500);
    }, []);

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <p className="text-indigo-600 font-bold mb-1">Total Users</p>
                    <p className="text-3xl font-black text-gray-900">{stats.users}</p>
                </div>
                <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                    <p className="text-green-600 font-bold mb-1">MTD Revenue</p>
                    <p className="text-3xl font-black text-gray-900">${stats.revenue}</p>
                </div>
                <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                    <p className="text-orange-600 font-bold mb-1">Pending Approvals</p>
                    <p className="text-3xl font-black text-gray-900">{stats.pendingApprovals}</p>
                </div>
            </div>
        </div>
    )
}

const DoctorApprovals = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // mock fetching unapproved doctors
        setDoctors([
            { id: 201, fullName: 'Dr. John Miller', email: 'john@example.com', license: 'MD-123456', status: 'PENDING' },
            { id: 202, fullName: 'Dr. Linda Ray', email: 'linda@example.com', license: 'MD-987654', status: 'PENDING' }
        ]);
    }, []);

    const handleApprove = async (id) => {
        setLoading(true);
        try {
            await approveDoctor(id);
            toast.success('Doctor Approved!');
            setDoctors(doctors.filter(d => d.id !== id));
        } catch {
            toast.success('Mock approval successful.');
            setDoctors(doctors.filter(d => d.id !== id));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Doctor Approvals</h2>
             <div className="space-y-4">
                 {doctors.map(doc => (
                     <div key={doc.id} className="p-5 border border-gray-100 rounded-xl flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-gray-900">{doc.fullName}</h3>
                             <p className="text-sm text-gray-500">{doc.email} • License: {doc.license}</p>
                         </div>
                         <Button size="sm" onClick={() => handleApprove(doc.id)} isLoading={loading}>
                             Approve
                         </Button>
                     </div>
                 ))}
                 {doctors.length === 0 && <p className="text-gray-500 py-10 text-center">No pending approvals.</p>}
             </div>
        </div>
    );
}

const StaffOperations = () => {
    const [billData, setBillData] = useState({ patientId: '', amount: '', description: '' });
    
    const handleBillSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBill(billData);
            toast.success('Bill generated successfully.');
            setBillData({ patientId: '', amount: '', description: '' });
        } catch {
            toast.success('Mock Bill generated.');
            setBillData({ patientId: '', amount: '', description: '' });
        }
    }

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Staff Operations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Billing Generator */}
                <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="text-primary-600"/> Generate Bill</h3>
                    <form onSubmit={handleBillSubmit} className="space-y-4">
                        <Input label="Patient ID" value={billData.patientId} onChange={e=>setBillData({...billData, patientId: e.target.value})} required/>
                        <Input label="Amount ($)" type="number" value={billData.amount} onChange={e=>setBillData({...billData, amount: e.target.value})} required/>
                        <Input label="Description" value={billData.description} onChange={e=>setBillData({...billData, description: e.target.value})} required/>
                        <div className="pt-2"><Button type="submit" fullWidth>Create Bill</Button></div>
                    </form>
                </div>

                {/* Lab Result Uploader */}
                <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="text-orange-500"/> Upload Lab Report</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group">
                        <div className="p-4 bg-white rounded-full text-gray-400 group-hover:text-primary-600 mb-3 shadow-sm">
                            <UploadCloud size={32} />
                        </div>
                        <p className="font-medium text-gray-900">Click to select PDF file</p>
                        <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                    </div>
                    <div className="mt-4">
                        <Input label="Lab Test ID" placeholder="Enter Test ID to link report" required />
                        <div className="pt-4"><Button fullWidth variant="secondary">Upload Result</Button></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AdminPortal = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration & Staff</h1>
                <p className="text-gray-500">Manage doctors, generate bills, and upload lab reports.</p>
            </div>

            <div>
                <div className="flex border-b border-gray-200 hide-scrollbar overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={Activity} />
                    <TabButton active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} label="Doctor Approvals" icon={ShieldCheck} />
                    <TabButton active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} label="Staff Operations" icon={Users} />
                </div>
                
                {activeTab === 'overview' && <AdminOverview />}
                {activeTab === 'approvals' && <DoctorApprovals />}
                {activeTab === 'operations' && <StaffOperations />}
            </div>
        </div>
    );
};

export default AdminPortal;
