import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import DoctorListing from "./pages/patient/DoctorListing.jsx";
import PatientHistory from "./pages/patient/PatientHistory.jsx";

import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import ManageAppointments from "./pages/doctor/ManageAppointments.jsx";
import ScheduleManager from "./pages/doctor/ScheduleManager.jsx";

import AdminPortal from "./pages/admin/AdminPortal.jsx";
import NotFound from "./pages/NotFound.jsx";

import useAuthStore from "./store/authStore.js";

function HomeRedirect() {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === "PATIENT") return <Navigate to="/patient/dashboard" replace />;
  if (user.role === "DOCTOR") return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === "ADMIN" || user.role === "STAFF") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allow={["PATIENT"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/doctors"
          element={
            <ProtectedRoute allow={["PATIENT"]}>
              <DoctorListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/history"
          element={
            <ProtectedRoute allow={["PATIENT"]}>
              <PatientHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allow={["DOCTOR"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allow={["DOCTOR"]}>
              <ManageAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute allow={["DOCTOR"]}>
              <ScheduleManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["ADMIN", "STAFF"]}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}