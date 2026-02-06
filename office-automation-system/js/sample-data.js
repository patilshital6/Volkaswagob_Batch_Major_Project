/**
 * SAMPLE-DATA.JS - Initialize Sample Data
 * Creates initial users and sample data if not exists
 * 
 * DISABLED BY DEFAULT - To enable sample data, uncomment the function call at the bottom
 */

function initializeSampleData() {
    // Check if users already exist
    const existingUsers = Storage.getUsers();
    
    if (existingUsers.length === 0) {
        console.log('Initializing sample data...');
        
        // Create sample users
        const users = [
            {
                id: 'user_admin',
                username: 'admin',
                password: 'admin123',
                fullName: 'Admin User',
                email: 'admin@officehub.com',
                role: 'admin',
                department: 'Administration',
                baseSalary: 80000,
                joinDate: '2023-01-01',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_manager1',
                username: 'manager1',
                password: 'manager123',
                fullName: 'Sarah Johnson',
                email: 'sarah.johnson@officehub.com',
                role: 'manager',
                department: 'Engineering',
                baseSalary: 60000,
                joinDate: '2023-02-15',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_manager2',
                username: 'manager2',
                password: 'manager123',
                fullName: 'Michael Chen',
                email: 'michael.chen@officehub.com',
                role: 'manager',
                department: 'Marketing',
                baseSalary: 58000,
                joinDate: '2023-03-01',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_emp1',
                username: 'emp1',
                password: 'emp123',
                fullName: 'John Smith',
                email: 'john.smith@officehub.com',
                role: 'employee',
                department: 'Engineering',
                baseSalary: 45000,
                joinDate: '2023-04-10',
                managerId: 'user_manager1',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_emp2',
                username: 'emp2',
                password: 'emp123',
                fullName: 'Emma Wilson',
                email: 'emma.wilson@officehub.com',
                role: 'employee',
                department: 'Engineering',
                baseSalary: 42000,
                joinDate: '2023-05-20',
                managerId: 'user_manager1',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_emp3',
                username: 'emp3',
                password: 'emp123',
                fullName: 'David Brown',
                email: 'david.brown@officehub.com',
                role: 'employee',
                department: 'Marketing',
                baseSalary: 40000,
                joinDate: '2023-06-01',
                managerId: 'user_manager2',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_emp4',
                username: 'emp4',
                password: 'emp123',
                fullName: 'Lisa Anderson',
                email: 'lisa.anderson@officehub.com',
                role: 'employee',
                department: 'Marketing',
                baseSalary: 41000,
                joinDate: '2023-07-15',
                managerId: 'user_manager2',
                createdAt: new Date().toISOString()
            }
        ];
        
        Storage.setUsers(users);
        console.log('Sample users created:', users.length);
        
        // Create sample attendance records for current month
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const attendanceRecords = [];
        
        // Create attendance for the last 15 days
        for (let day = 1; day <= 15; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            
            users.forEach(user => {
                if (user.role === 'employee' || user.role === 'manager') {
                    // Random attendance status
                    const rand = Math.random();
                    let status = 'present';
                    if (rand > 0.95) status = 'absent';
                    else if (rand > 0.90) status = 'half_day';
                    
                    attendanceRecords.push({
                        id: `att_${user.id}_${dateStr}`,
                        userId: user.id,
                        date: dateStr,
                        status: status,
                        checkIn: status !== 'absent' ? '09:00' : null,
                        checkOut: status === 'present' ? '18:00' : (status === 'half_day' ? '13:00' : null),
                        createdAt: new Date().toISOString()
                    });
                }
            });
        }
        
        Storage.setAttendance(attendanceRecords);
        console.log('Sample attendance created:', attendanceRecords.length);
        
        console.log('Sample data initialization complete!');
        const messages = [
            {
                id: 'msg_1',
                senderId: 'user_manager1',
                receiverId: 'user_emp1',
                content: 'Hey John, how is the authentication module coming along?',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'msg_2',
                senderId: 'user_emp1',
                receiverId: 'user_manager1',
                content: 'Hi Sarah, it\'s going well! I\'ve completed the login functionality and working on role-based access now.',
                timestamp: new Date(Date.now() - 3000000).toISOString()
            },
            {
                id: 'msg_3',
                senderId: 'user_manager1',
                receiverId: 'user_emp1',
                content: 'Great! Let me know if you need any help.',
                timestamp: new Date(Date.now() - 2400000).toISOString()
            },
            {
                id: 'msg_4',
                senderId: 'user_admin',
                receiverId: 'user_manager1',
                content: 'Sarah, please review the team\'s performance for this month.',
                timestamp: new Date(Date.now() - 7200000).toISOString()
            }
        ];
        
        Storage.setMessages(messages);
        console.log('Sample messages created:', messages.length);
        
        console.log('Sample data initialization complete!');
    } else {
        console.log('Sample data already exists. Skipping initialization.');
    }
}

// SAMPLE DATA IS DISABLED BY DEFAULT
// To enable sample data, uncomment the line below:
// initializeSampleData();

/**
 * Initialize first admin user if no users exist
 * This runs automatically to ensure you can login for the first time
 */
(function initializeFirstAdmin() {
    const existingUsers = Storage.getUsers();
    
    if (existingUsers.length === 0) {
        console.log('Creating initial admin user...');
        
        const admin = {
            id: 'user_admin_' + Date.now(),
            username: 'admin',
            password: 'admin123',
            fullName: 'System Administrator',
            email: 'admin@officehub.com',
            role: 'admin',
            department: 'Administration',
            baseSalary: 80000,
            joinDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        Storage.setUsers([admin]);
        console.log('Initial admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('You can now create more users from the admin dashboard.');
    }
})();
