/**
 * MANAGER-DASHBOARD.JS - Manager Dashboard Logic
 */

// Protect page - only managers can access
Auth.protectPage('manager');

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
            case 'team':
                loadTeamPage();
                break;
            case 'attendance':
                loadAttendancePage();
                break;
            case 'leave':
                loadLeavePage();
                break;
            case 'chat':
                loadChatPage();
                break;
        }
    }
}

/**
 * Get team members
 */
function getTeamMembers() {
    const users = Storage.getUsers();
    return users.filter(u => u.managerId === currentUser.id);
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const teamMembers = getTeamMembers();
    const leaveRequests = Storage.getLeaveRequests();
    const attendance = Storage.getAttendance();
    
    document.getElementById('teamCount').textContent = teamMembers.length;
    
    const today = Utils.getCurrentDate();
    const presentToday = attendance.filter(a => 
        a.date === today && a.status === 'present' && teamMembers.find(t => t.id === a.userId)
    ).length;
    document.getElementById('presentToday').textContent = presentToday;
    
    const pendingLeaveRequests = leaveRequests.filter(r => 
        r.managerId === currentUser.id && r.status === 'pending'
    ).length;
    document.getElementById('leaveRequests').textContent = pendingLeaveRequests;
    
    const totalTeamSalary = teamMembers.reduce((sum, member) => sum + (member.baseSalary || 0), 0);
    document.getElementById('teamSalary').textContent = Utils.formatCurrency(totalTeamSalary);
}

/**
 * Load dashboard page
 */
function loadDashboardPage() {
    loadDashboardStats();
    loadManagerAttendanceToday();
    loadTeamOverview();
    loadRecentAttendance();
}

/**
 * Load manager's attendance today
 */
function loadManagerAttendanceToday() {
    const today = Utils.getCurrentDate();
    const attendance = Storage.getAttendanceByUserAndDate(currentUser.id, today);
    
    const checkInBtn = document.getElementById('managerCheckInBtn');
    const checkOutBtn = document.getElementById('managerCheckOutBtn');
    const statusDiv = document.getElementById('managerAttendanceStatus');
    
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
 * Mark manager's own attendance
 */
function markMyAttendance(type) {
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
    
    loadManagerAttendanceToday();
    loadDashboardStats();
}

/**
 * Load team overview
 */
function loadTeamOverview() {
    const teamMembers = getTeamMembers();
    const container = document.getElementById('teamOverview');
    
    if (teamMembers.length === 0) {
        container.innerHTML = '<p class="text-muted">No team members assigned</p>';
        return;
    }
    
    container.innerHTML = teamMembers.slice(0, 5).map(member => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${member.fullName}</div>
                <div class="list-item-subtitle">${member.department}</div>
            </div>
            <span class="role-badge ${member.role}">${member.role}</span>
        </div>
    `).join('');
}

/**
 * Load recent attendance
 */
function loadRecentAttendance() {
    const teamMembers = getTeamMembers();
    const teamIds = teamMembers.map(m => m.id);
    const today = Utils.getCurrentDate();
    
    const attendance = Storage.getAttendance()
        .filter(a => a.date === today && teamIds.includes(a.userId))
        .slice(0, 5);
    
    const container = document.getElementById('recentAttendance');
    
    if (attendance.length === 0) {
        container.innerHTML = '<p class="text-muted">No attendance records for today</p>';
        return;
    }
    
    container.innerHTML = attendance.map(att => {
        const user = teamMembers.find(u => u.id === att.userId);
        return `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${user ? user.fullName : 'Unknown'}</div>
                    <div class="list-item-subtitle">${att.checkIn || '-'}</div>
                </div>
                ${Utils.getStatusBadge(att.status)}
            </div>
        `;
    }).join('');
}

/**
 * Load tasks page
 */
function loadTasksPage() {
    const tasks = Storage.getTasks().filter(t => t.assignerId === currentUser.id);
    renderTasksTable(tasks);
    
    const filterSelect = document.getElementById('taskStatusFilter');
    filterSelect.addEventListener('change', function() {
        const filtered = this.value ? 
            tasks.filter(t => t.status === this.value) : tasks;
        renderTasksTable(filtered);
    });
}

/**
 * Render tasks table
 */
function renderTasksTable(tasks) {
    const container = document.getElementById('tasksTable');
    const users = Storage.getUsers();
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No tasks found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    return `
                        <tr>
                            <td>
                                <strong>${task.title}</strong>
                                <div class="text-small text-muted">${task.description}</div>
                            </td>
                            <td>${assignee ? assignee.fullName : 'Unknown'}</td>
                            <td>${Utils.getPriorityBadge(task.priority)}</td>
                            <td>${Utils.getStatusBadge(task.status)}</td>
                            <td>${Utils.formatDate(task.deadline)}</td>
                            <td>${task.remarks || '-'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Open task modal
 */
function openTaskModal() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const assigneeSelect = document.getElementById('taskAssignee');
    
    form.reset();
    
    const teamMembers = getTeamMembers();
    assigneeSelect.innerHTML = teamMembers.map(member => 
        `<option value="${member.id}">${member.fullName}</option>`
    ).join('');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('taskDeadline').value = tomorrow.toISOString().split('T')[0];
    
    modal.classList.add('active');
}

/**
 * Close task modal
 */
function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

// Task form submission

/**
 * Load team page
 */
function loadTeamPage() {
    const teamMembers = getTeamMembers();
    renderTeamTable(teamMembers);
    
    const searchInput = document.getElementById('teamSearch');
    searchInput.addEventListener('input', Utils.debounce(function() {
        const filtered = Utils.filterBySearch(teamMembers, this.value, ['fullName', 'email', 'department']);
        renderTeamTable(filtered);
    }, 300));
}

/**
 * Render team table
 */
function renderTeamTable(members) {
    const container = document.getElementById('teamTable');
    
    if (members.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No team members assigned yet. Click "+ Assign Employee to Team" to add members.</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Join Date</th>
                    <th>Base Salary</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${members.map(member => `
                    <tr>
                        <td>${member.fullName}</td>
                        <td>${member.email}</td>
                        <td>${member.department}</td>
                        <td>${Utils.formatDate(member.joinDate)}</td>
                        <td>${Utils.formatCurrency(member.baseSalary)}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="removeFromTeam('${member.id}')">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Open assign employee modal
 */
function openAssignEmployeeModal() {
    const modal = document.getElementById('assignEmployeeModal');
    const form = document.getElementById('assignEmployeeForm');
    const select = document.getElementById('employeeToAssign');
    
    form.reset();
    
    // Get all employees who are not yet in this manager's team
    const allUsers = Storage.getUsers();
    const teamMemberIds = getTeamMembers().map(m => m.id);
    const availableEmployees = allUsers.filter(u => 
        u.role === 'employee' && !teamMemberIds.includes(u.id)
    );
    
    if (availableEmployees.length === 0) {
        alert('No available employees to assign. All employees are already in teams or no employees exist.');
        return;
    }
    
    select.innerHTML = availableEmployees.map(emp => 
        `<option value="${emp.id}">${emp.fullName} (${emp.department})</option>`
    ).join('');
    
    modal.classList.add('active');
}

/**
 * Close assign employee modal
 */
function closeAssignEmployeeModal() {
    document.getElementById('assignEmployeeModal').classList.remove('active');
}

/**
 * Remove employee from team
 */
function removeFromTeam(employeeId) {
    if (confirm('Are you sure you want to remove this employee from your team?')) {
        Storage.updateUser(employeeId, { managerId: null });
        Utils.showSuccess('Employee removed from team');
        loadTeamPage();
        loadDashboardStats();
    }
}

// Assign employee form submission
document.getElementById('assignEmployeeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeToAssign').value;
    
    // Assign this employee to current manager
    Storage.updateUser(employeeId, { managerId: currentUser.id });
    
    Utils.showSuccess('Employee assigned to your team successfully');
    closeAssignEmployeeModal();
    loadTeamPage();
    loadDashboardStats();
});

/**
 * Load attendance page
 */
function loadAttendancePage() {
    const monthInput = document.getElementById('attendanceMonth');
    const myMonthInput = document.getElementById('myAttendanceMonth');
    
    monthInput.value = Utils.getCurrentMonth();
    myMonthInput.value = Utils.getCurrentMonth();
    
    loadMyAttendanceTable();
    loadAttendanceTable();
    
    monthInput.addEventListener('change', loadAttendanceTable);
    myMonthInput.addEventListener('change', loadMyAttendanceTable);
}

/**
 * Load manager's own attendance table
 */
function loadMyAttendanceTable() {
    const month = document.getElementById('myAttendanceMonth').value;
    const attendance = Storage.getAttendanceByMonth(currentUser.id, month);
    
    const container = document.getElementById('myAttendanceTable');
    
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
}

/**
 * Load attendance table
 */
function loadAttendanceTable() {
    const month = document.getElementById('attendanceMonth').value;
    const teamMembers = getTeamMembers();
    const teamMemberIds = teamMembers.map(m => m.id);
    
    let attendance = Storage.getAttendance().filter(a => 
        teamMemberIds.includes(a.userId) && a.date.startsWith(month)
    );
    
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
                    const user = teamMembers.find(u => u.id === att.userId);
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
 * Open attendance modal
 */
function openAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    const form = document.getElementById('attendanceForm');
    const employeeSelect = document.getElementById('attendanceEmployee');
    
    form.reset();
    
    const teamMembers = getTeamMembers();
    employeeSelect.innerHTML = teamMembers.map(member => 
        `<option value="${member.id}">${member.fullName}</option>`
    ).join('');
    
    document.getElementById('attendanceDate').value = Utils.getCurrentDate();
    
    modal.classList.add('active');
}

/**
 * Close attendance modal
 */
function closeAttendanceModal() {
    document.getElementById('attendanceModal').classList.remove('active');
}

// Attendance form submission
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('attendanceEmployee').value;
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;
    
    const existing = Storage.getAttendanceByUserAndDate(userId, date);
    if (existing) {
        alert('Attendance already marked for this employee on this date');
        return;
    }
    
    Storage.addAttendance({
        userId: userId,
        date: date,
        status: status,
        checkIn: status !== 'absent' ? '09:00' : null,
        checkOut: status === 'present' ? '18:00' : (status === 'half_day' ? '13:00' : null)
    });
    
    Utils.showSuccess('Attendance marked successfully');
    closeAttendanceModal();
    loadAttendanceTable();
});

/**
 * Load leave page
 */
function loadLeavePage() {
    const leaveRequests = Storage.getLeaveRequests().filter(r => 
        r.managerId === currentUser.id
    );
    
    renderLeaveTable(leaveRequests);
}

/**
 * Render leave table
 */
function renderLeaveTable(requests) {
    const container = document.getElementById('leaveTable');
    const users = Storage.getUsers();
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No leave requests</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => {
                    const user = users.find(u => u.id === request.userId);
                    return `
                        <tr>
                            <td>${user ? user.fullName : 'Unknown'}</td>
                            <td>${Utils.formatDate(request.fromDate)}</td>
                            <td>${Utils.formatDate(request.toDate)}</td>
                            <td>${request.reason}</td>
                            <td>${Utils.getStatusBadge(request.status)}</td>
                            <td>
                                ${request.status === 'pending' ? `
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
