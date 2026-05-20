const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: String, // e.g. "05"
    required: true,
  },
  year: {
    type: String, // e.g. "2026"
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  allowances: {
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payslip', payslipSchema);
