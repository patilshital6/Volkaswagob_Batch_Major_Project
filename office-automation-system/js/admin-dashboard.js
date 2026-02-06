/**
 * ADMIN-DASHBOARD.JS - Admin Dashboard Logic
 */

// Protect page - only admins can access
Auth.protectPage('admin');

const currentUser = Auth.getCurrentUser();
let currentPage = 'dashboard';
let selectedChatUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    setupNavigation();
    loadDashboardStats();
    loadDashboardPage();
});

/**
 * Load current user info
 */
function loadUserInfo() {
    const user = Storage.getUserById(currentUser.id);
    if (user) {
        document.getElementById('currentUserName').textContent = user.fullName;
        document.querySelector('.user-avatar').textContent = Utils.getInitials(user.fullName);
    }
}

/**
 * Setup navigation
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Get page name
            const page = this.dataset.page;
            currentPage = page;
            
            // Update page title
            document.getElementById('pageTitle').textContent = 
                this.querySelector('span:last-child').textContent;
            
            // Show appropriate page
            showPage(page);
        });
    });
}

/**
 * Show specific page
 */
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Load page content
        switch(page) {
            case 'dashboard':
                loadDashboardPage();
                break;
            case 'users':
                loadUsersPage();
                break;
            case 'attendance':
                loadAttendancePage();
                break;
            case 'leave':
                loadLeavePage();
                break;
            case 'salary':
                loadSalaryPage();
                break;
            case 'chat':
                loadChatPage();
                break;
        }
    }
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const users = Storage.getUsers();
    const attendance = Storage.getAttendance();
    const salaries = Storage.getSalaries();
    const leaveRequests = Storage.getLeaveRequests();
    
    // Total users
    document.getElementById('totalUsers').textContent = users.length;
    
    // Leave requests (pending)
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
    document.getElementById('leaveRequests').textContent = pendingLeaves;
    
    // Present today
    const today = Utils.getCurrentDate();
    const presentToday = attendance.filter(a => 
        a.date === today && a.status === 'present'
    ).length;
    document.getElementById('presentToday').textContent = presentToday;
    
    // Pending salaries
    const currentMonth = Utils.getCurrentMonth();
    const pendingSalaries = users.filter(u => 
        u.role !== 'admin' && !salaries.find(s => s.userId === u.id && s.month === currentMonth)
    ).length;
    document.getElementById('pendingSalaries').textContent = pendingSalaries;
}

/**
 * Load dashboard page
 */
function loadDashboardPage() {
    loadDashboardStats();
    loadRecentAttendance();
    loadPendingLeaveRequests();
}

/**
 * Load recent attendance
 */
function loadRecentAttendance() {
    const attendance = Storage.getAttendance();
    const users = Storage.getUsers();
    const today = Utils.getCurrentDate();
    
    const todayAttendance = attendance
        .filter(a => a.date === today)
        .slice(0, 5);
    
    const container = document.getElementById('recentAttendance');
    
    if (todayAttendance.length === 0) {
        container.innerHTML = '<p class="text-muted">No attendance records for today</p>';
        return;
    }
    
    container.innerHTML = todayAttendance.map(att => {
        const user = users.find(u => u.id === att.userId);
        return `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${user ? user.fullName : 'Unknown'}</div>
                    <div class="list-item-subtitle">${user ? user.department : ''}</div>
                </div>
                ${Utils.getStatusBadge(att.status)}
            </div>
        `;
    }).join('');
}

/**
 * Load pending leave requests
 */
function loadPendingLeaveRequests() {
    const leaveRequests = Storage.getLeaveRequests().filter(l => l.status === 'pending');
    const users = Storage.getUsers();
    
    const container = document.getElementById('pendingLeaveRequests');
    
    if (leaveRequests.length === 0) {
        container.innerHTML = '<p class="text-muted">No pending leave requests</p>';
        return;
    }
    
    container.innerHTML = leaveRequests.slice(0, 5).map(leave => {
        const user = users.find(u => u.id === leave.userId);
        return `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${user ? user.fullName : 'Unknown'}</div>
                    <div class="list-item-subtitle">${Utils.formatDate(leave.fromDate)} - ${Utils.formatDate(leave.toDate)}</div>
                </div>
                ${Utils.getStatusBadge(leave.status)}
            </div>
        `;
    }).join('');
}

/**
 * Load users page
 */
function loadUsersPage() {
    const users = Storage.getUsers();
    renderUsersTable(users);
    
    // Setup search
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', Utils.debounce(function() {
        const filtered = Utils.filterBySearch(users, this.value, ['fullName', 'username', 'email', 'department', 'role']);
        renderUsersTable(filtered);
    }, 300));
}

/**
 * Render users table
 */
function renderUsersTable(users) {
    const container = document.getElementById('usersTable');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No users found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.fullName}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td><span class="role-badge ${user.role}">${user.role}</span></td>
                        <td>${user.department}</td>
                        <td>${Utils.formatDate(user.joinDate)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')">Edit</button>
                            ${user.id !== currentUser.id ? 
                                `<button class="btn btn-sm btn-secondary" onclick="deleteUserConfirm('${user.id}')">Delete</button>` 
                                : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Open user modal
 */
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    
    form.reset();
    
    if (userId) {
        // Edit mode
        const user = Storage.getUserById(userId);
        if (user) {
            title.textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('fullName').value = user.fullName;
            document.getElementById('usernameInput').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('passwordInput').value = user.password;
            document.getElementById('role').value = user.role;
            document.getElementById('department').value = user.department;
            document.getElementById('baseSalary').value = user.baseSalary;
            document.getElementById('joinDate').value = user.joinDate;
        }
    } else {
        // Add mode
        title.textContent = 'Add User';
        document.getElementById('joinDate').value = Utils.getCurrentDate();
    }
    
    modal.classList.add('active');
}

/**
 * Close user modal
 */
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

/**
 * Edit user
 */
function editUser(userId) {
    openUserModal(userId);
}

/**
 * Delete user confirmation
 */
function deleteUserConfirm(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        Storage.deleteUser(userId);
        Utils.showSuccess('User deleted successfully');
        loadUsersPage();
    }
}

// User form submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        fullName: document.getElementById('fullName').value,
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('email').value,
        password: document.getElementById('passwordInput').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
        baseSalary: parseInt(document.getElementById('baseSalary').value),
        joinDate: document.getElementById('joinDate').value
    };
    
    if (userId) {
        // Update existing user
        Storage.updateUser(userId, userData);
        Utils.showSuccess('User updated successfully');
    } else {
        // Create new user
        Storage.addUser(userData);
        Utils.showSuccess('User created successfully');
    }
    
    closeUserModal();
    loadUsersPage();
    loadDashboardStats();
});

/**
 * Load attendance page
 */
function loadAttendancePage() {
    const monthInput = document.getElementById('attendanceMonth');
    const userSelect = document.getElementById('attendanceUser');
    
    // Set current month
    monthInput.value = Utils.getCurrentMonth();
    
    // Populate user dropdown
    const users = Storage.getUsers();
    userSelect.innerHTML = '<option value="">All Users</option>' + 
        users.map(u => `<option value="${u.id}">${u.fullName}</option>`).join('');
    
    // Load attendance
    loadAttendanceTable();
    
    // Setup filters
    monthInput.addEventListener('change', loadAttendanceTable);
    userSelect.addEventListener('change', loadAttendanceTable);
}

/**
 * Load attendance table
 */
function loadAttendanceTable() {
    const month = document.getElementById('attendanceMonth').value;
    const userId = document.getElementById('attendanceUser').value;
    
    let attendance = Storage.getAttendance();
    const users = Storage.getUsers();
    
    // Filter by month
    if (month) {
        attendance = attendance.filter(a => a.date.startsWith(month));
    }
    
    // Filter by user
    if (userId) {
        attendance = attendance.filter(a => a.userId === userId);
    }
    
    const container = document.getElementById('attendanceTable');
    
    if (attendance.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No attendance records found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                </tr>
            </thead>
            <tbody>
                ${attendance.map(att => {
                    const user = users.find(u => u.id === att.userId);
                    return `
                        <tr>
                            <td>${user ? user.fullName : 'Unknown'}</td>
                            <td>${Utils.formatDate(att.date)}</td>
                            <td>${Utils.getStatusBadge(att.status)}</td>
                            <td>${att.checkIn || '-'}</td>
                            <td>${att.checkOut || '-'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Load leave page
 */
function loadLeavePage() {
    const leaveRequests = Storage.getLeaveRequests();
    renderLeaveTable(leaveRequests);
    
    // Setup filter
    const filterSelect = document.getElementById('leaveStatusFilter');
    filterSelect.addEventListener('change', function() {
        const filtered = this.value ? 
            leaveRequests.filter(l => l.status === this.value) : leaveRequests;
        renderLeaveTable(filtered);
    });
}

/**
 * Render leave table
 */
function renderLeaveTable(requests) {
    const container = document.getElementById('leaveTable');
    const users = Storage.getUsers();
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No leave requests found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => {
                    const user = users.find(u => u.id === request.userId);
                    const canApprove = request.managerId === currentUser.id || currentUser.role === 'admin';
                    return `
                        <tr>
                            <td>${user ? user.fullName : 'Unknown'}</td>
                            <td>${Utils.formatDate(request.fromDate)}</td>
                            <td>${Utils.formatDate(request.toDate)}</td>
                            <td>${request.leaveType || 'N/A'}</td>
                            <td>${request.reason}</td>
                            <td>${Utils.getStatusBadge(request.status)}</td>
                            <td>
                                ${request.status === 'pending' && canApprove ? `
                                    <button class="btn btn-sm btn-primary" onclick="approveLeave('${request.id}')">Approve</button>
                                    <button class="btn btn-sm btn-secondary" onclick="rejectLeave('${request.id}')">Reject</button>
                                ` : '-'}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Approve leave
 */
function approveLeave(requestId) {
    Storage.updateLeaveRequest(requestId, { status: 'approved' });
    Utils.showSuccess('Leave request approved');
    loadLeavePage();
    loadDashboardStats();
}

/**
 * Reject leave
 */
function rejectLeave(requestId) {
    Storage.updateLeaveRequest(requestId, { status: 'rejected' });
    Utils.showSuccess('Leave request rejected');
    loadLeavePage();
    loadDashboardStats();
}

/**
 * Load salary page
 */
function loadSalaryPage() {
    const monthInput = document.getElementById('salaryMonth');
    monthInput.value = Utils.getCurrentMonth();
    
    loadSalaryTable();
    
    monthInput.addEventListener('change', loadSalaryTable);
}

/**
 * Load salary table
 */
function loadSalaryTable() {
    const month = document.getElementById('salaryMonth').value;
    const salaries = Storage.getSalaries().filter(s => s.month === month);
    const users = Storage.getUsers();
    
    const container = document.getElementById('salaryTable');
    
    if (salaries.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No salary records for this month</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Base Salary</th>
                    <th>Days Worked</th>
                    <th>Net Salary</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${salaries.map(salary => {
                    const user = users.find(u => u.id === salary.userId);
                    return `
                        <tr>
                            <td>${user ? user.fullName : 'Unknown'}</td>
                            <td>${salary.month}</td>
                            <td>${Utils.formatCurrency(salary.baseSalary)}</td>
                            <td>${salary.daysWorked}</td>
                            <td>${Utils.formatCurrency(salary.netSalary)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewPayslip('${salary.id}')">View Payslip</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Open salary modal
 */
function openSalaryModal() {
    const modal = document.getElementById('salaryModal');
    const form = document.getElementById('salaryForm');
    const userSelect = document.getElementById('salaryUserId');
    const monthInput = document.getElementById('salaryMonthInput');
    
    form.reset();
    
    // Populate users
    const users = Storage.getUsers().filter(u => u.role !== 'admin');
    userSelect.innerHTML = users.map(u => 
        `<option value="${u.id}">${u.fullName}</option>`
    ).join('');
    
    // Set current month
    monthInput.value = Utils.getCurrentMonth();
    
    modal.classList.add('active');
}

/**
 * Close salary modal
 */
function closeSalaryModal() {
    document.getElementById('salaryModal').classList.remove('active');
}

// Salary form submission
document.getElementById('salaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('salaryUserId').value;
    const month = document.getElementById('salaryMonthInput').value;
    
    // Check if salary already exists
    const existing = Storage.getSalaryByUserAndMonth(userId, month);
    if (existing) {
        alert('Salary already generated for this user and month');
        return;
    }
    
    // Get user
    const user = Storage.getUserById(userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Get attendance for the month
    const attendance = Storage.getAttendanceByMonth(userId, month);
    const workingDays = Utils.getWorkingDaysInMonth(month);
    const daysWorked = attendance.filter(a => 
        a.status === 'present' || a.status === 'half_day'
    ).length;
    
    // Calculate salary
    const perDaySalary = user.baseSalary / workingDays;
    const netSalary = Math.round(perDaySalary * daysWorked);
    
    // Create salary record
    Storage.addSalary({
        userId: userId,
        month: month,
        baseSalary: user.baseSalary,
        workingDays: workingDays,
        daysWorked: daysWorked,
        netSalary: netSalary
    });
    
    Utils.showSuccess('Salary generated successfully');
    closeSalaryModal();
    loadSalaryTable();
    loadDashboardStats();
});

/**
 * View payslip
 */
function viewPayslip(salaryId) {
    alert('Payslip feature: Print or download payslip for salary ID: ' + salaryId);
}

/**
 * Load chat page
 */
function loadChatPage() {
    loadChatUsers();
    
    // Setup search
    const searchInput = document.getElementById('chatUserSearch');
    searchInput.addEventListener('input', Utils.debounce(function() {
        loadChatUsers(this.value);
    }, 300));
}

/**
 * Load chat users
 */
function loadChatUsers(searchTerm = '') {
    const users = Storage.getUsers().filter(u => u.id !== currentUser.id);
    const filtered = searchTerm ? 
        Utils.filterBySearch(users, searchTerm, ['fullName', 'username']) : users;
    
    const container = document.getElementById('chatUserList');
    
    container.innerHTML = filtered.map(user => `
        <div class="chat-user-item ${selectedChatUser?.id === user.id ? 'active' : ''}" 
             onclick="selectChatUser('${user.id}')">
            <div class="chat-avatar">${Utils.getInitials(user.fullName)}</div>
            <div>
                <div style="font-weight: 500;">${user.fullName}</div>
                <div style="font-size: 0.8125rem; color: var(--gray-600);">${user.role}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Select chat user
 */
function selectChatUser(userId) {
    const user = Storage.getUserById(userId);
    if (!user) return;
    
    selectedChatUser = user;
    
    // Update active state
    document.querySelectorAll('.chat-user-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.chat-user-item').classList.add('active');
    
    // Update chat header
    document.querySelector('.chat-user-name').textContent = user.fullName;
    document.querySelector('.chat-header .chat-avatar').textContent = Utils.getInitials(user.fullName);
    
    // Load messages
    loadMessages();
}

/**
 * Load messages
 */
function loadMessages() {
    if (!selectedChatUser) return;
    
    const messages = Storage.getMessagesBetweenUsers(currentUser.id, selectedChatUser.id);
    const container = document.getElementById('chatMessages');
    
    container.innerHTML = messages.map(msg => {
        const isSent = msg.senderId === currentUser.id;
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-content">${Utils.escapeHtml(msg.content)}</div>
                <div class="message-time">${Utils.formatTime(msg.timestamp)}</div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

/**
 * Send message
 */
function sendMessage() {
    if (!selectedChatUser) {
        alert('Please select a user to chat with');
        return;
    }
    
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    Storage.addMessage({
        senderId: currentUser.id,
        receiverId: selectedChatUser.id,
        content: content
    });
    
    input.value = '';
    loadMessages();
}

// Send message on Enter key
document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
