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
        // Show sign in/sign up buttons
        const authButtonsHTML = `
          <a href="booking.html" class="btn-book">Book Consultation</a>
          <div class="auth-buttons">
            <a href="signin.html" class="btn-signin">Sign In</a>
            <a href="signup.html" class="btn-signup">Sign Up</a>
          </div>
        `;

        navMenu.insertAdjacentHTML('beforeend', authButtonsHTML);
      }
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
