import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, Activity, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getMyAppointments, getMyRecords, getMyPrescriptions, getMyBills, payBill } from '../../api/patient';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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

const StatusBadge = ({ status }) => {
    const maps = {
        'PENDING': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        'CONFIRMED': { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
        'COMPLETED': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        'CANCELLED': { color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const conf = maps[status] || maps['PENDING'];
    const Icon = conf.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${conf.color}`}>
            <Icon size={12} />
            {status}
        </span>
    )
}

const AppointmentsList = () => {
    const [appointments, setAppointments] = useState([]);
    
    useEffect(() => {
        getMyAppointments().then(res => setAppointments(res)).catch(() => {
            // mock
            setAppointments([
                { id: 1, doctorName: 'Dr. Sarah Jenkins', appointmentDateTime: '2026-10-24T10:00:00', reason: 'Annual Checkup', status: 'CONFIRMED' },
                { id: 2, doctorName: 'Dr. Michael Chen', appointmentDateTime: '2026-09-15T14:30:00', reason: 'Headache', status: 'COMPLETED' },
            ]);
        });
    }, []);

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
             <h2 className="text-xl font-bold text-gray-900 mb-6">My Appointments</h2>
             <div className="space-y-4">
                 {appointments.map(apt => (
                     <div key={apt.id} className="p-5 border border-gray-100 rounded-xl hover:border-primary-100 hover:bg-primary-50/30 transition-all flex items-center justify-between">
                         <div>
                             <div className="flex items-center gap-3 mb-2">
                                 <h3 className="font-bold text-gray-900">{apt.doctorName}</h3>
                                 <StatusBadge status={apt.status} />
                             </div>
                             <p className="text-sm text-gray-500 mb-1">{format(new Date(apt.appointmentDateTime), 'PPP p')}</p>
                             <p className="text-sm text-gray-700 font-medium">{apt.reason}</p>
                         </div>
                         {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                             <Button variant="outline" size="sm">Cancel</Button>
                         )}
                     </div>
                 ))}
             </div>
        </div>
    );
};

const MedicalRecordsList = () => {
     const [records, setRecords] = useState([]);
    
    useEffect(() => {
        getMyRecords().then(res => setRecords(res)).catch(() => {
            // mock
            setRecords([
                { id: 1, fileUrl: 'xray.pdf', description: 'Chest X-Ray', uploadedAt: '2026-09-01T10:00:00' },
            ]);
        });
    }, []);

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
                <Button>Upload Record</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {records.map(rec => (
                     <div key={rec.id} className="p-4 border border-gray-100 rounded-xl flex items-start gap-4 hover:shadow-md transition-shadow">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={24}/></div>
                         <div className="flex-1">
                             <h3 className="font-bold text-gray-900">{rec.description}</h3>
                             <p className="text-sm text-gray-500 mb-3">Uploaded on {format(new Date(rec.uploadedAt), 'PPP')}</p>
                             <Button variant="outline" size="sm" className="gap-2">
                                 <Download size={16} /> Download
                             </Button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
}

const BillingList = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        getMyBills().then(res => setBills(res)).catch(() => {
            // mock
            setBills([
                { id: 101, amount: 150.00, status: 'UNPAID', description: 'Consultation Fee - Dr. Jenkins', createdAt: '2026-10-24T11:00:00' },
                { id: 102, amount: 80.00, status: 'PAID', description: 'Blood Test Lab Fees', createdAt: '2026-09-10T09:00:00' },
            ]);
        });
    }, []);

    const handlePay = async (id) => {
        setLoading(true);
        try {
            await payBill(id);
            toast.success("Payment successful!");
            setBills(bills.map(b => b.id === id ? {...b, status: 'PAID'} : b));
        } catch(e) {
            toast.error("Simulated payment failed, API endpoint might not exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>
             <div className="space-y-4">
                 {bills.map(bill => (
                     <div key={bill.id} className="p-5 border border-gray-100 rounded-xl flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-gray-900 text-lg">${bill.amount.toFixed(2)}</h3>
                             <p className="text-gray-700">{bill.description}</p>
                             <p className="text-sm text-gray-500 mt-1">{format(new Date(bill.createdAt), 'PPP')}</p>
                         </div>
                         <div className="flex flex-col items-end gap-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${bill.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {bill.status}
                             </span>
                             {bill.status === 'UNPAID' && (
                                 <Button size="sm" onClick={() => handlePay(bill.id)} isLoading={loading}>Pay Now</Button>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const PatientHistory = () => {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Patient History</h1>
         <p className="text-gray-500">Manage your past and upcoming medical history elements securely.</p>
       </div>

      <div>
        <div className="flex border-b border-gray-200 hide-scrollbar overflow-x-auto">
          <TabButton 
            active={activeTab === 'appointments'} 
            onClick={() => setActiveTab('appointments')} 
            label="Appointments" 
            icon={Calendar} 
          />
          <TabButton 
            active={activeTab === 'records'} 
            onClick={() => setActiveTab('records')} 
            label="Medical Records" 
            icon={FileText} 
          />
          <TabButton 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
            label="Billing" 
            icon={Activity} 
          />
        </div>
        
        {activeTab === 'appointments' && <AppointmentsList />}
        {activeTab === 'records' && <MedicalRecordsList />}
        {activeTab === 'billing' && <BillingList />}
      </div>
    </div>
  );
};

export default PatientHistory;
