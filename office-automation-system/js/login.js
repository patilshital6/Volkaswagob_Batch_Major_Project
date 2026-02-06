/**
 * LOGIN.JS - Login Page Logic
 */

// Redirect if already logged in
if (Auth.isAuthenticated()) {
    const user = Auth.getCurrentUser();
    Auth.redirectToDashboard(user);
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Clear previous errors
    errorElement.classList.remove('active');
    errorElement.textContent = '';
    
    // Validate inputs
    if (!username || !password) {
        Utils.showError('loginError', 'Please enter both username and password');
        return;
    }
    
    // Attempt login
    const result = Auth.login(username, password);
    
    if (result.error) {
        Utils.showError('loginError', result.error);
    } else {
        // Successful login - redirect to dashboard
        Auth.redirectToDashboard(result);
    }
});

// Fill credentials helper function
function fillCredentials(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

// Add enter key support for credential cards
document.querySelectorAll('.credential-card').forEach(card => {
    card.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.click();
        }
    });
    card.setAttribute('tabindex', '0');
});
