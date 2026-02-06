/**
 * UTILS.JS - Utility Functions
 * Common helper functions used across the application
 */

const Utils = {
    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format date and time
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date and time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format time only
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted time
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get current date in YYYY-MM-DD format
     * @returns {string} Current date
     */
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Get current month in YYYY-MM format
     * @returns {string} Current month
     */
    getCurrentMonth() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    },

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    },

    /**
     * Get status badge HTML
     * @param {string} status - Status value
     * @returns {string} HTML string
     */
    getStatusBadge(status) {
        const statusMap = {
            'present': { class: 'badge-success', text: 'Present' },
            'absent': { class: 'badge-danger', text: 'Absent' },
            'half_day': { class: 'badge-warning', text: 'Half Day' },
            'not_started': { class: 'badge-danger', text: 'Not Started' },
            'pending': { class: 'badge-warning', text: 'Pending' },
            'completed': { class: 'badge-success', text: 'Completed' },
            'approved': { class: 'badge-success', text: 'Approved' },
            'rejected': { class: 'badge-danger', text: 'Rejected' }
        };

        const config = statusMap[status] || { class: 'badge-info', text: status };
        return `<span class="badge ${config.class}">${config.text}</span>`;
    },

    /**
     * Get priority badge HTML
     * @param {string} priority - Priority value
     * @returns {string} HTML string
     */
    getPriorityBadge(priority) {
        const priorityMap = {
            'low': { class: 'badge-info', text: 'Low' },
            'medium': { class: 'badge-warning', text: 'Medium' },
            'high': { class: 'badge-danger', text: 'High' }
        };

        const config = priorityMap[priority] || { class: 'badge-info', text: priority };
        return `<span class="badge ${config.class}">${config.text}</span>`;
    },

    /**
     * Calculate attendance percentage
     * @param {Array} attendanceRecords - Attendance records
     * @returns {number} Percentage
     */
    calculateAttendancePercentage(attendanceRecords) {
        if (attendanceRecords.length === 0) return 0;

        const presentDays = attendanceRecords.filter(a => 
            a.status === 'present' || a.status === 'half_day'
        ).length;

        return Math.round((presentDays / attendanceRecords.length) * 100);
    },

    /**
     * Get days in month
     * @param {string} month - Month in YYYY-MM format
     * @returns {number} Number of days
     */
    getDaysInMonth(month) {
        const [year, monthNum] = month.split('-').map(Number);
        return new Date(year, monthNum, 0).getDate();
    },

    /**
     * Calculate working days in month (excluding Sundays)
     * @param {string} month - Month in YYYY-MM format
     * @returns {number} Number of working days
     */
    getWorkingDaysInMonth(month) {
        const [year, monthNum] = month.split('-').map(Number);
        const daysInMonth = this.getDaysInMonth(month);
        let workingDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthNum - 1, day);
            if (date.getDay() !== 0) { // Not Sunday
                workingDays++;
            }
        }

        return workingDays;
    },

    /**
     * Show error message
     * @param {string} elementId - Element ID
     * @param {string} message - Error message
     */
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('active');
            
            setTimeout(() => {
                element.classList.remove('active');
            }, 5000);
        }
    },

    /**
     * Show success message (using alert for now, can be enhanced)
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Create a temporary success message element
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.zIndex = '9999';
        successDiv.style.animation = 'slideInRight 0.3s ease-out';
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Get user initials
     * @param {string} fullName - Full name
     * @returns {string} Initials
     */
    getInitials(fullName) {
        return fullName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substr(0, 2);
    },

    /**
     * Filter array by search term
     * @param {Array} array - Array to filter
     * @param {string} searchTerm - Search term
     * @param {Array} searchFields - Fields to search in
     * @returns {Array} Filtered array
     */
    filterBySearch(array, searchTerm, searchFields) {
        if (!searchTerm) return array;

        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return searchFields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    },

    /**
     * Get nested object value by path
     * @param {Object} obj - Object
     * @param {string} path - Path (e.g., 'user.name')
     * @returns {any} Value
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    },

    /**
     * Sort array by field
     * @param {Array} array - Array to sort
     * @param {string} field - Field to sort by
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array} Sorted array
     */
    sortBy(array, field, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
};

/**
 * Dark mode toggle function
 */
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    Storage.set(Storage.KEYS.THEME, newTheme);
}

// Initialize theme on page load
(function initializeTheme() {
    const savedTheme = Storage.get(Storage.KEYS.THEME);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
})();
