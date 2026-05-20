const { inngest } = require('./client');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const markDailyAttendance = inngest.createFunction(
  { id: 'mark-daily-attendance' },
  { cron: '59 23 * * *' }, // Run daily at 23:59
  async ({ step }) => {
    const date = new Date().toISOString().split('T')[0];

    const result = await step.run('mark-absent-for-unmarked', async () => {
      const employees = await Employee.find();
      let markedCount = 0;

      for (const emp of employees) {
        const existing = await Attendance.findOne({ employee_id: emp._id, date });
        if (!existing) {
          const absent = new Attendance({
            employee_id: emp._id,
            date,
            status: 'Absent'
          });
          await absent.save();
          markedCount++;
        }
      }
      return markedCount;
    });

    return { message: `Marked ${result} employees as absent for ${date}` };
  }
);

module.exports = { markDailyAttendance };
