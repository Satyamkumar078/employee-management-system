const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const router = express.Router();

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user.id });
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      query.employee_id = employee._id;
    }
    
    // Optionally filter by date or month via query params
    if (req.query.date) {
      query.date = req.query.date;
    }

    const records = await Attendance.find(query).populate('employee_id', 'firstName lastName employeeId').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark attendance
router.post('/mark', authenticateToken, async (req, res) => {
  try {
    const { status, date } = req.body; // usually "Present" and today's date
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee profile required to mark attendance' });

    // Check if already marked for the date
    const existing = await Attendance.findOne({ employee_id: employee._id, date });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = new Attendance({
      employee_id: employee._id,
      date,
      status
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
