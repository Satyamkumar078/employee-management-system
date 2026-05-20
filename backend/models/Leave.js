const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  startDate: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  endDate: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
