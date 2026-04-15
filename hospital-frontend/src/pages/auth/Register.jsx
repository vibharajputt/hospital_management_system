import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, HeartPulse, User, Phone, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { registerUser as registerApi } from '../../api/auth';
import { Input } from '../../components/ui/Input';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'PATIENT'
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerApi(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
    if (formErrors[e.target.id || e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.id || e.target.name]: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-12 px-4">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 border border-gray-100 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-5 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <HeartPulse size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm text-center">Join our hospital management network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="fullName" label="Full Name" placeholder="John Doe" icon={User} value={formData.fullName} onChange={handleChange} error={formErrors.fullName} />
              <Input id="phone" label="Phone Number" placeholder="+91 98765 43210" icon={Phone} value={formData.phone} onChange={handleChange} error={formErrors.phone} />
            </div>

            <Input id="email" type="email" label="Email Address" placeholder="you@example.com" icon={Mail} value={formData.email} onChange={handleChange} error={formErrors.email} />
            <Input id="password" type="password" label="Password" placeholder="••••••••" icon={Lock} value={formData.password} onChange={handleChange} error={formErrors.password} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-semibold text-gray-700 ml-0.5">Account Type</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Shield className="h-5 w-5" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-indigo-300 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline transition-colors hover:text-indigo-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
