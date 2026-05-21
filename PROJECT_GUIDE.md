# EMS - Project Guide & Interview Notes

Welcome to the **Employee Management System (MERN)** guide. This document serves as a complete functional overview for recruiters to test the platform and provides deep-dive architectural notes for technical interviews.

---

## 1. Quick Start Guide for Recruiters

### How to Test the Project
This system uses a realistic **provision-only architecture**. This means there is intentionally no public "Sign Up" page. In real-world enterprise environments, employees do not create their own accounts; they are securely provisioned by the HR Administrator.

**Step-by-Step Testing Workflow:**
1. **Login as Admin:**
   - Go to the deployed Vercel URL.
   - Use the demo admin credentials displayed on the login screen (`admin@ems.com` / `admin123`).
2. **Provision an Employee:**
   - Navigate to the **Employees** tab.
   - Click "Add Employee", fill out the details (assign them a role of "Employee"), and note the email and password you created for them.
3. **Test the Employee Portal:**
   - Logout of the Admin account.
   - Login using the newly created Employee credentials.
   - Test marking **Attendance** and applying for **Leave**.
4. **Test Admin Approvals & Payslips:**
   - Logout and log back in as the Admin.
   - Go to the **Leaves** tab to Approve/Reject the pending leave request.
   - Go to the **Payslips** tab to dynamically generate a PDF payslip for the employee.

---

## 2. Technical Architecture

### Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons), `html2pdf.js` (Client-side PDF generation)
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM), JSON Web Tokens (JWT), Nodemailer (Emails), Inngest (Cron Jobs)
- **Deployment**: Vercel (Frontend) + Render (Backend REST API) + MongoDB Atlas (Database)

### Deployment Architecture (Vercel ↔ Render)
- The frontend is hosted globally on Vercel's Edge Network as static assets.
- A central `axios.js` configuration intercepts all API calls, dynamically routing them to the Render backend URL (`https://employee-management-api-le4u.onrender.com`).
- The backend uses `cors()` middleware to securely accept cross-origin requests from the Vercel domain.

### File & Folder Structure
```text
/backend
 ├── models/          # MongoDB Schemas (User, Employee, Attendance, Leave, Payslip)
 ├── routes/          # Express API Endpoints (auth, employees, dashboard, etc.)
 ├── middleware/      # JWT Authentication & Role-based access control (RBAC)
 ├── utils/           # Nodemailer email configurations
 ├── inngest/         # Background Cron Job functions
 └── server.js        # Main Express server, DB connection, and Auto-seeding logic

/frontend
 ├── src/
 │    ├── api/        # Centralized Axios configuration (axios.js)
 │    ├── components/ # Reusable UI blocks (Layout, Sidebar, Topbar)
 │    ├── context/    # React Context API (AuthContext for global state)
 │    ├── pages/      # Route-level views (Login, Dashboard, Leaves, etc.)
 │    └── App.jsx     # React Router DOM configuration (Protected Routes)
 └── vercel.json      # Client-side routing fallback configuration
```

---

## 3. Database Schema Overview (MongoDB)
The database is heavily relational by reference:
- **`User`**: Handles authentication (Email, hashed Password, Role).
- **`Employee`**: Stores profile metadata (Name, Phone, Department, Salary) and holds a `user_id` referencing the `User` document.
- **`Attendance`**: References `employee_id`. Stores date and status (Present/Absent). Enforces a unique compound index on `[employee_id, date]` to prevent duplicate check-ins on the same day.
- **`Leave`**: References `employee_id`. Stores start date, end date, reason, and status (Pending/Approved/Rejected).
- **`Payslip`**: References `employee_id`. Stores salary breakdowns (Basic, Allowances, Deductions, Net Salary) for a specific month/year.

---

## 4. Interview Explanation Notes

Use these notes to explain your technical decisions during interviews.

### Why MERN Stack?
> "I chose the MERN stack because JavaScript/JSON flows seamlessly from the MongoDB database through the Express backend directly to the React frontend. It reduces context switching between languages and allows for highly scalable, non-blocking asynchronous REST APIs."

### How does JWT Authentication work?
> "When a user logs in, the server verifies their bcrypt-hashed password and generates a stateless JSON Web Token (JWT) signed with a secret key. This token contains their User ID and Role. The React frontend stores this token in `localStorage` and automatically attaches it as a `Bearer` token in the `Authorization` header of every subsequent Axios request. The backend middleware intercepts these requests, verifies the token signature, and either grants access or rejects the request with a 401 Unauthorized error."

### How is Role-Based Access Control (RBAC) implemented?
> "On the backend, my JWT middleware injects the decoded user payload into the `req` object. API routes check `req.user.role`. If an Employee tries to access an Admin-only route (like creating a user or generating a payslip), the backend explicitly blocks them. On the frontend, React Router heavily utilizes the `AuthContext` to conditionally render Sidebar tabs and protect URL routes based on the logged-in user's role."

### Why Vercel + Render? Why not host them together?
> "I chose a decoupled microservice-style deployment. Vercel is specifically optimized for serving static React/Vite assets via a global CDN with incredibly fast load times. Render is optimized for long-running Node.js processes. By decoupling them, they scale independently. If the frontend receives heavy traffic, Vercel scales it instantly without putting unnecessary load on the Node backend."

### How do Background Cron Jobs work?
> "I integrated **Inngest** to handle background jobs reliably. Instead of relying on a fragile `setInterval` inside Node.js that gets wiped out when Render spins down the server, Inngest triggers a webhook on my Express server exactly at 23:59 every day. This trigger executes a function that queries all active employees, checks who lacks an attendance record for the day, and automatically marks them as 'Absent'."

### How does PDF Generation work?
> "Instead of overloading the Node.js backend with heavy PDF generation libraries like `pdfkit`, I utilized `html2pdf.js` on the frontend. When the user clicks download, React renders a visually stunning HTML template hidden off-screen, captures it as a high-quality canvas, and triggers a local file download. This drastically reduces backend server costs and API latency."

---

## 5. Future Improvements
If this project were to be scaled further, I would implement:
- **Redis Caching**: To cache dashboard statistics and reduce MongoDB read loads.
- **AWS S3**: To allow employees to upload profile pictures or medical documents for sick leaves.
- **WebSockets (Socket.io)**: To send real-time push notifications to employees when their leave request is approved, instead of requiring a page refresh.
