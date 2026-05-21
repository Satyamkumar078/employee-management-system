const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const sendEmail = require('../utils/email');

const router = express.Router();

// Get all leaves (Admin sees all, Employee sees theirs)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user.id });
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      query.employee_id = employee._id;
    }

    const leaves = await Leave.find(query).populate('employee_id', 'firstName lastName').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Apply for leave
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const newLeave = new Leave({
      employee_id: employee._id,
      startDate,
      endDate,
      reason
    });

    const savedLeave = await newLeave.save();
    res.status(201).json(savedLeave);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update leave status (Admin only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee_id');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = status;
    await leave.save();

    // Send email notification asynchronously (fire-and-forget)
    const user = await User.findById(leave.employee_id.user_id);
    if (user) {
      sendEmail({
        to: user.email,
        subject: `Leave Application ${status}`,
        text: `Dear ${leave.employee_id.firstName},\n\nYour leave application from ${leave.startDate} to ${leave.endDate} has been ${status}.\n\nRegards,\nHR Department`
      }).catch(err => console.error('Email error:', err));
    }

    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
