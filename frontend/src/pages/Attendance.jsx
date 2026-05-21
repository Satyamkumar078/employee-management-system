import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/attendance');
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to fetch attendance');
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const markAttendance = async () => {
    setLoading(true);
    try {
      const localDate = new Date();
      const offset = localDate.getTimezoneOffset();
      const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
      const date = adjustedDate.toISOString().split('T')[0];
      await api.post('/api/attendance/mark', { status: 'Present', date });
      toast.success('Attendance marked for today');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
        {user?.role === 'Employee' && (
          <button 
            onClick={markAttendance}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Mark Present Today
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                {user?.role === 'Admin' && (
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                )}
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map(record => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {format(new Date(record.date), 'dd MMM yyyy')}
                  </td>
                  {user?.role === 'Admin' && (
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employee_id?.firstName} {record.employee_id?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{record.employee_id?.employeeId}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 3 : 2} className="px-6 py-8 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
