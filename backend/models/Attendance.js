const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'On Leave'],
    required: true,
  },
}, { timestamps: true });

// Ensure unique attendance per employee per day
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
