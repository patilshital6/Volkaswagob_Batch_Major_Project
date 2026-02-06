/**
 * AUTH.JS - Authentication Module
 * Handles user authentication and authorization
 */

const Auth = {
    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Object|null} User object if successful, null otherwise
     */
    login(username, password) {
        const user = Storage.getUserByUsername(username);
        
        if (!user) {
            return { error: 'User not found' };
        }
        
        if (user.password !== password) {
            return { error: 'Invalid password' };
        }
        
        // Set current user session
        Storage.setCurrentUser({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            department: user.department
        });
        
        return user;
    },

    /**
     * Logout current user
     */
    logout() {
        Storage.clearCurrentUser();
        window.location.href = 'index.html';
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return Storage.getCurrentUser() !== null;
    },

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return Storage.getCurrentUser();
    },

    /**
     * Check if current user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    /**
     * Redirect to appropriate dashboard based on role
     * @param {Object} user - User object
     */
    redirectToDashboard(user) {
        switch (user.role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'manager':
                window.location.href = 'manager-dashboard.html';
                break;
            case 'employee':
                window.location.href = 'employee-dashboard.html';
                break;
            default:
                console.error('Unknown role:', user.role);
        }
    },

    /**
     * Protect page - redirect if not authenticated
     * @param {string|Array} requiredRole - Required role(s) to access page
     */
    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }

        if (requiredRole) {
            const user = this.getCurrentUser();
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            
            if (!roles.includes(user.role)) {
                // Redirect to appropriate dashboard
                this.redirectToDashboard(user);
                return false;
            }
        }

        return true;
    },

    /**
     * Change password for current user
     * @param {string} newPassword - New password
     * @returns {boolean} Success status
     */
    changePassword(newPassword) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const updated = Storage.updateUser(user.id, { password: newPassword });
        return !!updated;
    }
};

// Global logout function
function logout() {
    Auth.logout();
}
