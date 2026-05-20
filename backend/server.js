const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { serve } = require('inngest/express');
const { inngest } = require('./inngest/client');
const { markDailyAttendance } = require('./inngest/functions');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const payslipRoutes = require('./routes/payslips');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Inngest route
app.use('/api/inngest', serve({
  client: inngest,
  functions: [markDailyAttendance],
}));

// Basic route
app.get('/', (req, res) => {
  res.send('EMS API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
