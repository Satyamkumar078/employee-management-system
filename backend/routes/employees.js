const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Employee = require('../models/Employee');

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().populate('user_id', 'email role');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create employee (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { email, password, employeeId, firstName, lastName, designation, department, salary, phone, address, dateOfJoining } = req.body;
    
    // Check if email or employeeId exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    
    const existingEmp = await Employee.findOne({ employeeId });
    if (existingEmp) return res.status(400).json({ message: 'Employee ID already exists' });

    // Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword, role: 'Employee' });
    const savedUser = await newUser.save();

    // Create Employee Profile
    const newEmployee = new Employee({
      user_id: savedUser._id,
      employeeId,
      firstName,
      lastName,
      designation,
      department,
      salary,
      phone,
      address,
      dateOfJoining
    });
    const savedEmployee = await newEmployee.save();

    res.status(201).json(savedEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update employee (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body },
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete employee (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    await User.findByIdAndDelete(employee.user_id);
    await Employee.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
