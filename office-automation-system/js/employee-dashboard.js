/**
 * EMPLOYEE-DASHBOARD.JS - Employee Dashboard Logic
 */

// Protect page - only employees can access
Auth.protectPage('employee');

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
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const page = this.dataset.page;
            currentPage = page;
            
            document.getElementById('pageTitle').textContent = 
                this.querySelector('span:last-child').textContent;
            
            showPage(page);
        });
    });
}

/**
 * Show specific page
 */
function showPage(page) {
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
        
        switch(page) {
            case 'dashboard':
                loadDashboardPage();
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
            case 'profile':
                loadProfilePage();
                break;
        }
    }
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const user = Storage.getUserById(currentUser.id);
    const attendance = Storage.getAttendanceByMonth(currentUser.id, Utils.getCurrentMonth());
    const leaveRequests = Storage.getLeaveRequests().filter(l => l.userId === currentUser.id);
    
    // Attendance rate
    const attendanceRate = Utils.calculateAttendancePercentage(attendance);
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    
    // Leave stats
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
    document.getElementById('pendingLeaves').textContent = pendingLeaves;
    
    // Calculate leave balance (example: 12 days per year)
    const approvedLeaves = leaveRequests.filter(l => l.status === 'approved').length;
    const leaveBalance = Math.max(0, 12 - approvedLeaves);
    document.getElementById('leaveBalance').textContent = leaveBalance;
    
    // Salary
    const currentMonth = Utils.getCurrentMonth();
    const salary = Storage.getSalaryByUserAndMonth(currentUser.id, currentMonth);
    if (salary) {
        document.getElementById('currentSalary').textContent = Utils.formatCurrency(salary.netSalary);
    } else if (user) {
        document.getElementById('currentSalary').textContent = Utils.formatCurrency(user.baseSalary);
    }
}

/**
 * Load dashboard page
 */
function loadDashboardPage() {
    loadDashboardStats();
    loadTodayStatus();
    loadLeaveSummary();
}

/**
 * Load today's status
 */
function loadTodayStatus() {
    const today = Utils.getCurrentDate();
    const attendance = Storage.getAttendanceByUserAndDate(currentUser.id, today);
    
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const statusDiv = document.getElementById('attendanceStatus');
    
    if (attendance) {
        checkInBtn.disabled = true;
        
        if (attendance.checkOut) {
            checkOutBtn.disabled = true;
            statusDiv.innerHTML = `
                <p><strong>Status:</strong> ${Utils.getStatusBadge(attendance.status)}</p>
                <p>Check In: ${attendance.checkIn}</p>
                <p>Check Out: ${attendance.checkOut}</p>
            `;
        } else {
            checkOutBtn.disabled = false;
            statusDiv.innerHTML = `
                <p><strong>Status:</strong> ${Utils.getStatusBadge(attendance.status)}</p>
                <p>Check In: ${attendance.checkIn}</p>
            `;
        }
    } else {
        checkInBtn.disabled = false;
        checkOutBtn.disabled = true;
        statusDiv.innerHTML = '<p class="text-muted">Not checked in yet</p>';
    }
}

/**
 * Mark attendance
 */
function markAttendance(type) {
    const today = Utils.getCurrentDate();
    const now = new Date();
    const currentTime = now.toTimeString().substr(0, 5);
    
    if (type === 'check_in') {
        const existing = Storage.getAttendanceByUserAndDate(currentUser.id, today);
        if (existing) {
            alert('Already checked in today');
            return;
        }
        
        Storage.addAttendance({
            userId: currentUser.id,
            date: today,
            status: 'present',
            checkIn: currentTime,
            checkOut: null
        });
        
        Utils.showSuccess('Checked in successfully');
    } else if (type === 'check_out') {
        const attendance = Storage.getAttendanceByUserAndDate(currentUser.id, today);
        if (!attendance) {
            alert('Please check in first');
            return;
        }
        
        if (attendance.checkOut) {
            alert('Already checked out');
            return;
        }
        
        // Update with check out time
        const allAttendance = Storage.getAttendance();
        const index = allAttendance.findIndex(a => a.id === attendance.id);
        if (index !== -1) {
            allAttendance[index].checkOut = currentTime;
            Storage.setAttendance(allAttendance);
        }
        
        Utils.showSuccess('Checked out successfully');
    }
    
    loadTodayStatus();
    loadDashboardStats();
}

/**
 * Load leave summary
 */
function loadLeaveSummary() {
    const leaveRequests = Storage.getLeaveRequests()
        .filter(l => l.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const container = document.getElementById('leaveSummary');
    
    if (leaveRequests.length === 0) {
        container.innerHTML = '<p class="text-muted">No leave applications</p>';
        return;
    }
    
    container.innerHTML = leaveRequests.map(leave => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${Utils.formatDate(leave.fromDate)} - ${Utils.formatDate(leave.toDate)}</div>
                <div class="list-item-subtitle">${leave.leaveType || 'Leave'}</div>
            </div>
            ${Utils.getStatusBadge(leave.status)}
        </div>
    `).join('');
}

/**
 * Load attendance page
 */
function loadAttendancePage() {
    const monthInput = document.getElementById('attendanceMonth');
    monthInput.value = Utils.getCurrentMonth();
    
    loadAttendanceTable();
    monthInput.addEventListener('change', loadAttendanceTable);
}

/**
 * Load attendance table
 */
function loadAttendanceTable() {
    const month = document.getElementById('attendanceMonth').value;
    const attendance = Storage.getAttendanceByMonth(currentUser.id, month);
    
    const container = document.getElementById('attendanceTable');
    
    if (attendance.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No attendance records for this month</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                </tr>
            </thead>
            <tbody>
                ${attendance.map(att => `
                    <tr>
                        <td>${Utils.formatDate(att.date)}</td>
                        <td>${Utils.getStatusBadge(att.status)}</td>
                        <td>${att.checkIn || '-'}</td>
                        <td>${att.checkOut || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Update summary
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const halfDays = attendance.filter(a => a.status === 'half_day').length;
    
    document.getElementById('presentDays').textContent = presentDays;
    document.getElementById('absentDays').textContent = absentDays;
    document.getElementById('halfDays').textContent = halfDays;
}

/**
 * Load leave page
 */
function loadLeavePage() {
    const leaveRequests = Storage.getLeaveRequests().filter(l => l.userId === currentUser.id);
    renderLeaveTable(leaveRequests);
}

/**
 * Render leave table
 */
function renderLeaveTable(requests) {
    const container = document.getElementById('leaveTable');
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No leave applications yet</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(leave => `
                    <tr>
                        <td>${Utils.formatDate(leave.fromDate)}</td>
                        <td>${Utils.formatDate(leave.toDate)}</td>
                        <td>${leave.leaveType || 'N/A'}</td>
                        <td>${leave.reason}</td>
                        <td>${Utils.getStatusBadge(leave.status)}</td>
                        <td>${Utils.formatDate(leave.createdAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Open leave modal
 */
function openLeaveModal() {
    const modal = document.getElementById('leaveModal');
    const form = document.getElementById('leaveForm');
    
    form.reset();
    
    // Set minimum date to today
    const today = Utils.getCurrentDate();
    document.getElementById('leaveFromDate').min = today;
    document.getElementById('leaveToDate').min = today;
    
    modal.classList.add('active');
}

/**
 * Close leave modal
 */
function closeLeaveModal() {
    document.getElementById('leaveModal').classList.remove('active');
}

// Leave form submission
document.getElementById('leaveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fromDate = document.getElementById('leaveFromDate').value;
    const toDate = document.getElementById('leaveToDate').value;
    const leaveType = document.getElementById('leaveType').value;
    const reason = document.getElementById('leaveReason').value;
    
    // Validate dates
    if (new Date(toDate) < new Date(fromDate)) {
        alert('To Date cannot be before From Date');
        return;
    }
    
    const user = Storage.getUserById(currentUser.id);
    
    Storage.addLeaveRequest({
        userId: currentUser.id,
        managerId: user.managerId || null,
        fromDate: fromDate,
        toDate: toDate,
        leaveType: leaveType,
        reason: reason
    });
    
    Utils.showSuccess('Leave application submitted successfully');
    closeLeaveModal();
    loadLeavePage();
    loadDashboardStats();
});

/**
 * Load salary page
 */
function loadSalaryPage() {
    const monthInput = document.getElementById('salaryMonth');
    monthInput.value = Utils.getCurrentMonth();
    
    loadSalaryDetails();
    loadPayslipsList();
    
    monthInput.addEventListener('change', function() {
        loadSalaryDetails();
        loadPayslipsList();
    });
}

/**
 * Load salary details
 */
function loadSalaryDetails() {
    const month = document.getElementById('salaryMonth').value;
    const salary = Storage.getSalaryByUserAndMonth(currentUser.id, month);
    const user = Storage.getUserById(currentUser.id);
    
    const container = document.getElementById('salaryDetails');
    
    if (salary) {
        container.innerHTML = `
            <h3>Salary for ${month}</h3>
            <div class="payslip-row">
                <span>Base Salary:</span>
                <strong>${Utils.formatCurrency(salary.baseSalary)}</strong>
            </div>
            <div class="payslip-row">
                <span>Working Days:</span>
                <strong>${salary.workingDays}</strong>
            </div>
            <div class="payslip-row">
                <span>Days Worked:</span>
                <strong>${salary.daysWorked}</strong>
            </div>
            <div class="payslip-row">
                <span>Net Salary:</span>
                <strong>${Utils.formatCurrency(salary.netSalary)}</strong>
            </div>
            <button class="btn btn-primary mt-2" onclick="downloadPayslipPDF('${salary.id}')">Download PDF Payslip</button>
        `;
    } else if (user) {
        container.innerHTML = `
            <h3>Salary for ${month}</h3>
            <p class="text-muted">Salary not yet generated for this month</p>
            <div class="payslip-row">
                <span>Base Salary:</span>
                <strong>${Utils.formatCurrency(user.baseSalary)}</strong>
            </div>
        `;
    }
}

/**
 * Load payslips list
 */
function loadPayslipsList() {
    const salaries = Storage.getSalaries().filter(s => s.userId === currentUser.id);
    const container = document.getElementById('payslipsList');
    
    if (salaries.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No payslips available</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Net Salary</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${salaries.map(salary => `
                    <tr>
                        <td>${salary.month}</td>
                        <td>${Utils.formatCurrency(salary.netSalary)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="downloadPayslipPDF('${salary.id}')">Download PDF</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Download payslip as PDF
 */
function downloadPayslipPDF(salaryId) {
    const salary = Storage.getSalaries().find(s => s.id === salaryId);
    if (!salary) return;
    
    const user = Storage.getUserById(salary.userId);
    
    // Create payslip HTML
    const payslipHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Payslip - ${user.fullName} - ${salary.month}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #d4af37;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #1a2332;
                    margin: 0;
                }
                .header h2 {
                    color: #666;
                    font-weight: normal;
                    margin: 10px 0 0 0;
                }
                .info-section {
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .info-row strong {
                    color: #1a2332;
                }
                .total-section {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border: 2px solid #d4af37;
                    border-radius: 5px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #d4af37;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>OfficeHub</h1>
                <h2>Payslip for ${salary.month}</h2>
            </div>
            
            <div class="info-section">
                <div class="info-row">
                    <span><strong>Employee Name:</strong></span>
                    <span>${user.fullName}</span>
                </div>
                <div class="info-row">
                    <span><strong>Employee ID:</strong></span>
                    <span>${user.id}</span>
                </div>
                <div class="info-row">
                    <span><strong>Department:</strong></span>
                    <span>${user.department}</span>
                </div>
                <div class="info-row">
                    <span><strong>Month:</strong></span>
                    <span>${salary.month}</span>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-row">
                    <span><strong>Base Salary:</strong></span>
                    <span>₹${salary.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div class="info-row">
                    <span><strong>Working Days:</strong></span>
                    <span>${salary.workingDays}</span>
                </div>
                <div class="info-row">
                    <span><strong>Days Worked:</strong></span>
                    <span>${salary.daysWorked}</span>
                </div>
                <div class="info-row">
                    <span><strong>Days Absent:</strong></span>
                    <span>${salary.workingDays - salary.daysWorked}</span>
                </div>
            </div>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Net Salary:</span>
                    <span>₹${salary.netSalary.toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>This is a system-generated payslip.</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;
    
    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(payslipHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
    };
}

/**
 * Load chat page
 */
function loadChatPage() {
    loadChatUsers();
    
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
    
    document.querySelectorAll('.chat-user-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.chat-user-item').classList.add('active');
    
    document.querySelector('.chat-user-name').textContent = user.fullName;
    document.querySelector('.chat-header .chat-avatar').textContent = Utils.getInitials(user.fullName);
    
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

document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

/**
 * Load profile page
 */
function loadProfilePage() {
    const user = Storage.getUserById(currentUser.id);
    if (!user) return;
    
    document.getElementById('profileFullName').value = user.fullName;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileDepartment').value = user.department;
    document.getElementById('profileJoinDate').value = user.joinDate;
}

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const updates = {
        fullName: document.getElementById('profileFullName').value,
        email: document.getElementById('profileEmail').value
    };
    
    const newPassword = document.getElementById('profilePassword').value;
    if (newPassword) {
        updates.password = newPassword;
    }
    
    Storage.updateUser(currentUser.id, updates);
    
    // Update current session
    const updatedUser = Storage.getUserById(currentUser.id);
    Storage.setCurrentUser({
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        email: updatedUser.email,
        department: updatedUser.department
    });
    
    Utils.showSuccess('Profile updated successfully');
    loadUserInfo();
    
    // Clear password field
    document.getElementById('profilePassword').value = '';
});
