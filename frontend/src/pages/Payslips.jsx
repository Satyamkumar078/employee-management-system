import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Download, Plus } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    employee_id: '', month: '', year: new Date().getFullYear().toString(),
    basicSalary: '', allowances: '', deductions: ''
  });

  const payslipRefs = useRef({});

  const fetchPayslips = async () => {
    try {
      const res = await api.get('/api/payslips');
      setPayslips(res.data);
    } catch (err) {
      toast.error('Failed to fetch payslips');
    }
  };

  const fetchEmployees = async () => {
    if (user?.role === 'Admin') {
      try {
        const res = await api.get('/api/employees');
        setEmployees(res.data);
      } catch (err) {}
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payslips', formData);
      toast.success('Payslip generated successfully');
      setShowModal(false);
      fetchPayslips();
      setFormData({
        employee_id: '', month: '', year: new Date().getFullYear().toString(),
        basicSalary: '', allowances: '', deductions: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating payslip');
    }
  };

  const downloadPDF = async (id, employeeName, month, year) => {
    const originalElement = payslipRefs.current[id];
    
    // 1. Deep clone the DOM element
    const clonedElement = originalElement.cloneNode(true);
    
    // 2. Remove 'hidden' and force off-screen rendering
    clonedElement.classList.remove('hidden');
    clonedElement.style.display = 'block';
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    
    // 3. Inject clone into body
    document.body.appendChild(clonedElement);

    // 4. Async paint synchronization (wait for browser layout engine)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const opt = {
      margin: 1,
      filename: `Payslip_${employeeName}_${month}_${year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      // 5. html2pdf capture sequence
      await html2pdf().set(opt).from(clonedElement).save();
    } finally {
      // 6. Clean memory cleanup
      document.body.removeChild(clonedElement);
    }
  };

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Generate Payslip</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.map(payslip => (
          <div key={payslip._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {payslip.employee_id?.firstName} {payslip.employee_id?.lastName}
                </h3>
                <p className="text-sm text-gray-500">Month: {payslip.month}/{payslip.year}</p>
              </div>
              <button 
                onClick={() => downloadPDF(payslip._id, payslip.employee_id?.firstName, payslip.month, payslip.year)}
                className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                title="Download PDF"
              >
                <Download size={20} />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Basic Salary</span>
                <span className="font-medium text-gray-900">₹{payslip.basicSalary?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Allowances</span>
                <span className="font-medium text-green-600">+ ₹{payslip.allowances?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deductions</span>
                <span className="font-medium text-red-600">- ₹{payslip.deductions?.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="font-bold text-gray-900">Net Salary</span>
                <span className="font-bold text-blue-600">₹{payslip.netSalary?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div 
              ref={el => payslipRefs.current[payslip._id] = el} 
              className="hidden bg-white p-10 w-[800px] border border-gray-200"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-wider">EMS PRO</h1>
                <p className="text-gray-500 mt-1">Payslip for the month of {payslip.month}/{payslip.year}</p>
              </div>

              <div className="flex justify-between border-b border-gray-300 pb-6 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Employee Details</h3>
                  <p className="text-gray-600 mt-2">Name: <span className="font-medium text-gray-900">{payslip.employee_id?.firstName} {payslip.employee_id?.lastName}</span></p>
                  <p className="text-gray-600">ID: <span className="font-medium text-gray-900">{payslip.employee_id?.employeeId}</span></p>
                  <p className="text-gray-600">Designation: <span className="font-medium text-gray-900">{payslip.employee_id?.designation}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Earnings</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-medium text-gray-900">₹{payslip.basicSalary?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Allowances</span>
                    <span className="font-medium text-gray-900">₹{payslip.allowances?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Deductions</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax & Others</span>
                    <span className="font-medium text-gray-900">₹{payslip.deductions?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                <span className="text-xl font-bold text-gray-800">Net Salary</span>
                <span className="text-2xl font-bold text-blue-600">₹{payslip.netSalary?.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="mt-16 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
                This is a computer generated document and requires no signature.
              </div>
            </div>
          </div>
        ))}
        {payslips.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No payslips generated yet.
          </div>
        )}
      </div>

      {/* Generate Payslip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Generate Payslip</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                    <option value="">Select</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₹)</label>
                <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (₹)</label>
                <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.allowances} onChange={e => setFormData({...formData, allowances: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (₹)</label>
                <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
