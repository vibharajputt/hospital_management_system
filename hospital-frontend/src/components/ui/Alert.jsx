import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export const Alert = ({ type = "info", title, children, className = "" }) => {
    const styles = {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        error: "bg-rose-50 border-rose-200 text-rose-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
    };

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        info: Info,
        warning: AlertCircle,
    };

    const Icon = icons[type] || Info;

    return (
        <div className={`flex gap-3 rounded-xl border px-4 py-3 ${styles[type]} ${className}`}>
            <Icon size={20} className="shrink-0 mt-0.5" />
            <div>
                {title ? <div className="font-bold text-sm mb-1">{title}</div> : null}
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
};

export default Alert;
