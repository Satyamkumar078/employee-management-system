const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');

const router = express.Router();

// Get payslips
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user.id });
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      query.employee_id = employee._id;
    }

    const payslips = await Payslip.find(query).populate('employee_id', 'firstName lastName employeeId designation').sort({ year: -1, month: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Generate payslip (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { employee_id, month, year, basicSalary, allowances, deductions } = req.body;
    
    // Check if already generated for the month and year
    const existing = await Payslip.findOne({ employee_id, month, year });
    if (existing) return res.status(400).json({ message: 'Payslip already generated for this month' });

    const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

    const payslip = new Payslip({
      employee_id,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary
    });

    const savedPayslip = await payslip.save();
    res.status(201).json(savedPayslip);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
