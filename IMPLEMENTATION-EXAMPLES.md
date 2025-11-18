# Implementation Examples for Profile/Settings & RBAC

## 1. Implementing Profile Page

### Create: `/home/user/waarheid/profile.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Profile - Waarheid Marketing</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/dashboard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- Reuse dashboard header from dashboard.html -->
  <!-- Can inherit from dashboard-init.js or create template -->
  
  <div class="dashboard-container">
    <aside class="dashboard-sidebar">
      <!-- Simplified sidebar for profile page -->
    </aside>
    
    <main class="dashboard-main">
      <div class="profile-section">
        <h1>My Profile</h1>
        
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="profile-name">
              <h2 id="profile-full-name">John Smith</h2>
              <p id="profile-email">john@example.com</p>
            </div>
          </div>
          
          <form id="profile-form">
            <div class="form-group">
              <label for="first-name">First Name</label>
              <input type="text" id="first-name" required>
            </div>
            
            <div class="form-group">
              <label for="last-name">Last Name</label>
              <input type="text" id="last-name" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" disabled>
            </div>
            
            <div class="form-group">
              <label for="company">Company Name</label>
              <input type="text" id="company">
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone">
            </div>
            
            <button type="submit" class="btn-primary">Save Changes</button>
            <button type="button" class="btn-secondary" onclick="window.history.back()">Cancel</button>
          </form>
        </div>
      </div>
    </main>
  </div>
  
  <script src="js/data-manager.js"></script>
  <script src="js/auth-state.js"></script>
  <script src="js/profile.js"></script>
</body>
</html>
```

### Create: `/home/user/waarheid/js/profile.js`

```javascript
/**
 * Profile Management
 */

document.addEventListener('DOMContentLoaded', function() {
  // Authentication check
  if (!WaarheidAuth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Load current user data
  const currentUser = WaarheidAuth.getCurrentUser();
  const userEmail = WaarheidAuth.getUserEmail();
  
  // Populate form fields
  function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-full-name').textContent = 
      `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profile-email').textContent = userEmail;
    
    document.getElementById('first-name').value = currentUser.firstName || '';
    document.getElementById('last-name').value = currentUser.lastName || '';
    document.getElementById('email').value = userEmail || '';
    document.getElementById('company').value = currentUser.company || '';
    document.getElementById('phone').value = currentUser.phone || '';
  }
  
  loadProfile();
  
  // Handle form submission
  document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const updatedData = {
      ...currentUser,
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      company: document.getElementById('company').value,
      phone: document.getElementById('phone').value
    };
    
    // Update in localStorage
    localStorage.setItem('userData', JSON.stringify(updatedData));
    
    // Update in DataManager if clientId exists
    if (currentUser.clientId) {
      DataManager.clients.update(currentUser.clientId, updatedData);
    }
    
    alert('Profile updated successfully!');
    window.location.href = 'dashboard.html';
  });
});
```

---

## 2. Implementing Settings Page

### Create: `/home/user/waarheid/settings.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings - Waarheid Marketing</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/dashboard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div class="dashboard-container">
    <aside class="dashboard-sidebar">
      <!-- Settings navigation -->
      <nav class="settings-nav">
        <a href="#" class="settings-link active" data-section="general">
          <i class="fas fa-cog"></i> General Settings
        </a>
        <a href="#" class="settings-link" data-section="notifications">
          <i class="fas fa-bell"></i> Notifications
        </a>
        <a href="#" class="settings-link" data-section="security">
          <i class="fas fa-lock"></i> Security
        </a>
        <a href="#" class="settings-link" data-section="billing">
          <i class="fas fa-credit-card"></i> Billing
        </a>
      </nav>
    </aside>
    
    <main class="dashboard-main">
      <!-- General Settings -->
      <div class="settings-section active" id="section-general">
        <h1>General Settings</h1>
        
        <div class="settings-card">
          <h3>Language & Timezone</h3>
          <div class="form-group">
            <label for="language">Language</label>
            <select id="language">
              <option value="en">English</option>
              <option value="nl">Dutch</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="timezone">Timezone</label>
            <select id="timezone">
              <option value="UTC">UTC</option>
              <option value="Europe/Amsterdam">Europe/Amsterdam</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
          
          <button class="btn-primary" onclick="saveGeneralSettings()">Save Settings</button>
        </div>
      </div>
      
      <!-- Notifications -->
      <div class="settings-section" id="section-notifications">
        <h1>Notification Preferences</h1>
        
        <div class="settings-card">
          <div class="settings-option">
            <label class="checkbox-label">
              <input type="checkbox" id="email-messages" checked>
              <span>Email notifications for new messages</span>
            </label>
          </div>
          
          <div class="settings-option">
            <label class="checkbox-label">
              <input type="checkbox" id="email-updates" checked>
              <span>Email notifications for project updates</span>
            </label>
          </div>
          
          <div class="settings-option">
            <label class="checkbox-label">
              <input type="checkbox" id="email-invoices">
              <span>Email notifications for invoices</span>
            </label>
          </div>
          
          <button class="btn-primary" onclick="saveNotificationSettings()">Save Preferences</button>
        </div>
      </div>
      
      <!-- Security -->
      <div class="settings-section" id="section-security">
        <h1>Security Settings</h1>
        
        <div class="settings-card">
          <h3>Change Password</h3>
          <form id="password-form">
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input type="password" id="current-password" required>
            </div>
            
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input type="password" id="new-password" required>
            </div>
            
            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" required>
            </div>
            
            <button type="submit" class="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
      
      <!-- Billing -->
      <div class="settings-section" id="section-billing">
        <h1>Billing Settings</h1>
        
        <div class="settings-card">
          <p>Billing information and subscription details will appear here.</p>
        </div>
      </div>
    </main>
  </div>
  
  <script src="js/data-manager.js"></script>
  <script src="js/auth-state.js"></script>
  <script src="js/settings.js"></script>
</body>
</html>
```

### Create: `/home/user/waarheid/js/settings.js`

```javascript
/**
 * Settings Management
 */

document.addEventListener('DOMContentLoaded', function() {
  // Authentication check
  if (!WaarheidAuth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Settings navigation
  const settingsLinks = document.querySelectorAll('.settings-link');
  
  settingsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      
      // Update active link
      settingsLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show active section
      const sections = document.querySelectorAll('.settings-section');
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById('section-' + section);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
});

// Save general settings
function saveGeneralSettings() {
  const language = document.getElementById('language').value;
  const timezone = document.getElementById('timezone').value;
  
  const userData = WaarheidAuth.getCurrentUser();
  if (userData) {
    userData.preferences = {
      language: language,
      timezone: timezone
    };
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  
  // Save to preferences storage
  localStorage.setItem('user_preferences', JSON.stringify({
    language: language,
    timezone: timezone
  }));
  
  alert('General settings saved!');
}

// Save notification settings
function saveNotificationSettings() {
  const preferences = {
    emailMessages: document.getElementById('email-messages').checked,
    emailUpdates: document.getElementById('email-updates').checked,
    emailInvoices: document.getElementById('email-invoices').checked
  };
  
  localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  alert('Notification preferences saved!');
}

// Handle password change
document.getElementById('password-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  // In production, this would be sent to backend
  alert('Password change functionality would be implemented here');
  
  // Clear form
  this.reset();
});
```

---

## 3. Implementing Role-Based Access Control

### Update: `/home/user/waarheid/js/auth-state.js`

Add to the `WaarheidAuth` object:

```javascript
// Extended RBAC functions
hasPermission: function(permission) {
  const userRole = localStorage.getItem('userRole');
  const rolePermissions = {
    'client': ['view_dashboard', 'view_projects', 'view_invoices', 'create_ticket'],
    'admin': ['view_dashboard', 'view_projects', 'view_clients', 'manage_projects', 
              'manage_consultations', 'manage_invoices', 'view_analytics', 'manage_users'],
    'super_admin': ['*'] // Full access
  };
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
},

canAccessDashboard: function() {
  return this.hasPermission('view_dashboard');
},

canManageProjects: function() {
  return this.hasPermission('manage_projects');
},

canViewAnalytics: function() {
  return this.hasPermission('view_analytics');
},

getPermissions: function() {
  const userRole = localStorage.getItem('userRole');
  const rolePermissions = {
    'client': ['view_dashboard', 'view_projects', 'view_invoices', 'create_ticket'],
    'admin': ['view_dashboard', 'view_projects', 'view_clients', 'manage_projects', 
              'manage_consultations', 'manage_invoices', 'view_analytics', 'manage_users'],
  };
  return rolePermissions[userRole] || [];
}
```

### Example: Protecting Routes

```javascript
// In dashboard.js
function navigateToSection(sectionName) {
  if (sectionName === 'analytics' && !WaarheidAuth.hasPermission('view_analytics')) {
    alert('You do not have permission to access analytics.');
    return;
  }
  
  if (sectionName === 'billing' && !WaarheidAuth.hasPermission('manage_billing')) {
    alert('You do not have permission to access billing.');
    return;
  }
  
  // Continue with normal navigation
  // ...
}
```

### Example: Showing/Hiding UI Elements

```javascript
// In dashboard.html or dashboard.js
function initializeUIBasedOnRole() {
  if (!WaarheidAuth.hasPermission('view_analytics')) {
    const analyticsSection = document.querySelector('[data-section="analytics"]');
    if (analyticsSection) {
      analyticsSection.style.display = 'none';
    }
  }
  
  if (!WaarheidAuth.hasPermission('manage_projects')) {
    const editButtons = document.querySelectorAll('.btn-edit-project');
    editButtons.forEach(btn => btn.style.display = 'none');
  }
}

// Call on page load
initializeUIBasedOnRole();
```

---

## 4. Extending User Data Structure

### Update: `/home/user/waarheid/js/database-init.js`

Extend client creation to include new fields:

```javascript
{
  id: 'client_demo_001',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  password: 'password123',
  company: 'Tech Solutions Inc',
  phone: '+31 6 1234 5678',
  address: {
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'Netherlands'
  },
  preferences: {
    language: 'en',
    timezone: 'Europe/Amsterdam',
    emailNotifications: true,
    projectUpdates: true
  },
  twoFactorEnabled: false,
  lastLogin: null,
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  status: 'active'
}
```

---

## 5. Update Dropdown Links

### In `/home/user/waarheid/js/auth-state.js` (lines 85-86):

Change from:
```javascript
<a href="#"><i class="fas fa-user-circle"></i> My Profile</a>
<a href="#"><i class="fas fa-cog"></i> Settings</a>
```

To:
```javascript
<a href="profile.html"><i class="fas fa-user-circle"></i> My Profile</a>
<a href="settings.html"><i class="fas fa-cog"></i> Settings</a>
```

---

## Testing Commands

```javascript
// In browser console to test auth:
WaarheidAuth.isLoggedIn()
WaarheidAuth.isAdmin()
WaarheidAuth.getCurrentUser()
WaarheidAuth.hasPermission('view_dashboard')
WaarheidAuth.getPermissions()

// To simulate login:
localStorage.setItem('authToken', 'test_token');
localStorage.setItem('userEmail', 'test@example.com');
localStorage.setItem('userRole', 'client');
localStorage.setItem('userData', JSON.stringify({
  clientId: 'test_001',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  company: 'Test Company'
}));
```

