import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Placeholder Pages for Phase 1
const Login = () => <div className="p-10 flex justify-center"><h1 className="text-2xl font-bold bg-white p-10 rounded shadow">Login Page</h1></div>;
const Register = () => <div className="p-10 flex justify-center"><h1 className="text-2xl font-bold bg-white p-10 rounded shadow">Register Page</h1></div>;
const Unauthorized = () => <div className="p-10 text-red-500 font-bold">Unauthorized Access</div>;

// Dashboard Placeholders
const PatientDashboard = () => <div>Patient Dashboard</div>;
const DoctorDashboard = () => <div>Doctor Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            {/* Other patient routes will go here */}
          </Route>
        </Route>

        {/* Protected Doctor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            {/* Other doctor routes */}
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            {/* Other admin routes */}
          </Route>
        </Route>

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
