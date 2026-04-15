import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ allow = [], children }) {
    const { token, user } = useAuthStore();
    const location = useLocation();

    if (!token || !user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (allow.length && !allow.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}