import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, Check, X } from 'lucide-react';

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/api/leaves');
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to fetch leaves');
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/leaves', formData);
      toast.success('Leave applied successfully');
      setShowModal(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error('Error applying for leave');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        {user?.role === 'Employee' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {user?.role === 'Admin' && <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Employee</th>}
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Duration</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                {user?.role === 'Admin' && <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map(leave => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  {user?.role === 'Admin' && (
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {leave.employee_id?.firstName} {leave.employee_id?.lastName}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {format(new Date(leave.startDate), 'dd MMM yyyy')} - {format(new Date(leave.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  {user?.role === 'Admin' && (
                    <td className="px-6 py-4 text-sm flex items-center space-x-2">
                      {leave.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusChange(leave._id, 'Approved')} className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100" title="Approve">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleStatusChange(leave._id, 'Rejected')} className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Reject">
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 5 : 3} className="px-6 py-8 text-center text-gray-500">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
