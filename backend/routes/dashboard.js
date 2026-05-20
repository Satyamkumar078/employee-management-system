const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const router = express.Router();

router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    
    const today = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.countDocuments({ date: today, status: 'Present' });
    const onLeaveToday = await Attendance.countDocuments({ date: today, status: 'On Leave' });
    
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    res.json({
      totalEmployees,
      presentToday,
      onLeaveToday,
      pendingLeaves
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
