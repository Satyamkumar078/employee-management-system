import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', employeeId: '', firstName: '', lastName: '',
    designation: '', department: '', salary: '', phone: '', dateOfJoining: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees');
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/employees', formData);
      toast.success('Employee added successfully');
      setShowModal(false);
      fetchEmployees();
      setFormData({
        email: '', password: '', employeeId: '', firstName: '', lastName: '',
        designation: '', department: '', salary: '', phone: '', dateOfJoining: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        toast.success('Employee deleted');
        fetchEmployees();
      } catch (err) {
        toast.error('Error deleting employee');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Salary (₹)</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {emp.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.employeeId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">₹{emp.salary?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(emp._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No employees found. Add one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Add New Employee</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
                  <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
