import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

export const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Base navigation based on roles
  const getNavItems = () => {
    const role = user?.role?.toUpperCase();
    
    const sharedItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${role?.toLowerCase()}` },
    ];

    if (role === 'ADMIN') {
      return [
        ...sharedItems,
        { label: 'Doctors', icon: Users, path: '/dashboard/admin/doctors' },
        { label: 'Patients', icon: Users, path: '/dashboard/admin/patients' },
        { label: 'Appointments', icon: Calendar, path: '/dashboard/admin/appointments' },
        { label: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
      ];
    } else if (role === 'DOCTOR') {
      return [
        ...sharedItems,
        { label: 'My Appointments', icon: Calendar, path: '/dashboard/doctor/appointments' },
        { label: 'Patients', icon: Users, path: '/dashboard/doctor/patients' },
        { label: 'Prescriptions', icon: FileText, path: '/dashboard/doctor/prescriptions' },
      ];
    } else {
      // PATIENT
      return [
        ...sharedItems,
        { label: 'My Appointments', icon: Calendar, path: '/dashboard/patient/appointments' },
        { label: 'Medical Records', icon: FileText, path: '/dashboard/patient/records' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-panel transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-100/50 mb-6">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 mr-3">
            <HeartPulse size={22} />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-900 to-primary-600">
            CareSync
          </h2>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                  }
                `}
              >
                <item.icon 
                  size={20} 
                  className={`mr-3 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} 
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 glass-panel border-b-0 border-indigo-50/20 px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-600 hover:text-primary-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex relative text-gray-400 focus-within:text-primary-500 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-white/50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block w-64 pl-10 p-2.5 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{user?.fullName || 'User Name'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Role'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          {/* subtle background pattern for content area */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
          
          <div className="relative z-10 animate-fade-in max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
