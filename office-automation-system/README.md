# Office Automation System

A complete **frontend-only** office management system built with **HTML, CSS, and Vanilla JavaScript**. This application uses **LocalStorage** as the database and works entirely offline in a browser without any backend or server requirements.

## 🎯 Project Overview

**Project Name:** OfficeHub - Office Automation System  
**Type:** Frontend-only Web Application  
**Storage:** Browser LocalStorage  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript  
**User Roles:** Admin, Manager, Employee

## ✨ Features

### 🔐 Authentication System
- Login system using LocalStorage
- Role-based access control (Admin, Manager, Employee)
- Secure user session management
- Automatic redirect to role-based dashboards

### 👨‍💼 Admin Features
- **User Management:** Create, edit, delete users with role assignment
- **Attendance Management:** View and manage all attendance records
- **Task Management:** View all tasks across the organization
- **Salary Management:** Generate monthly salaries, create payslips
- **Account Management:** Track salary expenses
- **Internal Chat:** Communicate with all users
- **Dashboard Analytics:** View statistics and reports

### 👔 Manager Features
- **Team Management:** View assigned employees
- **Task Assignment:** Assign tasks with priority and deadlines
- **Task Tracking:** Monitor task statuses (Not Started, Pending, Completed)
- **Attendance Entry:** Manual attendance entry for team members
- **Leave Management:** Approve or reject leave requests
- **Salary View:** Read-only access to team salary information
- **Internal Chat:** Communicate with admin and employees
- **Dashboard Analytics:** View team statistics

### 👤 Employee Features
- **Attendance:** Manual check-in/check-out functionality
- **Attendance History:** View personal attendance records
- **Task Management:** View and update assigned task status
- **Task Remarks:** Add comments and updates to tasks
- **Salary Details:** View salary information and payslips
- **Payslip Download:** Generate and print payslips
- **Internal Chat:** Communicate with manager and admin
- **Profile Management:** Update personal information

## 📁 Folder Structure

```
office-automation-system/
│
├── index.html                  # Login page
├── admin-dashboard.html        # Admin dashboard
├── manager-dashboard.html      # Manager dashboard
├── employee-dashboard.html     # Employee dashboard
│
├── css/
│   ├── main.css               # Global styles and design system
│   ├── login.css              # Login page specific styles
│   └── dashboard.css          # Dashboard layout and components
│
├── js/
│   ├── storage.js             # LocalStorage management
│   ├── auth.js                # Authentication logic
│   ├── utils.js               # Utility functions
│   ├── sample-data.js         # Sample data initialization
│   ├── login.js               # Login page logic
│   ├── admin-dashboard.js     # Admin dashboard logic
│   ├── manager-dashboard.js   # Manager dashboard logic
│   └── employee-dashboard.js  # Employee dashboard logic
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or backend required!

### Installation

1. **Download or Clone the Project**
   ```bash
   # If you have the files in a folder, just navigate to it
   cd office-automation-system
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server (optional):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```
   - Then navigate to `http://localhost:8000`

## 👥 Initial Login

On first launch, the system creates one admin account:

### Admin Account (Default)
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full system access

**Important:** After first login, change the default password and create your own users!

### Creating Your First Users

1. Login as admin
2. Go to "Users" page
3. Click "+ Add User"
4. Fill in the details (name, email, role, department, salary)
5. Save the user

You can create:
- **Admins** - Full system access
- **Managers** - Manage teams and assign tasks
- **Employees** - Track attendance and tasks

## 🎨 User Interface

The application features a modern, refined aesthetic with:

- **Distinctive Typography:** Playfair Display for headings, Work Sans for body text
- **Sophisticated Color Scheme:** Navy blue primary with gold accents
- **Responsive Design:** Works on desktop and mobile devices
- **Dark Mode Support:** Toggle between light and dark themes
- **Smooth Animations:** Polished transitions and micro-interactions
- **Professional Components:** Cards, tables, modals, charts

## 💾 LocalStorage Data Structure

The application stores data in the following keys:

- `office_users` - User accounts and profiles
- `office_attendance` - Attendance records
- `office_tasks` - Task assignments
- `office_salaries` - Salary records and payslips
- `office_messages` - Chat messages
- `office_leave_requests` - Leave applications
- `office_current_user` - Current session
- `office_theme` - UI theme preference

## 🔧 Core Modules

### 1. Manual Attendance Management
- Daily check-in/check-out functionality
- Attendance status: Present, Absent, Half-day
- Monthly attendance calculation
- Attendance history and reports

### 2. Task Management System
- Task assignment by managers
- Priority levels: Low, Medium, High
- Status tracking: Not Started, Pending, Completed
- Task remarks and updates
- Deadline management

### 3. Internal Chat System
- One-to-one messaging
- Real-time message updates
- WhatsApp-style interface
- Message history persistence
- Chat with role-based users

### 4. Salary Management
- Attendance-based salary calculation
- Monthly payslip generation
- Salary history tracking
- Printable payslips
- Pending salary alerts

### 5. Search & Filter
- Search employees, tasks, attendance
- Filter by role, department, status
- Real-time search results
- Advanced filtering options

## 📊 Key Features Explained

### Attendance System
- Employees can check-in and check-out
- Managers can manually mark attendance for their team
- Admins can view and manage all attendance records
- Attendance affects salary calculations

### Task Workflow
1. Manager assigns task to employee
2. Employee sees task in dashboard
3. Employee updates status and adds remarks
4. Manager/Admin can track progress
5. Task completion marked by employee

### Salary Calculation
```
Per Day Salary = Base Salary / Working Days
Net Salary = Per Day Salary × Days Worked
```

### Chat System
- Employees can chat with their manager and admins
- Managers can chat with their team and admins
- Admins can chat with all users
- Messages are stored locally and persist

## 🎯 Use Cases

### For Small Businesses
- Manage up to 50 employees
- Track attendance without expensive software
- Assign and monitor tasks
- Generate payslips quickly

### For Teams
- Coordinate remote work
- Track project tasks
- Maintain communication
- Monitor team performance

### For Startups
- Lightweight HR management
- No infrastructure costs
- Offline-capable
- Easy to deploy

## 🔒 Security Considerations

⚠️ **Important Notes:**
- This is a **client-side only** application
- Data is stored in **browser LocalStorage**
- Not suitable for production with sensitive data
- No encryption or secure authentication
- Suitable for demos, prototypes, and learning
- For production use, implement proper backend with authentication

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Responsive Design

The application is fully responsive and works on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1919px)
- 📱 Tablet (768px - 1365px)
- 📱 Mobile (320px - 767px)

## 🎨 Customization

### Change Color Scheme
Edit `css/main.css` and modify CSS variables:
```css
:root {
    --primary-dark: #1a2332;
    --accent-gold: #d4af37;
    /* ... other variables ... */
}
```

### Change Fonts
Update the Google Fonts import in `css/main.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font');
```

### Add New Features
1. Create new functions in respective dashboard JS files
2. Add UI components in HTML files
3. Style with CSS following the design system

## 🐛 Troubleshooting

### Data Not Persisting
- Check browser LocalStorage is enabled
- Clear browser cache and reload
- Try in incognito/private mode

### Login Issues
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify credentials are correct
- Clear LocalStorage and reinitialize

### UI Not Loading
- Check all CSS files are linked correctly
- Verify all JavaScript files load in correct order
- Check browser console for errors

## 📝 Starting Fresh

The application starts with **no sample data** - just one admin account.

**First-time setup:**
1. Login with admin credentials (admin/admin123)
2. Create your users (managers and employees)
3. Assign managers to employees
4. Start using the system!

**Optional Sample Data:**
If you want to test with sample data, edit `js/sample-data.js` and uncomment the line:
```javascript
// initializeSampleData();  // Remove the // to enable
```

This will create:
- 7 users (1 admin, 2 managers, 4 employees)
- 15 days of attendance records
- 5 sample tasks
- Sample chat messages

To reset data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear LocalStorage
4. Refresh the page

## 🚀 Future Enhancements

Potential features for extension:
- File upload and document management
- Calendar and event scheduling
- Performance reviews
- Leave balance tracking
- Expense management
- Reports and analytics
- Email notifications (requires backend)
- Data export to Excel/PDF

## 📄 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Fork and modify
- Use for learning
- Extend with new features
- Improve the design

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Inspect browser console for errors

## 🎓 Learning Resources

This project demonstrates:
- LocalStorage CRUD operations
- JavaScript module patterns
- CSS Grid and Flexbox layouts
- Responsive design principles
- Form validation
- Event handling
- DOM manipulation
- State management

## ⚡ Performance

- Lightweight (no external libraries)
- Fast load times
- Smooth animations
- Efficient LocalStorage queries
- Optimized for modern browsers

---

**Built with ❤️ using pure HTML, CSS, and JavaScript**

Enjoy using the Office Automation System! 🎉
