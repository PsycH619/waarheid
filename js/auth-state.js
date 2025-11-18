/**
 * Waarheid Marketing - Global Authentication State Manager
 * Manages authentication state across all pages
 */

(function() {
  'use strict';

  // ============================================
  // Authentication State
  // ============================================
  window.WaarheidAuth = {
    // Check if user is logged in
    isLoggedIn: function() {
      return !!localStorage.getItem('authToken');
    },

    // Check if user is admin
    isAdmin: function() {
      const userRole = localStorage.getItem('userRole');
      return userRole === 'admin';
    },

    // Get current user data
    getCurrentUser: function() {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    },

    // Get user email
    getUserEmail: function() {
      return localStorage.getItem('userEmail') || '';
    },

    // Logout
    logout: function() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      window.location.href = 'index.html';
    },

    // Initialize header authentication UI
    initHeader: function() {
      const header = document.querySelector('.header .container');
      if (!header) return;

      const navMenu = header.querySelector('.nav-menu');
      if (!navMenu) return;

      // Check if auth buttons already exist
      if (navMenu.querySelector('.auth-buttons') || navMenu.querySelector('.user-menu-header')) {
        return;
      }

      // Remove Book Consultation button from nav (we'll add it back conditionally)
      const bookBtn = navMenu.querySelector('.btn-book');
      if (bookBtn) bookBtn.remove();

      if (this.isLoggedIn()) {
        // Show user menu
        const userData = this.getCurrentUser();
        const firstName = userData?.firstName || this.getUserEmail().split('@')[0] || 'User';
        const isAdmin = this.isAdmin();

        const userMenuHTML = `
          <a href="booking.html" class="btn-book">Book Consultation</a>
          <div class="user-menu-header">
            <button class="user-menu-toggle-header" aria-label="User menu">
              <div class="user-avatar-header">
                ${isAdmin ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-user"></i>'}
              </div>
              <span class="user-name-header">${firstName}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown-header">
              ${isAdmin ? `
                <a href="admin-dashboard.html"><i class="fas fa-chart-line"></i> Admin Dashboard</a>
                <div class="dropdown-divider"></div>
              ` : `
                <a href="dashboard.html"><i class="fas fa-th-large"></i> My Dashboard</a>
                <div class="dropdown-divider"></div>
              `}
              <a href="#"><i class="fas fa-user-circle"></i> My Profile</a>
              <a href="#"><i class="fas fa-cog"></i> Settings</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="logout-btn-header"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
            </div>
          </div>
        `;

        navMenu.insertAdjacentHTML('beforeend', userMenuHTML);

        // Add event listeners
        this.attachUserMenuListeners();
      } else {
        // Show single account button
        const authButtonsHTML = `
          <a href="booking.html" class="btn-book">Book Consultation</a>
          <button class="btn-account" onclick="WaarheidAuth.openAuthModal()">
            <i class="fas fa-user"></i>
            Account
          </button>
        `;

        navMenu.insertAdjacentHTML('beforeend', authButtonsHTML);
      }
    },

    // Open authentication modal
    openAuthModal: function(mode = 'signin') {
      // Create modal if it doesn't exist
      let modal = document.getElementById('auth-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
          <div class="auth-modal-container">
            <button class="auth-modal-close" onclick="WaarheidAuth.closeAuthModal()">
              <i class="fas fa-times"></i>
            </button>

            <div class="auth-modal-tabs">
              <button class="auth-tab active" data-tab="signin" onclick="WaarheidAuth.switchAuthTab('signin')">
                Sign In
              </button>
              <button class="auth-tab" data-tab="signup" onclick="WaarheidAuth.switchAuthTab('signup')">
                Sign Up
              </button>
            </div>

            <!-- Sign In Form -->
            <div class="auth-form-container active" id="signin-container">
              <h2>Welcome Back</h2>
              <p class="auth-subtitle">Sign in to access your dashboard</p>

              <form id="modal-signin-form">
                <div class="form-group">
                  <label for="modal-signin-email">
                    <i class="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input type="email" id="modal-signin-email" required placeholder="your@email.com">
                </div>

                <div class="form-group">
                  <label for="modal-signin-password">
                    <i class="fas fa-lock"></i>
                    Password
                  </label>
                  <input type="password" id="modal-signin-password" required placeholder="Enter your password">
                </div>

                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" name="remember">
                    <span>Remember me</span>
                  </label>
                  <a href="#" class="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" class="btn-submit">
                  <i class="fas fa-sign-in-alt"></i>
                  Sign In
                </button>
              </form>

              <div class="auth-divider"><span>or continue with</span></div>

              <div class="social-auth">
                <button class="social-btn google">
                  <i class="fab fa-google"></i>
                  Google
                </button>
                <button class="social-btn microsoft">
                  <i class="fab fa-microsoft"></i>
                  Microsoft
                </button>
              </div>

              <div class="admin-login-link">
                <a href="admin-login.html"><i class="fas fa-crown"></i> Admin Login</a>
              </div>
            </div>

            <!-- Sign Up Form -->
            <div class="auth-form-container" id="signup-container">
              <h2>Create Account</h2>
              <p class="auth-subtitle">Join Waarheid Marketing today</p>

              <form id="modal-signup-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="modal-signup-firstname">
                      <i class="fas fa-user"></i>
                      First Name
                    </label>
                    <input type="text" id="modal-signup-firstname" required placeholder="John">
                  </div>

                  <div class="form-group">
                    <label for="modal-signup-lastname">
                      <i class="fas fa-user"></i>
                      Last Name
                    </label>
                    <input type="text" id="modal-signup-lastname" required placeholder="Doe">
                  </div>
                </div>

                <div class="form-group">
                  <label for="modal-signup-company">
                    <i class="fas fa-building"></i>
                    Company Name
                  </label>
                  <input type="text" id="modal-signup-company" placeholder="Your company (optional)">
                </div>

                <div class="form-group">
                  <label for="modal-signup-email">
                    <i class="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input type="email" id="modal-signup-email" required placeholder="your@email.com">
                </div>

                <div class="form-group">
                  <label for="modal-signup-password">
                    <i class="fas fa-lock"></i>
                    Password
                  </label>
                  <input type="password" id="modal-signup-password" required placeholder="Create a password" minlength="8">
                  <small class="form-hint">At least 8 characters</small>
                </div>

                <div class="form-group">
                  <label for="modal-signup-confirm">
                    <i class="fas fa-lock"></i>
                    Confirm Password
                  </label>
                  <input type="password" id="modal-signup-confirm" required placeholder="Confirm your password">
                </div>

                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" name="terms" required>
                    <span>I agree to the <a href="#" class="link">Terms of Service</a></span>
                  </label>
                </div>

                <button type="submit" class="btn-submit">
                  <i class="fas fa-user-plus"></i>
                  Create Account
                </button>
              </form>

              <div class="auth-divider"><span>or sign up with</span></div>

              <div class="social-auth">
                <button class="social-btn google">
                  <i class="fab fa-google"></i>
                  Google
                </button>
                <button class="social-btn microsoft">
                  <i class="fab fa-microsoft"></i>
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Attach form handlers
        this.attachModalFormHandlers();
      }

      // Switch to requested mode
      this.switchAuthTab(mode);

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    // Close authentication modal
    closeAuthModal: function() {
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    // Switch between sign in and sign up tabs
    switchAuthTab: function(tab) {
      const tabs = document.querySelectorAll('.auth-tab');
      const containers = document.querySelectorAll('.auth-form-container');

      tabs.forEach(t => {
        if (t.dataset.tab === tab) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      containers.forEach(c => {
        if (c.id === tab + '-container') {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    },

    // Attach form handlers for modal
    attachModalFormHandlers: function() {
      // Sign In Form
      const signinForm = document.getElementById('modal-signin-form');
      if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
          e.preventDefault();

          const email = document.getElementById('modal-signin-email').value;
          const password = document.getElementById('modal-signin-password').value;

          // Validate credentials against database
          if (typeof DataManager === 'undefined') {
            alert('Error: Database not initialized. Please refresh the page.');
            return;
          }

          const client = DataManager.clients.getByEmail(email);

          if (!client) {
            alert('Invalid email or password. Please try again.\n\nDemo accounts:\n- john@example.com / password123\n- sarah@example.com / password123\n- mike@example.com / password123');
            return;
          }

          if (client.password !== password) {
            alert('Invalid email or password. Please try again.');
            return;
          }

          // Successful login
          localStorage.setItem('authToken', 'client_token_' + Date.now());
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', 'client');
          localStorage.setItem('userData', JSON.stringify({
            clientId: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            company: client.company
          }));

          WaarheidAuth.closeAuthModal();
          window.location.href = 'dashboard.html';
        });
      }

      // Sign Up Form
      const signupForm = document.getElementById('modal-signup-form');
      if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
          e.preventDefault();

          const firstName = document.getElementById('modal-signup-firstname').value.trim();
          const lastName = document.getElementById('modal-signup-lastname').value.trim();
          const company = document.getElementById('modal-signup-company').value.trim();
          const email = document.getElementById('modal-signup-email').value.trim();
          const password = document.getElementById('modal-signup-password').value;
          const confirmPassword = document.getElementById('modal-signup-confirm').value;

          if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
          }

          if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
          }

          // Validate database is available
          if (typeof DataManager === 'undefined') {
            alert('Error: Database not initialized. Please refresh the page.');
            return;
          }

          // Check if email already exists
          const existingClient = DataManager.clients.getByEmail(email);
          if (existingClient) {
            alert('An account with this email already exists. Please sign in instead.');
            WaarheidAuth.switchAuthTab('signin');
            return;
          }

          // Create client in data manager
          const client = DataManager.clients.create({
            firstName,
            lastName,
            company,
            email,
            password: password
          });

          localStorage.setItem('userData', JSON.stringify({
            clientId: client.id,
            firstName,
            lastName,
            company,
            email,
            createdAt: new Date().toISOString()
          }));

          localStorage.setItem('authToken', 'demo_token_' + Date.now());
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', 'client');

          WaarheidAuth.closeAuthModal();
          window.location.href = 'dashboard.html';
        });
      }

      // Social auth buttons (demo)
      document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          alert('Social authentication is not available in demo mode.');
        });
      });
    },

    // Attach user menu event listeners
    attachUserMenuListeners: function() {
      const userMenuToggle = document.querySelector('.user-menu-toggle-header');
      const userMenu = document.querySelector('.user-menu-header');
      const logoutBtn = document.querySelector('.logout-btn-header');

      if (userMenuToggle && userMenu) {
        userMenuToggle.addEventListener('click', function(e) {
          e.stopPropagation();
          userMenu.classList.toggle('active');
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
          if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          WaarheidAuth.logout();
        });
      }
    }
  };

  // ============================================
  // Initialize on DOM ready
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      WaarheidAuth.initHeader();
    });
  } else {
    WaarheidAuth.initHeader();
  }

})();
