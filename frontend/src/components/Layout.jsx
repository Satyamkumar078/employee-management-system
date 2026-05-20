import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarOff, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">EMS<span className="text-white">Pro</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          {user?.role === 'Admin' && (
            <SidebarItem to="/employees" icon={Users} label="Employees" />
          )}
          <SidebarItem to="/attendance" icon={CalendarCheck} label="Attendance" />
          <SidebarItem to="/leaves" icon={CalendarOff} label="Leaves" />
          <SidebarItem to="/payslips" icon={FileText} label="Payslips" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center h-16">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {window.location.pathname === '/' ? 'Dashboard' : window.location.pathname.substring(1)}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
