const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
