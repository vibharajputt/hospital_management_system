import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                <div className="text-2xl font-extrabold text-slate-900">Page not found</div>
                <div className="mt-2 text-sm text-slate-600">
                    The page you are trying to access does not exist.
                </div>
                <div className="mt-6">
                    <Link to="/">
                        <Button>Go to home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}