/**
 * STORAGE.JS - LocalStorage Management Module
 * Centralized data storage and retrieval for the Office Automation System
 */

const Storage = {
    // Storage Keys
    KEYS: {
        USERS: 'office_users',
        ATTENDANCE: 'office_attendance',
        TASKS: 'office_tasks',
        SALARIES: 'office_salaries',
        MESSAGES: 'office_messages',
        LEAVE_REQUESTS: 'office_leave_requests',
        CURRENT_USER: 'office_current_user',
        THEME: 'office_theme'
    },

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    /**
     * Clear all application data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            if (key !== this.KEYS.THEME) {
                this.remove(key);
            }
        });
    },

    // ========== USER MANAGEMENT ==========

    /**
     * Get all users
     * @returns {Array} Array of user objects
     */
    getUsers() {
        return this.get(this.KEYS.USERS) || [];
    },

    /**
     * Save users
     * @param {Array} users - Array of user objects
     */
    setUsers(users) {
        this.set(this.KEYS.USERS, users);
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User object or null
     */
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId) || null;
    },

    /**
     * Get user by username
     * @param {string} username - Username
     * @returns {Object|null} User object or null
     */
    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(u => u.username === username) || null;
    },

    /**
     * Add new user
     * @param {Object} user - User object
     * @returns {Object} Created user
     */
    addUser(user) {
        const users = this.getUsers();
        const newUser = {
            id: 'user_' + Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.setUsers(users);
        return newUser;
    },

    /**
     * Update user
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated user or null
     */
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.setUsers(users);
            return users[index];
        }
        return null;
    },

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {boolean} Success status
     */
    deleteUser(userId) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== userId);
        if (filtered.length !== users.length) {
            this.setUsers(filtered);
            return true;
        }
        return false;
    },

    // ========== ATTENDANCE MANAGEMENT ==========

    /**
     * Get all attendance records
     * @returns {Array} Array of attendance objects
     */
    getAttendance() {
        return this.get(this.KEYS.ATTENDANCE) || [];
    },

    /**
     * Save attendance records
     * @param {Array} attendance - Array of attendance objects
     */
    setAttendance(attendance) {
        this.set(this.KEYS.ATTENDANCE, attendance);
    },

    /**
     * Add attendance record
     * @param {Object} record - Attendance record
     * @returns {Object} Created record
     */
    addAttendance(record) {
        const attendance = this.getAttendance();
        const newRecord = {
            id: 'att_' + Date.now(),
            ...record,
            createdAt: new Date().toISOString()
        };
        attendance.push(newRecord);
        this.setAttendance(attendance);
        return newRecord;
    },

    /**
     * Get attendance for user and date
     * @param {string} userId - User ID
     * @param {string} date - Date (YYYY-MM-DD)
     * @returns {Object|null} Attendance record or null
     */
    getAttendanceByUserAndDate(userId, date) {
        const attendance = this.getAttendance();
        return attendance.find(a => a.userId === userId && a.date === date) || null;
    },

    /**
     * Get attendance for user and month
     * @param {string} userId - User ID
     * @param {string} month - Month (YYYY-MM)
     * @returns {Array} Array of attendance records
     */
    getAttendanceByMonth(userId, month) {
        const attendance = this.getAttendance();
        return attendance.filter(a => 
            a.userId === userId && a.date.startsWith(month)
        );
    },

    // ========== TASK MANAGEMENT ==========

    /**
     * Get all tasks
     * @returns {Array} Array of task objects
     */
    getTasks() {
        return this.get(this.KEYS.TASKS) || [];
    },

    /**
     * Save tasks
     * @param {Array} tasks - Array of task objects
     */
    setTasks(tasks) {
        this.set(this.KEYS.TASKS, tasks);
    },

    /**
     * Add task
     * @param {Object} task - Task object
     * @returns {Object} Created task
     */
    addTask(task) {
        const tasks = this.getTasks();
        const newTask = {
            id: 'task_' + Date.now(),
            ...task,
            createdAt: new Date().toISOString(),
            status: task.status || 'not_started'
        };
        tasks.push(newTask);
        this.setTasks(tasks);
        return newTask;
    },

    /**
     * Update task
     * @param {string} taskId - Task ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated task or null
     */
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.setTasks(tasks);
            return tasks[index];
        }
        return null;
    },

    /**
     * Get tasks by assignee
     * @param {string} userId - User ID
     * @returns {Array} Array of tasks
     */
    getTasksByAssignee(userId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.assigneeId === userId);
    },

    /**
     * Get tasks by assigner
     * @param {string} userId - User ID
     * @returns {Array} Array of tasks
     */
    getTasksByAssigner(userId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.assignerId === userId);
    },

    // ========== SALARY MANAGEMENT ==========

    /**
     * Get all salaries
     * @returns {Array} Array of salary objects
     */
    getSalaries() {
        return this.get(this.KEYS.SALARIES) || [];
    },

    /**
     * Save salaries
     * @param {Array} salaries - Array of salary objects
     */
    setSalaries(salaries) {
        this.set(this.KEYS.SALARIES, salaries);
    },

    /**
     * Add salary
     * @param {Object} salary - Salary object
     * @returns {Object} Created salary
     */
    addSalary(salary) {
        const salaries = this.getSalaries();
        const newSalary = {
            id: 'sal_' + Date.now(),
            ...salary,
            createdAt: new Date().toISOString()
        };
        salaries.push(newSalary);
        this.setSalaries(salaries);
        return newSalary;
    },

    /**
     * Get salary by user and month
     * @param {string} userId - User ID
     * @param {string} month - Month (YYYY-MM)
     * @returns {Object|null} Salary object or null
     */
    getSalaryByUserAndMonth(userId, month) {
        const salaries = this.getSalaries();
        return salaries.find(s => s.userId === userId && s.month === month) || null;
    },

    // ========== MESSAGES MANAGEMENT ==========

    /**
     * Get all messages
     * @returns {Array} Array of message objects
     */
    getMessages() {
        return this.get(this.KEYS.MESSAGES) || [];
    },

    /**
     * Save messages
     * @param {Array} messages - Array of message objects
     */
    setMessages(messages) {
        this.set(this.KEYS.MESSAGES, messages);
    },

    /**
     * Add message
     * @param {Object} message - Message object
     * @returns {Object} Created message
     */
    addMessage(message) {
        const messages = this.getMessages();
        const newMessage = {
            id: 'msg_' + Date.now(),
            ...message,
            timestamp: new Date().toISOString()
        };
        messages.push(newMessage);
        this.setMessages(messages);
        return newMessage;
    },

    /**
     * Get messages between two users
     * @param {string} user1Id - First user ID
     * @param {string} user2Id - Second user ID
     * @returns {Array} Array of messages
     */
    getMessagesBetweenUsers(user1Id, user2Id) {
        const messages = this.getMessages();
        return messages.filter(m => 
            (m.senderId === user1Id && m.receiverId === user2Id) ||
            (m.senderId === user2Id && m.receiverId === user1Id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // ========== LEAVE REQUESTS MANAGEMENT ==========

    /**
     * Get all leave requests
     * @returns {Array} Array of leave request objects
     */
    getLeaveRequests() {
        return this.get(this.KEYS.LEAVE_REQUESTS) || [];
    },

    /**
     * Save leave requests
     * @param {Array} requests - Array of leave request objects
     */
    setLeaveRequests(requests) {
        this.set(this.KEYS.LEAVE_REQUESTS, requests);
    },

    /**
     * Add leave request
     * @param {Object} request - Leave request object
     * @returns {Object} Created request
     */
    addLeaveRequest(request) {
        const requests = this.getLeaveRequests();
        const newRequest = {
            id: 'leave_' + Date.now(),
            ...request,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        requests.push(newRequest);
        this.setLeaveRequests(requests);
        return newRequest;
    },

    /**
     * Update leave request
     * @param {string} requestId - Request ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated request or null
     */
    updateLeaveRequest(requestId, updates) {
        const requests = this.getLeaveRequests();
        const index = requests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...updates };
            this.setLeaveRequests(requests);
            return requests[index];
        }
        return null;
    },

    // ========== CURRENT USER SESSION ==========

    /**
     * Get current logged-in user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.get(this.KEYS.CURRENT_USER);
    },

    /**
     * Set current logged-in user
     * @param {Object} user - User object
     */
    setCurrentUser(user) {
        this.set(this.KEYS.CURRENT_USER, user);
    },

    /**
     * Clear current user session
     */
    clearCurrentUser() {
        this.remove(this.KEYS.CURRENT_USER);
    }
};
