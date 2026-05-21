import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserMinus, FileClock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, employeeData } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'Admin') {
      api.get('/api/dashboard/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  if (user?.role === 'Employee') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {employeeData?.firstName} {employeeData?.lastName}!</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Profile Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Employee ID</p>
              <p className="font-medium text-gray-900">{employeeData?.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Designation</p>
              <p className="font-medium text-gray-900">{employeeData?.designation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium text-gray-900">{employeeData?.department}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Employees" 
            value={stats.totalEmployees} 
            icon={Users} 
            colorClass="bg-blue-500" 
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={UserCheck} 
            colorClass="bg-green-500" 
          />
          <StatCard 
            title="On Leave Today" 
            value={stats.onLeaveToday} 
            icon={UserMinus} 
            colorClass="bg-purple-500" 
          />
          <StatCard 
            title="Pending Leaves" 
            value={stats.pendingLeaves} 
            icon={FileClock} 
            colorClass="bg-orange-500" 
          />
        </div>
      )}
    </div>
  );
}
