import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartPulse, LayoutDashboard, Users, Calendar, FileText, Clock,
  LogOut, Menu, X, Bell, Search, ChevronRight, Stethoscope
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'STAFF') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      ];
    } else if (role === 'DOCTOR') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
        { label: 'Schedule', icon: Clock, path: '/doctor/schedule' },
      ];
    } else {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
        { label: 'Find Doctors', icon: Stethoscope, path: '/patient/doctors' },
        { label: 'My Records', icon: FileText, path: '/patient/history' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Dark blue like reference */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1e1b4b] to-[#312e81] text-white flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <HeartPulse size={22} className="text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">HealthMatrix</h2>
          <button className="ml-auto lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-indigo-900 font-bold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-white/50 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600 hover:text-primary-600" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search in app..." 
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg w-64 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-primary-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border-2 border-white shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Welcome {user?.fullName?.split(' ')[0] || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export { MainLayout };
export default MainLayout;
