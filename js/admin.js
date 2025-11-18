/**
 * Waarheid Marketing - Admin Dashboard JavaScript
 * Handles all admin functionality for managing the business
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Authentication Check
  // ============================================
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!authToken || userRole !== 'admin') {
    window.location.href = 'admin-login.html';
    return;
  }

  // ============================================
  // Navigation
  // ============================================
  const navLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('admin-main-content');
  let currentSection = 'overview';

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        navigateToSection(section);
      }
    });
  });

  // Check if we need to navigate to a specific section
  const targetSection = localStorage.getItem('dashboardSection');
  if (targetSection) {
    localStorage.removeItem('dashboardSection');
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      navigateToSection(targetSection);
    }, 100);
  }

  function navigateToSection(section) {
    // Update active nav
    navLinks.forEach(l => l.classList.remove('active'));
    const targetLink = document.querySelector(`[data-section="${section}"]`);
    if (targetLink) {
      targetLink.classList.add('active');
    }

    // Load section content
    currentSection = section;
    loadSection(section);
  }

  // Expose navigateToSection globally for use in other functions
  window.navigateToSection = navigateToSection;

  // ============================================
  // Stat Card Click Handlers
  // ============================================
  window.showConsultations = function(filterStatus) {
    navigateToSection('consultations');
    // Wait for section to load, then apply filter
    setTimeout(() => {
      const statusFilter = document.getElementById('consultation-status-filter');
      if (statusFilter) {
        statusFilter.value = filterStatus;
        if (window.filterConsultations) {
          window.filterConsultations();
        }
      }
    }, 100);
  };

  window.showProjects = function(filterStatus) {
    navigateToSection('projects');
    setTimeout(() => {
      const statusFilter = document.getElementById('project-status-filter');
      if (statusFilter) {
        statusFilter.value = filterStatus;
        if (window.filterProjects) {
          window.filterProjects();
        }
      }
    }, 100);
  };

  window.showClients = function() {
    navigateToSection('clients');
  };

  window.showInvoices = function(filterType) {
    navigateToSection('invoices');
    setTimeout(() => {
      const statusFilter = document.getElementById('invoice-status-filter');
      if (statusFilter && filterType === 'unpaid') {
        statusFilter.value = 'pending';
        if (window.filterInvoices) {
          window.filterInvoices();
        }
      }
    }, 100);
  };

  window.showMessages = function(filterType) {
    navigateToSection('messages');
    setTimeout(() => {
      if (filterType === 'unread') {
        // Filter to show unread messages
        const unreadFilter = document.getElementById('message-status-filter');
        if (unreadFilter) {
          unreadFilter.value = 'unread';
          if (window.filterMessages) {
            window.filterMessages();
          }
        }
      }
    }, 100);
  };

  // ============================================
  // Section Loaders
  // ============================================
  function loadSection(section) {
    switch(section) {
      case 'overview':
        loadOverview();
        break;
      case 'consultations':
        loadConsultations();
        break;
      case 'timeslots':
        loadTimeSlots();
        break;
      case 'projects':
        loadProjects();
        break;
      case 'clients':
        loadClients();
        break;
      case 'messages':
        loadMessages();
        break;
      case 'invoices':
        loadInvoices();
        break;
      case 'analytics':
        loadAnalytics();
        break;
      case 'users':
        loadUsers();
        break;
      case 'profile':
        loadProfile();
        break;
      case 'settings':
        loadSettings();
        break;
    }
  }

  // ============================================
  // Overview Section
  // ============================================
  function loadOverview() {
    const consultations = DataManager.consultations.getAll();
    const projects = DataManager.projects.getAll();
    const clients = DataManager.clients.getAll();
    const invoices = DataManager.invoices.getAll();
    const unreadMessages = DataManager.tickets.getUnreadCount(null, true);

    const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const unpaidInvoices = invoices.filter(i => i.status === 'pending').length;
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);

    mainContent.innerHTML = `
      <h1>Admin Dashboard Overview</h1>

      <div class="admin-stats-grid">
        <div class="admin-stat-card" onclick="showConsultations('pending')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon warning">
              <i class="fas fa-calendar-check"></i>
            </div>
          </div>
          <div class="admin-stat-value">${pendingConsultations}</div>
          <div class="admin-stat-label">Pending Consultations</div>
        </div>

        <div class="admin-stat-card" onclick="showProjects('in_progress')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon info">
              <i class="fas fa-briefcase"></i>
            </div>
          </div>
          <div class="admin-stat-value">${activeProjects}</div>
          <div class="admin-stat-label">Active Projects</div>
        </div>

        <div class="admin-stat-card" onclick="showClients()" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon primary">
              <i class="fas fa-users"></i>
            </div>
          </div>
          <div class="admin-stat-value">${clients.length}</div>
          <div class="admin-stat-label">Total Clients</div>
        </div>

        <div class="admin-stat-card" onclick="showInvoices('unpaid')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon warning">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div class="admin-stat-value">${unpaidInvoices}</div>
          <div class="admin-stat-label">Unpaid Invoices</div>
        </div>

        <div class="admin-stat-card" onclick="showInvoices('all')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon success">
              <i class="fas fa-dollar-sign"></i>
            </div>
          </div>
          <div class="admin-stat-value">€${totalRevenue.toLocaleString()}</div>
          <div class="admin-stat-label">Total Revenue</div>
        </div>

        <div class="admin-stat-card" onclick="showMessages('unread')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="admin-stat-header">
            <div class="admin-stat-icon primary">
              <i class="fas fa-envelope"></i>
            </div>
          </div>
          <div class="admin-stat-value">${unreadMessages}</div>
          <div class="admin-stat-label">Unread Messages</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 style="margin: 0;">Recent Consultations</h2>
            <button class="btn-admin secondary" onclick="clearRecentConsultations()" style="padding: 0.5rem 1rem; font-size: 0.85rem;" title="Clear recent consultations view">
              <i class="fas fa-trash"></i> Clear All
            </button>
          </div>
          ${renderRecentConsultations(consultations.slice(-5).reverse())}
        </div>

        <div>
          <h2 style="margin-bottom: 1rem;">Active Projects</h2>
          ${renderRecentProjects(projects.filter(p => p.status === 'in_progress').slice(0, 5))}
        </div>
      </div>
    `;
  }

  function renderRecentConsultations(consultations) {
    if (consultations.length === 0) {
      return '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No recent consultations</p></div>';
    }

    return `
      <div class="admin-table-container" id="recent-consultations-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="recent-consultations-tbody">
            ${consultations.map((c, index) => `
              <tr data-consultation-id="${c.id}">
                <td><strong>${c.name || 'N/A'}</strong></td>
                <td>${c.service || 'General'}</td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="viewConsultation('${c.id}')" title="View">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon danger" onclick="removeRecentConsultation('${c.id}')" title="Remove from view">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRecentProjects(projects) {
    if (projects.length === 0) {
      return '<div class="empty-state"><i class="fas fa-briefcase"></i><p>No active projects</p></div>';
    }

    return `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                      <div style="width: ${p.progress}%; height: 100%; background: linear-gradient(90deg, #c50077, #ff0095);"></div>
                    </div>
                    <span style="font-size: 0.8rem;">${p.progress}%</span>
                  </div>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="editProject('${p.id}')" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ============================================
  // Recent Consultations Management
  // ============================================
  window.removeRecentConsultation = function(consultationId) {
    const row = document.querySelector(`tr[data-consultation-id="${consultationId}"]`);
    if (row) {
      row.style.transition = 'opacity 0.3s';
      row.style.opacity = '0';
      setTimeout(() => {
        row.remove();
        // Check if table is now empty
        const tbody = document.getElementById('recent-consultations-tbody');
        if (tbody && tbody.children.length === 0) {
          const container = document.getElementById('recent-consultations-container');
          if (container) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No recent consultations</p></div>';
          }
        }
      }, 300);
    }
  };

  window.clearRecentConsultations = function() {
    if (!confirm('Clear all recent consultations from view? This will not delete the actual data.')) {
      return;
    }

    const container = document.getElementById('recent-consultations-container');
    if (container) {
      container.style.transition = 'opacity 0.3s';
      container.style.opacity = '0';
      setTimeout(() => {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No recent consultations</p></div>';
        container.style.opacity = '1';
      }, 300);
    }
  };

  // ============================================
  // Consultations Section
  // ============================================
  function loadConsultations() {
    const consultations = DataManager.consultations.getAll();
    updateConsultationsBadge();

    // Get unique services and statuses for filters
    const services = [...new Set(consultations.map(c => c.service).filter(Boolean))];
    const statuses = [...new Set(consultations.map(c => c.status))];

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1>Consultation Requests</h1>
        <div class="admin-actions">
          <button class="btn-admin" onclick="refreshConsultations()">
            <i class="fas fa-sync"></i>
            Refresh
          </button>
        </div>
      </div>

      ${consultations.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-calendar-check"></i>
          <h3>No Consultation Requests</h3>
          <p>New consultation requests will appear here</p>
        </div>
      ` : `
        <!-- Search and Filter Section -->
        <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-search"></i> Search</label>
              <input type="text" id="consultation-search" placeholder="Search by name or email..." onkeyup="filterConsultations()">
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-briefcase"></i> Service</label>
              <select id="consultation-service-filter" onchange="filterConsultations()">
                <option value="">All Services</option>
                ${services.map(service => `<option value="${service}">${service}</option>`).join('')}
              </select>
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-flag"></i> Status</label>
              <select id="consultation-status-filter" onchange="filterConsultations()">
                <option value="">All Statuses</option>
                ${statuses.map(status => `<option value="${status}">${status}</option>`).join('')}
              </select>
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-sort"></i> Sort By</label>
              <select id="consultation-sort" onchange="filterConsultations()">
                <option value="date-new">Date (Newest First)</option>
                <option value="date-old">Date (Oldest First)</option>
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="service">Service (A-Z)</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div style="display: flex; align-items: flex-end;">
              <button class="btn-admin secondary" onclick="clearConsultationFilters()" style="width: 100%;">
                <i class="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>
        </div>

        <div id="consultations-table-container">
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="consultations-table-body">
                ${renderConsultationRows(consultations)}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
  }

  function renderConsultationRows(consultations) {
    if (consultations.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
            No consultations match your filters
          </td>
        </tr>
      `;
    }

    return consultations.map(c => `
      <tr>
        <td><strong>${c.name || 'N/A'}</strong></td>
        <td>${c.email || 'N/A'}</td>
        <td>${c.service || 'General'}</td>
        <td>${c.preferredDate || 'Flexible'}</td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="viewConsultation('${c.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="editConsultation('${c.id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            ${c.status === 'pending' ? `
              <button class="btn-icon success" onclick="approveConsultation('${c.id}')" title="Approve">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-icon danger" onclick="rejectConsultation('${c.id}')" title="Reject">
                <i class="fas fa-times"></i>
              </button>
              <button class="btn-icon" onclick="convertToProject('${c.id}')" title="Convert to Project">
                <i class="fas fa-briefcase"></i>
              </button>
            ` : ''}
            <button class="btn-icon danger" onclick="deleteConsultation('${c.id}')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.viewConsultation = function(consultationId) {
    const consultation = DataManager.consultations.getById(consultationId);
    if (!consultation) return;

    showModal(`
      <div class="admin-modal-header">
        <h3>Consultation Request Details</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div style="display: grid; gap: 1rem;">
          <div>
            <strong>Name:</strong> ${consultation.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> ${consultation.email || 'N/A'}
          </div>
          <div>
            <strong>Phone:</strong> ${consultation.phone || 'N/A'}
          </div>
          <div>
            <strong>Service:</strong> ${consultation.service || 'General'}
          </div>
          <div>
            <strong>Preferred Date:</strong> ${consultation.preferredDate || 'Flexible'}
          </div>
          <div>
            <strong>Preferred Time:</strong> ${consultation.preferredTime || 'Flexible'}
          </div>
          <div>
            <strong>Message:</strong><br>
            ${consultation.message || 'No message provided'}
          </div>
          <div>
            <strong>Status:</strong> <span class="status-badge ${consultation.status}">${consultation.status}</span>
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        ${consultation.status === 'pending' ? `
          <button class="btn-admin secondary" onclick="approveConsultation('${consultation.id}'); closeModal();">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn-admin secondary" onclick="rejectConsultation('${consultation.id}'); closeModal();">
            <i class="fas fa-times"></i> Reject
          </button>
          <button class="btn-admin" onclick="convertToProject('${consultation.id}');">
            <i class="fas fa-briefcase"></i> Convert to Project
          </button>
        ` : `
          <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        `}
      </div>
    `);
  };

  window.approveConsultation = function(consultationId) {
    DataManager.consultations.approve(consultationId);
    refreshConsultations();
  };

  window.rejectConsultation = function(consultationId) {
    const reason = prompt('Reason for rejection (optional):');

    // Get consultation to find time slot
    const consultation = DataManager.consultations.getById(consultationId);

    // Release the time slot if it was booked
    if (consultation && consultation.timeSlotId) {
      DataManager.timeslots.release(consultation.timeSlotId);
    }

    DataManager.consultations.reject(consultationId, reason);
    refreshConsultations();
  };

  window.convertToProject = function(consultationId) {
    const consultation = DataManager.consultations.getById(consultationId);
    if (!consultation) return;

    closeModal();

    // Show project creation form pre-filled with consultation data
    showCreateProjectModal({
      title: `${consultation.service} Project - ${consultation.name}`,
      description: consultation.message || '',
      consultationId: consultationId
    });
  };

  window.editConsultation = function(consultationId) {
    const consultation = DataManager.consultations.getById(consultationId);
    if (!consultation) return;

    showModal(`
      <div class="admin-modal-header">
        <h3>Edit Consultation</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="edit-consultation-form" onsubmit="submitEditConsultation(event, '${consultationId}')">
          <div style="display: grid; gap: 1rem;">
            <div class="form-group">
              <label for="edit-name">Name</label>
              <input type="text" id="edit-name" value="${consultation.name || ''}" required>
            </div>
            <div class="form-group">
              <label for="edit-email">Email</label>
              <input type="email" id="edit-email" value="${consultation.email || ''}" required>
            </div>
            <div class="form-group">
              <label for="edit-phone">Phone</label>
              <input type="tel" id="edit-phone" value="${consultation.phone || ''}">
            </div>
            <div class="form-group">
              <label for="edit-service">Service</label>
              <select id="edit-service">
                <option value="Website Development" ${consultation.service === 'Website Development' ? 'selected' : ''}>Website Development</option>
                <option value="Brand Identity" ${consultation.service === 'Brand Identity' ? 'selected' : ''}>Brand Identity</option>
                <option value="Digital Marketing" ${consultation.service === 'Digital Marketing' ? 'selected' : ''}>Digital Marketing</option>
                <option value="SEO Optimization" ${consultation.service === 'SEO Optimization' ? 'selected' : ''}>SEO Optimization</option>
                <option value="Social Media Management" ${consultation.service === 'Social Media Management' ? 'selected' : ''}>Social Media Management</option>
                <option value="Content Creation" ${consultation.service === 'Content Creation' ? 'selected' : ''}>Content Creation</option>
                <option value="E-commerce Solutions" ${consultation.service === 'E-commerce Solutions' ? 'selected' : ''}>E-commerce Solutions</option>
                <option value="Consulting" ${consultation.service === 'Consulting' ? 'selected' : ''}>Consulting</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-date">Preferred Date</label>
              <input type="date" id="edit-date" value="${consultation.preferredDate || ''}">
            </div>
            <div class="form-group">
              <label for="edit-time">Preferred Time</label>
              <input type="time" id="edit-time" value="${consultation.preferredTime || ''}">
            </div>
            <div class="form-group">
              <label for="edit-status">Status</label>
              <select id="edit-status">
                <option value="pending" ${consultation.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="approved" ${consultation.status === 'approved' ? 'selected' : ''}>Approved</option>
                <option value="rejected" ${consultation.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                <option value="cancelled" ${consultation.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                <option value="completed" ${consultation.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-message">Message</label>
              <textarea id="edit-message" rows="4">${consultation.message || ''}</textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="document.getElementById('edit-consultation-form').requestSubmit()">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    `);
  };

  window.submitEditConsultation = function(event, consultationId) {
    event.preventDefault();

    const consultation = DataManager.consultations.getById(consultationId);
    const oldStatus = consultation ? consultation.status : null;
    const newStatus = document.getElementById('edit-status').value;

    const updatedData = {
      name: document.getElementById('edit-name').value,
      email: document.getElementById('edit-email').value,
      phone: document.getElementById('edit-phone').value,
      service: document.getElementById('edit-service').value,
      preferredDate: document.getElementById('edit-date').value,
      preferredTime: document.getElementById('edit-time').value,
      status: newStatus,
      message: document.getElementById('edit-message').value
    };

    // Release time slot if status changed to rejected or cancelled
    if (consultation && consultation.timeSlotId &&
        (newStatus === 'rejected' || newStatus === 'cancelled') &&
        oldStatus !== 'rejected' && oldStatus !== 'cancelled') {
      DataManager.timeslots.release(consultation.timeSlotId);
    }

    DataManager.consultations.update(consultationId, updatedData);
    closeModal();
    refreshConsultations();
    alert('Consultation updated successfully!');
  };

  window.deleteConsultation = function(consultationId) {
    const consultation = DataManager.consultations.getById(consultationId);
    if (!consultation) return;

    if (!confirm(`Are you sure you want to delete the consultation for ${consultation.name}?`)) {
      return;
    }

    // Release time slot if booked
    if (consultation.timeSlotId) {
      DataManager.timeslots.release(consultation.timeSlotId);
    }

    DataManager.consultations.delete(consultationId);
    refreshConsultations();
    alert('Consultation deleted successfully!');
  };

  window.refreshConsultations = function() {
    loadConsultations();
  };

  window.filterConsultations = function() {
    const searchTerm = document.getElementById('consultation-search').value.toLowerCase();
    const serviceFilter = document.getElementById('consultation-service-filter').value;
    const statusFilter = document.getElementById('consultation-status-filter').value;
    const sortBy = document.getElementById('consultation-sort').value;

    let consultations = DataManager.consultations.getAll();

    // Apply search filter (name or email)
    if (searchTerm) {
      consultations = consultations.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm))
      );
    }

    // Apply service filter
    if (serviceFilter) {
      consultations = consultations.filter(c => c.service === serviceFilter);
    }

    // Apply status filter
    if (statusFilter) {
      consultations = consultations.filter(c => c.status === statusFilter);
    }

    // Apply sorting
    switch(sortBy) {
      case 'name':
        consultations.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        consultations.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'service':
        consultations.sort((a, b) => (a.service || '').localeCompare(b.service || ''));
        break;
      case 'status':
        consultations.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
      case 'date-new':
        consultations.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'date-old':
        consultations.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
    }

    // Update table
    document.getElementById('consultations-table-body').innerHTML = renderConsultationRows(consultations);
  };

  window.clearConsultationFilters = function() {
    document.getElementById('consultation-search').value = '';
    document.getElementById('consultation-service-filter').value = '';
    document.getElementById('consultation-status-filter').value = '';
    document.getElementById('consultation-sort').value = 'date-new';
    filterConsultations();
  };

  // ============================================
  // Time Slots Section
  // ============================================
  let currentCalendarDate = new Date();

  function loadTimeSlots() {
    const slots = DataManager.timeslots.getAll();

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1>Time Slots Calendar</h1>
        <div class="admin-actions">
          <button class="btn-admin secondary" onclick="showCreateTimeSlotsModal()">
            <i class="fas fa-plus"></i>
            Bulk Create
          </button>
          <button class="btn-admin secondary" onclick="showBulkDeleteModal()" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444;">
            <i class="fas fa-trash-alt"></i>
            Bulk Delete
          </button>
        </div>
      </div>
      <div id="calendar-container"></div>
    `;

    renderCalendar(currentCalendarDate);
  }

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthDays = prevLastDay.getDate();

    const slots = DataManager.timeslots.getAll();
    const slotsByDate = {};

    slots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = { available: 0, booked: 0 };
      }
      if (slot.available) {
        slotsByDate[slot.date].available++;
      } else {
        slotsByDate[slot.date].booked++;
      }
    });

    let calendarHTML = `
      <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <button class="btn-admin secondary" onclick="previousMonth()">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h2 style="margin: 0;">${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button class="btn-admin secondary" onclick="nextMonth()">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            `<div style="text-align: center; font-weight: 700; padding: 0.5rem; color: var(--dashboard-text-muted);">${day}</div>`
          ).join('')}
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
    `;

    // Previous month days
    const startDay = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      calendarHTML += `
        <div style="padding: 1rem; text-align: center; opacity: 0.3; background: rgba(255,255,255,0.02); border-radius: 8px; min-height: 80px;">
          <div>${day}</div>
        </div>
      `;
    }

    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySlots = slotsByDate[dateStr] || { available: 0, booked: 0 };
      const isPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();

      const totalSlots = daySlots.available + daySlots.booked;

      calendarHTML += `
        <div onclick="showDaySlots('${dateStr}')" style="
          padding: 0.75rem;
          background: ${isToday ? 'rgba(197, 0, 119, 0.2)' : 'rgba(255,255,255,0.05)'};
          border: ${isToday ? '2px solid var(--dashboard-primary)' : '1px solid var(--dashboard-border)'};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          opacity: ${isPast ? '0.5' : '1'};
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        " onmouseover="this.style.background='rgba(197, 0, 119, 0.15)'" onmouseout="this.style.background='${isToday ? 'rgba(197, 0, 119, 0.2)' : 'rgba(255,255,255,0.05)'}'">
          <div style="font-weight: ${isToday ? '700' : '500'}; font-size: 1.1rem; text-align: center;">
            ${day}
          </div>
          ${totalSlots > 0 ? `
            <div style="margin-top: 0.5rem; font-size: 0.75rem;">
              ${daySlots.available > 0 ? `<div style="color: #10b981;">${daySlots.available} available</div>` : ''}
              ${daySlots.booked > 0 ? `<div style="color: #ef4444;">${daySlots.booked} booked</div>` : ''}
            </div>
          ` : `
            <div style="margin-top: 0.5rem; font-size: 0.7rem; color: var(--dashboard-text-muted); text-align: center;">
              ${!isPast ? 'Click to add' : ''}
            </div>
          `}
        </div>
      `;
    }

    // Next month days
    const remainingCells = 42 - (startDay + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      calendarHTML += `
        <div style="padding: 1rem; text-align: center; opacity: 0.3; background: rgba(255,255,255,0.02); border-radius: 8px; min-height: 80px;">
          <div>${i}</div>
        </div>
      `;
    }

    calendarHTML += `
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
          <h3 style="margin-bottom: 1rem;">Quick Actions</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn-admin" onclick="showQuickAddSlot()">
              <i class="fas fa-plus-circle"></i> Quick Add Slot
            </button>
            <button class="btn-admin secondary" onclick="showCreateTimeSlotsModal()">
              <i class="fas fa-calendar-plus"></i> Bulk Create Slots
            </button>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('calendar-container');
    if (container) {
      container.innerHTML = calendarHTML;
    }
  }

  window.previousMonth = function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate);
  };

  window.nextMonth = function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate);
  };

  window.showDaySlots = function(dateStr) {
    const slots = DataManager.timeslots.getAll().filter(s => s.date === dateStr);
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const slotsList = slots.length > 0 ? slots.map(slot => {
      const client = slot.bookedBy ? DataManager.clients.getById(slot.bookedBy) : null;
      return `
        <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid ${slot.available ? '#10b981' : '#ef4444'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${slot.startTime} - ${slot.endTime}</strong>
              <div style="margin-top: 0.3rem;">
                ${slot.available ?
                  '<span style="color: #10b981; font-size: 0.9rem;"><i class="fas fa-check-circle"></i> Available</span>' :
                  `<span style="color: #ef4444; font-size: 0.9rem;"><i class="fas fa-user"></i> Booked by ${client ? client.firstName + ' ' + client.lastName : 'Unknown'}</span>`
                }
              </div>
            </div>
            <div class="table-actions">
              ${!slot.available && slot.consultationId ? `
                <button class="btn-icon" onclick="viewConsultationFromSlot('${slot.consultationId}')" title="View Booking">
                  <i class="fas fa-eye"></i>
                </button>
              ` : ''}
              ${slot.available ? `
                <button class="btn-icon danger" onclick="deleteTimeSlot('${slot.id}'); closeModal(); renderCalendar(currentCalendarDate);" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('') : '<p style="text-align: center; color: var(--dashboard-text-muted);">No time slots for this day</p>';

    showModal(`
      <div class="admin-modal-header">
        <h3>${formattedDate}</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body" style="max-height: 60vh; overflow-y: auto;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${slotsList}
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        <button class="btn-admin" onclick="showQuickAddSlotForDate('${dateStr}')">
          <i class="fas fa-plus"></i> Add Slot
        </button>
      </div>
    `);
  };

  window.viewConsultationFromSlot = function(consultationId) {
    closeModal();
    setTimeout(() => {
      viewConsultation(consultationId);
    }, 100);
  };

  window.showQuickAddSlot = function() {
    const today = new Date().toISOString().split('T')[0];
    showQuickAddSlotForDate(today);
  };

  window.showQuickAddSlotForDate = function(dateStr) {
    closeModal();
    setTimeout(() => {
      showModal(`
        <div class="admin-modal-header">
          <h3>Add Time Slot</h3>
          <button class="admin-modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="admin-modal-body">
          <form id="quick-add-slot-form">
            <div class="admin-form-group">
              <label>Date *</label>
              <input type="date" name="date" value="${dateStr}" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label>Start Time *</label>
                <input type="time" name="startTime" value="09:00" required>
              </div>
              <div class="admin-form-group">
                <label>End Time *</label>
                <input type="time" name="endTime" value="10:00" required>
              </div>
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
          <button class="btn-admin" onclick="submitQuickAddSlot()">
            <i class="fas fa-plus"></i> Add Slot
          </button>
        </div>
      `);
    }, 100);
  };

  window.submitQuickAddSlot = function() {
    const form = document.getElementById('quick-add-slot-form');
    const formData = new FormData(form);

    DataManager.timeslots.create({
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime')
    });

    closeModal();
    alert('Time slot created successfully!');
    renderCalendar(currentCalendarDate);
  };

  window.showCreateTimeSlotsModal = function() {
    showModal(`
      <div class="admin-modal-header">
        <h3>Create Time Slots</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="create-timeslots-form">
          <div class="admin-form-group">
            <label>Start Date *</label>
            <input type="date" name="startDate" required min="${new Date().toISOString().split('T')[0]}">
          </div>

          <div class="admin-form-group">
            <label>End Date *</label>
            <input type="date" name="endDate" required min="${new Date().toISOString().split('T')[0]}">
          </div>

          <div class="admin-form-group">
            <label>Select Days</label>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="1" checked style="cursor: pointer;"> <span style="font-size: 0.85rem;">Mon</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="2" checked style="cursor: pointer;"> <span style="font-size: 0.85rem;">Tue</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="3" checked style="cursor: pointer;"> <span style="font-size: 0.85rem;">Wed</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="4" checked style="cursor: pointer;"> <span style="font-size: 0.85rem;">Thu</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="5" checked style="cursor: pointer;"> <span style="font-size: 0.85rem;">Fri</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="6" style="cursor: pointer;"> <span style="font-size: 0.85rem;">Sat</span>
              </label>
              <label style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <input type="checkbox" name="days" value="0" style="cursor: pointer;"> <span style="font-size: 0.85rem;">Sun</span>
              </label>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Start Time *</label>
              <input type="time" name="startTime" value="09:00" required>
            </div>

            <div class="admin-form-group">
              <label>End Time *</label>
              <input type="time" name="endTime" value="17:00" required>
            </div>
          </div>

          <div class="admin-form-group">
            <label>Slot Duration (minutes) *</label>
            <select name="duration" required>
              <option value="30">30 minutes</option>
              <option value="60" selected>60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitCreateTimeSlots()">
          <i class="fas fa-plus"></i> Generate Slots
        </button>
      </div>
    `);
  };

  window.submitCreateTimeSlots = function() {
    const form = document.getElementById('create-timeslots-form');
    const formData = new FormData(form);

    const startDate = new Date(formData.get('startDate'));
    const endDate = new Date(formData.get('endDate'));
    const selectedDays = formData.getAll('days').map(Number);
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const duration = parseInt(formData.get('duration'));

    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    let slotsCreated = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (selectedDays.includes(currentDate.getDay())) {
        const dateStr = currentDate.toISOString().split('T')[0];

        let slotStart = startTime;
        const [endHour, endMin] = endTime.split(':').map(Number);

        while (true) {
          const [startHour, startMin] = slotStart.split(':').map(Number);
          const slotEndMin = startMin + duration;
          const slotEndHour = startHour + Math.floor(slotEndMin / 60);
          const finalEndMin = slotEndMin % 60;

          if (slotEndHour > endHour || (slotEndHour === endHour && finalEndMin > endMin)) {
            break;
          }

          const slotEnd = String(slotEndHour).padStart(2, '0') + ':' + String(finalEndMin).padStart(2, '0');

          DataManager.timeslots.create({
            date: dateStr,
            startTime: slotStart,
            endTime: slotEnd
          });

          slotsCreated++;
          slotStart = slotEnd;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    closeModal();
    alert('Created ' + slotsCreated + ' time slots successfully!');
    loadTimeSlots();
  };

  window.deleteTimeSlot = function(slotId) {
    const slot = DataManager.timeslots.getAll().find(s => s.id === slotId);
    if (slot && !slot.available) {
      alert('Cannot delete a booked time slot. Cancel the consultation first.');
      return;
    }

    if (confirm('Delete this time slot?')) {
      DataManager.timeslots.delete(slotId);
      loadTimeSlots();
    }
  };

  window.showBulkDeleteModal = function() {
    const allSlots = DataManager.timeslots.getAll();
    const availableSlots = allSlots.filter(s => s.available);
    const bookedSlots = allSlots.filter(s => !s.available);

    showModal(`
      <div class="admin-modal-header">
        <h3>Bulk Delete Time Slots</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid #ef4444;">
          <p style="margin: 0; color: #ef4444; font-size: 0.9rem;">
            <i class="fas fa-exclamation-triangle"></i> Warning: Only available (unbooked) slots can be deleted. Booked slots will be skipped.
          </p>
        </div>

        <div style="display: grid; gap: 1rem; margin-bottom: 1rem;">
          <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>Total Slots:</strong> ${allSlots.length}
              </div>
              <div>
                <span style="color: #10b981;">Available: ${availableSlots.length}</span> |
                <span style="color: #ef4444;">Booked: ${bookedSlots.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <button class="btn-admin secondary" onclick="deleteAllAvailableSlots()" style="background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444; justify-content: space-between; display: flex; align-items: center;">
            <span><i class="fas fa-trash"></i> Delete All Available Slots</span>
            <span style="font-size: 0.9rem; opacity: 0.8;">(${availableSlots.length} slots)</span>
          </button>

          <div style="border-top: 1px solid var(--dashboard-border); padding-top: 1rem; margin-top: 0.5rem;">
            <h4 style="margin-bottom: 1rem;">Delete by Date Range</h4>
            <form id="bulk-delete-form" style="display: grid; gap: 1rem;">
              <div class="admin-form-group">
                <label>Start Date *</label>
                <input type="date" id="bulk-delete-start" required>
              </div>
              <div class="admin-form-group">
                <label>End Date *</label>
                <input type="date" id="bulk-delete-end" required>
              </div>
              <button type="button" class="btn-admin secondary" onclick="deleteSlotsInRange()" style="background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444;">
                <i class="fas fa-calendar-times"></i> Delete Slots in Range
              </button>
            </form>
          </div>

          <div style="border-top: 1px solid var(--dashboard-border); padding-top: 1rem; margin-top: 0.5rem;">
            <h4 style="margin-bottom: 1rem;">Delete by Specific Date</h4>
            <div style="display: grid; gap: 1rem;">
              <div class="admin-form-group">
                <label>Select Date *</label>
                <input type="date" id="bulk-delete-specific-date">
              </div>
              <button type="button" class="btn-admin secondary" onclick="deleteSlotsOnDate()" style="background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444;">
                <i class="fas fa-calendar-day"></i> Delete All Slots on This Date
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
      </div>
    `);
  };

  window.deleteAllAvailableSlots = function() {
    const availableSlots = DataManager.timeslots.getAll().filter(s => s.available);

    if (availableSlots.length === 0) {
      alert('No available slots to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete all ${availableSlots.length} available time slots? This action cannot be undone.`)) {
      return;
    }

    let deletedCount = 0;
    availableSlots.forEach(slot => {
      DataManager.timeslots.delete(slot.id);
      deletedCount++;
    });

    closeModal();
    alert(`Successfully deleted ${deletedCount} available time slots.`);
    renderCalendar(currentCalendarDate);
  };

  window.deleteSlotsInRange = function() {
    const startDate = document.getElementById('bulk-delete-start').value;
    const endDate = document.getElementById('bulk-delete-end').value;

    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before or equal to end date.');
      return;
    }

    const allSlots = DataManager.timeslots.getAll();
    const slotsInRange = allSlots.filter(slot => {
      const slotDate = slot.date;
      return slotDate >= startDate && slotDate <= endDate && slot.available;
    });

    if (slotsInRange.length === 0) {
      alert('No available slots found in this date range.');
      return;
    }

    if (!confirm(`Found ${slotsInRange.length} available slots between ${new Date(startDate).toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}. Delete them all?`)) {
      return;
    }

    let deletedCount = 0;
    slotsInRange.forEach(slot => {
      DataManager.timeslots.delete(slot.id);
      deletedCount++;
    });

    closeModal();
    alert(`Successfully deleted ${deletedCount} time slots.`);
    renderCalendar(currentCalendarDate);
  };

  window.deleteSlotsOnDate = function() {
    const dateStr = document.getElementById('bulk-delete-specific-date').value;

    if (!dateStr) {
      alert('Please select a date.');
      return;
    }

    const allSlots = DataManager.timeslots.getAll();
    const slotsOnDate = allSlots.filter(slot => slot.date === dateStr && slot.available);

    if (slotsOnDate.length === 0) {
      alert('No available slots found on this date.');
      return;
    }

    if (!confirm(`Found ${slotsOnDate.length} available slots on ${new Date(dateStr).toLocaleDateString()}. Delete them all?`)) {
      return;
    }

    let deletedCount = 0;
    slotsOnDate.forEach(slot => {
      DataManager.timeslots.delete(slot.id);
      deletedCount++;
    });

    closeModal();
    alert(`Successfully deleted ${deletedCount} time slots on ${new Date(dateStr).toLocaleDateString()}.`);
    renderCalendar(currentCalendarDate);
  };

  // ============================================
  // Projects Section
  // ============================================
  function loadProjects() {
    const allProjects = DataManager.projects.getAll();
    const clients = DataManager.clients.getAll();

    // Get unique categories and statuses for filters
    const categories = [...new Set(allProjects.map(p => p.category).filter(Boolean))];
    const statuses = [...new Set(allProjects.map(p => p.status))];

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1>Projects Management</h1>
        <div class="admin-actions">
          <button class="btn-admin" onclick="showCreateProjectModal()">
            <i class="fas fa-plus"></i>
            New Project
          </button>
        </div>
      </div>

      ${allProjects.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-briefcase"></i>
          <h3>No Projects</h3>
          <p>Click "New Project" to create your first project</p>
        </div>
      ` : `
        <!-- Search and Filter Section -->
        <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-search"></i> Search</label>
              <input type="text" id="project-search" placeholder="Search by project name..." onkeyup="filterProjects()">
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-user"></i> Client</label>
              <select id="project-client-filter" onchange="filterProjects()">
                <option value="">All Clients</option>
                ${clients.map(c => `<option value="${c.id}">${c.firstName} ${c.lastName}</option>`).join('')}
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-folder"></i> Category</label>
              <select id="project-category-filter" onchange="filterProjects()">
                <option value="">All Categories</option>
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-flag"></i> Status</label>
              <select id="project-status-filter" onchange="filterProjects()">
                <option value="">All Statuses</option>
                ${statuses.map(status => `<option value="${status}">${status.replace('_', ' ')}</option>`).join('')}
              </select>
            </div>

            <div class="admin-form-group" style="margin: 0;">
              <label><i class="fas fa-sort"></i> Sort By</label>
              <select id="project-sort" onchange="filterProjects()">
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="budget-high">Budget (High to Low)</option>
                <option value="budget-low">Budget (Low to High)</option>
                <option value="progress-high">Progress (High to Low)</option>
                <option value="progress-low">Progress (Low to High)</option>
                <option value="date-new">Date (Newest First)</option>
                <option value="date-old">Date (Oldest First)</option>
              </select>
            </div>

            <div style="display: flex; align-items: flex-end;">
              <button class="btn-admin secondary" onclick="clearProjectFilters()" style="width: 100%;">
                <i class="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>
        </div>

        <div id="projects-table-container">
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="projects-table-body">
                ${renderProjectRows(allProjects)}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
  }

  function renderProjectRows(projects) {
    if (projects.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
            No projects match your filters
          </td>
        </tr>
      `;
    }

    return projects.map(p => {
      const client = p.clientId ? DataManager.clients.getById(p.clientId) : null;
      return `
        <tr onclick="viewProjectDetails('${p.id}')" style="cursor: pointer;" onmouseover="this.style.background='rgba(197, 0, 119, 0.05)'" onmouseout="this.style.background=''">
          <td><strong>${p.title}</strong></td>
          <td>${client ? client.firstName + ' ' + client.lastName : '<span style="color: #f59e0b;">Unassigned</span>'}</td>
          <td>${p.category || 'N/A'}</td>
          <td><span class="status-badge ${p.status}">${p.status.replace('_', ' ')}</span></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                <div style="width: ${p.progress}%; height: 100%; background: linear-gradient(90deg, #c50077, #ff0095);"></div>
              </div>
              <span style="font-size: 0.8rem;">${p.progress}%</span>
            </div>
          </td>
          <td>€${(p.budget || 0).toLocaleString()}</td>
          <td>
            <div class="table-actions" onclick="event.stopPropagation()">
              <button class="btn-icon" onclick="viewProjectDetails('${p.id}')" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon" onclick="editProject('${p.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" onclick="assignClient('${p.id}')" title="Assign Client">
                <i class="fas fa-user-plus"></i>
              </button>
              <button class="btn-icon danger" onclick="deleteProject('${p.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.filterProjects = function() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const clientFilter = document.getElementById('project-client-filter').value;
    const categoryFilter = document.getElementById('project-category-filter').value;
    const statusFilter = document.getElementById('project-status-filter').value;
    const sortBy = document.getElementById('project-sort').value;

    let projects = DataManager.projects.getAll();

    // Apply search filter
    if (searchTerm) {
      projects = projects.filter(p => p.title.toLowerCase().includes(searchTerm));
    }

    // Apply client filter
    if (clientFilter) {
      if (clientFilter === 'unassigned') {
        projects = projects.filter(p => !p.clientId);
      } else {
        projects = projects.filter(p => p.clientId === clientFilter);
      }
    }

    // Apply category filter
    if (categoryFilter) {
      projects = projects.filter(p => p.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      projects = projects.filter(p => p.status === statusFilter);
    }

    // Apply sorting
    switch(sortBy) {
      case 'name':
        projects.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        projects.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'budget-high':
        projects.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'budget-low':
        projects.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      case 'progress-high':
        projects.sort((a, b) => b.progress - a.progress);
        break;
      case 'progress-low':
        projects.sort((a, b) => a.progress - b.progress);
        break;
      case 'date-new':
        projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'date-old':
        projects.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
    }

    // Update table
    document.getElementById('projects-table-body').innerHTML = renderProjectRows(projects);
  };

  window.clearProjectFilters = function() {
    document.getElementById('project-search').value = '';
    document.getElementById('project-client-filter').value = '';
    document.getElementById('project-category-filter').value = '';
    document.getElementById('project-status-filter').value = '';
    document.getElementById('project-sort').value = 'name';
    filterProjects();
  };

  window.viewProjectDetails = function(projectId) {
    // Store current project ID for refresh operations
    window.currentProjectId = projectId;

    const project = DataManager.projects.getById(projectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    const client = project.clientId ? DataManager.clients.getById(project.clientId) : null;
    const milestones = project.milestones || [];
    const files = project.files || [];
    const team = project.team || [];
    const deliverables = project.deliverables || [];

    showModal(`
      <style>
        .admin-modal-content { max-width: 950px !important; }
      </style>
      <div class="admin-modal-header">
        <h3><i class="fas fa-briefcase"></i> ${project.title}</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <!-- Tab Navigation -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--dashboard-border); margin-bottom: 1.5rem; flex-wrap: wrap;">
          <button class="project-tab active" onclick="switchProjectTab(event, 'overview')">
            <i class="fas fa-info-circle"></i> Overview
          </button>
          <button class="project-tab" onclick="switchProjectTab(event, 'milestones')">
            <i class="fas fa-tasks"></i> Milestones
          </button>
          <button class="project-tab" onclick="switchProjectTab(event, 'files')">
            <i class="fas fa-folder-open"></i> Files
          </button>
          <button class="project-tab" onclick="switchProjectTab(event, 'team')">
            <i class="fas fa-users"></i> Team
          </button>
          <button class="project-tab" onclick="switchProjectTab(event, 'deliverables')">
            <i class="fas fa-box"></i> Deliverables
          </button>
        </div>

        <!-- Overview Tab -->
        <div id="project-tab-overview" class="project-tab-content active">
          <div style="display: grid; gap: 1.5rem;">
            <!-- Project Info Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-user"></i> Client
                </div>
                <strong>${client ? `${client.firstName} ${client.lastName}` : '<span style="color: #f59e0b;">Unassigned</span>'}</strong>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-folder"></i> Category
                </div>
                <strong>${project.category || 'N/A'}</strong>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-flag"></i> Status
                </div>
                <span class="status-badge ${project.status}">${project.status.replace('_', ' ')}</span>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-euro-sign"></i> Budget
                </div>
                <strong>€${(project.budget || 0).toLocaleString()}</strong>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-calendar"></i> Start Date
                </div>
                <strong>${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</strong>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                  <i class="fas fa-calendar-check"></i> Deadline
                </div>
                <strong>${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</strong>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span><i class="fas fa-chart-line"></i> Progress</span>
                <strong>${project.progress}%</strong>
              </div>
              <div style="height: 12px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                <div style="width: ${project.progress}%; height: 100%; background: linear-gradient(90deg, #c50077, #ff0095);"></div>
              </div>
            </div>

            <!-- Description -->
            <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
              <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                <i class="fas fa-align-left"></i> Description
              </div>
              <p style="margin: 0; white-space: pre-wrap;">${project.description || 'No description provided'}</p>
            </div>

            <!-- Notes -->
            <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="color: var(--dashboard-text-muted); font-size: 0.85rem;">
                  <i class="fas fa-sticky-note"></i> Internal Notes
                </span>
                <button class="btn-icon" onclick="editProjectNotes('${project.id}')" title="Edit Notes">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
              <p style="margin: 0; white-space: pre-wrap;">${project.notes || 'No notes yet'}</p>
            </div>
          </div>
        </div>

        <!-- Milestones Tab -->
        <div id="project-tab-milestones" class="project-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <button class="btn-admin" onclick="addMilestone('${project.id}')">
              <i class="fas fa-plus"></i> Add Milestone
            </button>
          </div>

          <div id="milestones-list">
            ${milestones.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
                <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No milestones yet. Add your first milestone to track progress.</p>
              </div>
            ` : milestones.map((m, index) => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${m.completed ? '#10b981' : '#c50077'}; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                      <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${project.id}', ${index})" style="cursor: pointer;">
                      <strong style="${m.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${m.title}</strong>
                      ${m.dueDate ? `<span style="font-size: 0.85rem; color: var(--dashboard-text-muted);"><i class="fas fa-calendar"></i> ${new Date(m.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                    ${m.description ? `<p style="margin: 0.5rem 0 0 1.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${m.description}</p>` : ''}
                  </div>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="editMilestone('${project.id}', ${index})" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteMilestone('${project.id}', ${index})" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Files Tab -->
        <div id="project-tab-files" class="project-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <button class="btn-admin" onclick="uploadProjectFile('${project.id}')">
              <i class="fas fa-upload"></i> Upload File
            </button>
          </div>

          <div id="files-list">
            ${files.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
                <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No files uploaded yet. Upload project files, designs, or documents.</p>
              </div>
            ` : files.map((file, index) => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-file" style="font-size: 1.5rem; color: var(--dashboard-primary);"></i>
                    <div>
                      <strong>${file.name}</strong>
                      <div style="font-size: 0.85rem; color: var(--dashboard-text-muted);">
                        ${file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''} • ${file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="downloadProjectFile('${project.id}', ${index})" title="Download">
                      <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteProjectFile('${project.id}', ${index})" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Team Tab -->
        <div id="project-tab-team" class="project-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <button class="btn-admin" onclick="addTeamMember('${project.id}')">
              <i class="fas fa-user-plus"></i> Add Team Member
            </button>
          </div>

          <div id="team-list">
            ${team.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No team members assigned. Add team members working on this project.</p>
              </div>
            ` : team.map((member, index) => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${member.name}</strong>
                    <div style="font-size: 0.85rem; color: var(--dashboard-text-muted);">
                      ${member.role || 'Team Member'} ${member.email ? `• ${member.email}` : ''}
                    </div>
                  </div>
                  <button class="btn-icon danger" onclick="removeTeamMember('${project.id}', ${index})" title="Remove">
                    <i class="fas fa-user-minus"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Deliverables Tab -->
        <div id="project-tab-deliverables" class="project-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <button class="btn-admin" onclick="addDeliverable('${project.id}')">
              <i class="fas fa-plus"></i> Add Deliverable
            </button>
          </div>

          <div id="deliverables-list">
            ${deliverables.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
                <i class="fas fa-box" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No deliverables defined. Add expected project deliverables.</p>
              </div>
            ` : deliverables.map((d, index) => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${d.delivered ? '#10b981' : '#f59e0b'}; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                      <input type="checkbox" ${d.delivered ? 'checked' : ''} onchange="toggleDeliverable('${project.id}', ${index})" style="cursor: pointer;">
                      <strong style="${d.delivered ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${d.name}</strong>
                      ${d.deliveryDate ? `<span style="font-size: 0.85rem; color: var(--dashboard-text-muted);"><i class="fas fa-calendar"></i> ${new Date(d.deliveryDate).toLocaleDateString()}</span>` : ''}
                    </div>
                    ${d.description ? `<p style="margin: 0.5rem 0 0 1.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${d.description}</p>` : ''}
                  </div>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="editDeliverable('${project.id}', ${index})" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteDeliverable('${project.id}', ${index})" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        <button class="btn-admin" onclick="editProject('${project.id}')">
          <i class="fas fa-edit"></i> Edit Project
        </button>
      </div>
    `);

    // Add tab switching styles
    const style = document.createElement('style');
    style.textContent = `
      .project-tab {
        padding: 0.75rem 1.5rem;
        background: rgba(255,255,255,0.05);
        border: none;
        border-bottom: 3px solid transparent;
        color: var(--dashboard-text);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.95rem;
      }
      .project-tab:hover {
        background: rgba(255,255,255,0.1);
      }
      .project-tab.active {
        border-bottom-color: var(--dashboard-primary);
        background: rgba(197, 0, 119, 0.1);
      }
    `;
    document.head.appendChild(style);
  };

  window.switchProjectTab = function(event, tabName) {
    // Store current tab
    window.currentProjectTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.project-tab').forEach(tab => tab.classList.remove('active'));
    event.target.closest('.project-tab').classList.add('active');

    // Update tab content
    document.querySelectorAll('.project-tab-content').forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    const targetContent = document.getElementById(`project-tab-${tabName}`);
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
    }
  };

  // Helper function to refresh project modal content without closing
  window.refreshProjectTabContent = function(projectId, tabName) {
    if (!tabName) tabName = window.currentProjectTab || 'overview';

    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const client = project.clientId ? DataManager.clients.getById(project.clientId) : null;
    const milestones = project.milestones || [];
    const files = project.files || [];
    const team = project.team || [];
    const deliverables = project.deliverables || [];

    // Update specific tab content based on which tab is active
    if (tabName === 'milestones') {
      const milestonesList = document.getElementById('milestones-list');
      if (milestonesList) {
        milestonesList.innerHTML = milestones.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
            <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>No milestones yet. Add your first milestone to track progress.</p>
          </div>
        ` : milestones.map((m, index) => `
          <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${m.completed ? '#10b981' : '#c50077'}; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${project.id}', ${index})" style="cursor: pointer;">
                  <strong style="${m.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${m.title}</strong>
                  ${m.dueDate ? `<span style="font-size: 0.85rem; color: var(--dashboard-text-muted);"><i class="fas fa-calendar"></i> ${new Date(m.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
                ${m.description ? `<p style="margin: 0.5rem 0 0 1.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${m.description}</p>` : ''}
              </div>
              <div class="table-actions">
                <button class="btn-icon" onclick="editMilestone('${project.id}', ${index})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" onclick="deleteMilestone('${project.id}', ${index})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    } else if (tabName === 'deliverables') {
      const deliverablesList = document.getElementById('deliverables-list');
      if (deliverablesList) {
        deliverablesList.innerHTML = deliverables.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">
            <i class="fas fa-box" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>No deliverables defined. Add expected project deliverables.</p>
          </div>
        ` : deliverables.map((d, index) => `
          <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${d.delivered ? '#10b981' : '#f59e0b'}; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <input type="checkbox" ${d.delivered ? 'checked' : ''} onchange="toggleDeliverable('${project.id}', ${index})" style="cursor: pointer;">
                  <strong style="${d.delivered ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${d.name}</strong>
                  ${d.deliveryDate ? `<span style="font-size: 0.85rem; color: var(--dashboard-text-muted);"><i class="fas fa-calendar"></i> ${new Date(d.deliveryDate).toLocaleDateString()}</span>` : ''}
                </div>
                ${d.description ? `<p style="margin: 0.5rem 0 0 1.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${d.description}</p>` : ''}
              </div>
              <div class="table-actions">
                <button class="btn-icon" onclick="editDeliverable('${project.id}', ${index})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" onclick="deleteDeliverable('${project.id}', ${index})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  };

  // ============================================
  // Milestone Functions
  // ============================================
  window.addMilestone = function(projectId) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Add Milestone</h3>
        <form id="milestone-form" onsubmit="submitMilestone(event, '${projectId}')">
          <div class="admin-form-group">
            <label>Title *</label>
            <input type="text" id="milestone-title" required placeholder="e.g., Initial Design Concepts">
          </div>
          <div class="admin-form-group">
            <label>Description</label>
            <textarea id="milestone-description" rows="3" placeholder="Additional details..."></textarea>
          </div>
          <div class="admin-form-group">
            <label>Due Date</label>
            <input type="date" id="milestone-dueDate">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Add Milestone</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitMilestone = function(event, projectId) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const milestone = {
      title: document.getElementById('milestone-title').value,
      description: document.getElementById('milestone-description').value,
      dueDate: document.getElementById('milestone-dueDate').value,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const milestones = project.milestones || [];
    milestones.push(milestone);
    DataManager.projects.update(projectId, { milestones });

    document.querySelector('.admin-modal-overlay').remove();
    refreshProjectTabContent(projectId, 'milestones');
  };

  window.editMilestone = function(projectId, index) {
    const project = DataManager.projects.getById(projectId);
    if (!project || !project.milestones[index]) return;

    const milestone = project.milestones[index];
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Edit Milestone</h3>
        <form id="edit-milestone-form" onsubmit="submitEditMilestone(event, '${projectId}', ${index})">
          <div class="admin-form-group">
            <label>Title *</label>
            <input type="text" id="edit-milestone-title" required value="${milestone.title}">
          </div>
          <div class="admin-form-group">
            <label>Description</label>
            <textarea id="edit-milestone-description" rows="3">${milestone.description || ''}</textarea>
          </div>
          <div class="admin-form-group">
            <label>Due Date</label>
            <input type="date" id="edit-milestone-dueDate" value="${milestone.dueDate || ''}">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitEditMilestone = function(event, projectId, index) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const milestones = project.milestones || [];
    milestones[index] = {
      ...milestones[index],
      title: document.getElementById('edit-milestone-title').value,
      description: document.getElementById('edit-milestone-description').value,
      dueDate: document.getElementById('edit-milestone-dueDate').value
    };

    DataManager.projects.update(projectId, { milestones });
    document.querySelector('.admin-modal-overlay').remove();
    refreshProjectTabContent(projectId, 'milestones');
  };

  window.deleteMilestone = function(projectId, index) {
    if (!confirm('Delete this milestone?')) return;

    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const milestones = project.milestones || [];
    milestones.splice(index, 1);
    DataManager.projects.update(projectId, { milestones });

    refreshProjectTabContent(projectId, 'milestones');
  };

  window.toggleMilestone = function(projectId, index) {
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const milestones = project.milestones || [];
    milestones[index].completed = !milestones[index].completed;
    DataManager.projects.update(projectId, { milestones });

    refreshProjectTabContent(projectId, 'milestones');
  };

  // ============================================
  // File Functions
  // ============================================
  window.uploadProjectFile = function(projectId) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Upload File</h3>
        <form id="file-upload-form" onsubmit="submitFileUpload(event, '${projectId}')">
          <div class="admin-form-group">
            <label>File Name *</label>
            <input type="text" id="file-name" required placeholder="e.g., Logo Design V2.pdf">
          </div>
          <div class="admin-form-group">
            <label>File URL or Description *</label>
            <input type="text" id="file-url" required placeholder="https://... or file description">
            <small style="color: var(--dashboard-text-muted); display: block; margin-top: 0.5rem;">
              Note: This is a demo. In production, this would handle actual file uploads.
            </small>
          </div>
          <div class="admin-form-group">
            <label>File Size (KB)</label>
            <input type="number" id="file-size" placeholder="e.g., 1024">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Upload</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitFileUpload = function(event, projectId) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const file = {
      name: document.getElementById('file-name').value,
      url: document.getElementById('file-url').value,
      size: document.getElementById('file-size').value ? parseInt(document.getElementById('file-size').value) : null,
      uploadedAt: new Date().toISOString()
    };

    const files = project.files || [];
    files.push(file);
    DataManager.projects.update(projectId, { files });

    document.querySelector('.admin-modal-overlay').remove();
    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  window.downloadProjectFile = function(projectId, index) {
    const project = DataManager.projects.getById(projectId);
    if (!project || !project.files[index]) return;

    const file = project.files[index];
    if (file.url && file.url.startsWith('http')) {
      window.open(file.url, '_blank');
    } else {
      alert(`File: ${file.name}\nURL/Description: ${file.url}\n\nNote: This is a demo. In production, this would download the actual file.`);
    }
  };

  window.deleteProjectFile = function(projectId, index) {
    if (!confirm('Delete this file?')) return;

    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const files = project.files || [];
    files.splice(index, 1);
    DataManager.projects.update(projectId, { files });

    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  // ============================================
  // Team Functions
  // ============================================
  window.addTeamMember = function(projectId) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Add Team Member</h3>
        <form id="team-member-form" onsubmit="submitTeamMember(event, '${projectId}')">
          <div class="admin-form-group">
            <label>Name *</label>
            <input type="text" id="member-name" required placeholder="e.g., John Doe">
          </div>
          <div class="admin-form-group">
            <label>Role *</label>
            <input type="text" id="member-role" required placeholder="e.g., Lead Designer">
          </div>
          <div class="admin-form-group">
            <label>Email</label>
            <input type="email" id="member-email" placeholder="john@example.com">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Add Member</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitTeamMember = function(event, projectId) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const member = {
      name: document.getElementById('member-name').value,
      role: document.getElementById('member-role').value,
      email: document.getElementById('member-email').value,
      addedAt: new Date().toISOString()
    };

    const team = project.team || [];
    team.push(member);
    DataManager.projects.update(projectId, { team });

    document.querySelector('.admin-modal-overlay').remove();
    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  window.removeTeamMember = function(projectId, index) {
    if (!confirm('Remove this team member from the project?')) return;

    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const team = project.team || [];
    team.splice(index, 1);
    DataManager.projects.update(projectId, { team });

    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  // ============================================
  // Deliverable Functions
  // ============================================
  window.addDeliverable = function(projectId) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Add Deliverable</h3>
        <form id="deliverable-form" onsubmit="submitDeliverable(event, '${projectId}')">
          <div class="admin-form-group">
            <label>Deliverable Name *</label>
            <input type="text" id="deliverable-name" required placeholder="e.g., Final Website Launch">
          </div>
          <div class="admin-form-group">
            <label>Description</label>
            <textarea id="deliverable-description" rows="3" placeholder="Details about this deliverable..."></textarea>
          </div>
          <div class="admin-form-group">
            <label>Expected Delivery Date</label>
            <input type="date" id="deliverable-date">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Add Deliverable</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitDeliverable = function(event, projectId) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const deliverable = {
      name: document.getElementById('deliverable-name').value,
      description: document.getElementById('deliverable-description').value,
      deliveryDate: document.getElementById('deliverable-date').value,
      delivered: false,
      createdAt: new Date().toISOString()
    };

    const deliverables = project.deliverables || [];
    deliverables.push(deliverable);
    DataManager.projects.update(projectId, { deliverables });

    document.querySelector('.admin-modal-overlay').remove();
    refreshProjectTabContent(projectId, 'deliverables');
  };

  window.editDeliverable = function(projectId, index) {
    const project = DataManager.projects.getById(projectId);
    if (!project || !project.deliverables[index]) return;

    const deliverable = project.deliverables[index];
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <h3 style="margin-top: 0;">Edit Deliverable</h3>
        <form id="edit-deliverable-form" onsubmit="submitEditDeliverable(event, '${projectId}', ${index})">
          <div class="admin-form-group">
            <label>Deliverable Name *</label>
            <input type="text" id="edit-deliverable-name" required value="${deliverable.name}">
          </div>
          <div class="admin-form-group">
            <label>Description</label>
            <textarea id="edit-deliverable-description" rows="3">${deliverable.description || ''}</textarea>
          </div>
          <div class="admin-form-group">
            <label>Expected Delivery Date</label>
            <input type="date" id="edit-deliverable-date" value="${deliverable.deliveryDate || ''}">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitEditDeliverable = function(event, projectId, index) {
    event.preventDefault();
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const deliverables = project.deliverables || [];
    deliverables[index] = {
      ...deliverables[index],
      name: document.getElementById('edit-deliverable-name').value,
      description: document.getElementById('edit-deliverable-description').value,
      deliveryDate: document.getElementById('edit-deliverable-date').value
    };

    DataManager.projects.update(projectId, { deliverables });
    document.querySelector('.admin-modal-overlay').remove();
    refreshProjectTabContent(projectId, 'deliverables');
  };

  window.deleteDeliverable = function(projectId, index) {
    if (!confirm('Delete this deliverable?')) return;

    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const deliverables = project.deliverables || [];
    deliverables.splice(index, 1);
    DataManager.projects.update(projectId, { deliverables });

    refreshProjectTabContent(projectId, 'deliverables');
  };

  window.toggleDeliverable = function(projectId, index) {
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const deliverables = project.deliverables || [];
    deliverables[index].delivered = !deliverables[index].delivered;
    DataManager.projects.update(projectId, { deliverables });

    refreshProjectTabContent(projectId, 'deliverables');
  };

  // ============================================
  // Project Notes Function
  // ============================================
  window.editProjectNotes = function(projectId) {
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    modal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%;">
        <h3 style="margin-top: 0;">Edit Internal Notes</h3>
        <form id="notes-form" onsubmit="submitProjectNotes(event, '${projectId}')">
          <div class="admin-form-group">
            <label>Notes (Internal Only)</label>
            <textarea id="project-notes" rows="8" placeholder="Add internal notes about this project...">${project.notes || ''}</textarea>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-admin" style="flex: 1;">Save Notes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitProjectNotes = function(event, projectId) {
    event.preventDefault();
    const notes = document.getElementById('project-notes').value;
    DataManager.projects.update(projectId, { notes });

    document.querySelector('.admin-modal-overlay').remove();
    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  window.showCreateProjectModal = function(prefill = {}) {
    const clients = DataManager.clients.getAll();

    showModal(`
      <div class="admin-modal-header">
        <h3>Create New Project</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="create-project-form">
          <div class="admin-form-group">
            <label>Project Title *</label>
            <input type="text" name="title" required value="${prefill.title || ''}">
          </div>

          <div class="admin-form-group">
            <label>Description</label>
            <textarea name="description" rows="4">${prefill.description || ''}</textarea>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Category *</label>
              <select name="category" required>
                <option value="marketing">Marketing & Branding</option>
                <option value="development">Web & App Development</option>
                <option value="automation">Automation & BI</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label>Status *</label>
              <select name="status" required>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="launching">Launching</option>
                <option value="optimizing">Optimizing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Start Date</label>
              <input type="date" name="startDate">
            </div>

            <div class="admin-form-group">
              <label>End Date</label>
              <input type="date" name="endDate">
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Budget (€)</label>
              <input type="number" name="budget" min="0" step="100">
            </div>

            <div class="admin-form-group">
              <label>Assign to Client</label>
              <select name="clientId">
                <option value="">Unassigned</option>
                ${clients.map(c => `
                  <option value="${c.id}">${c.firstName} ${c.lastName} (${c.email})</option>
                `).join('')}
              </select>
            </div>
          </div>

          ${prefill.consultationId ? `<input type="hidden" name="consultationId" value="${prefill.consultationId}">` : ''}
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitCreateProject()">
          <i class="fas fa-plus"></i> Create Project
        </button>
      </div>
    `);
  };

  window.submitCreateProject = function() {
    const form = document.getElementById('create-project-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Create project
    const project = DataManager.projects.create({
      ...data,
      budget: parseFloat(data.budget) || 0,
      clientId: data.clientId || null,
      progress: 0
    });

    // If from consultation, mark it as converted
    if (data.consultationId) {
      DataManager.consultations.update(data.consultationId, {
        status: 'converted',
        projectId: project.id
      });
    }

    closeModal();
    loadProjects();
  };

  window.editProject = function(projectId) {
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    const clients = DataManager.clients.getAll();

    showModal(`
      <div class="admin-modal-header">
        <h3>Edit Project</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="edit-project-form">
          <input type="hidden" name="projectId" value="${project.id}">

          <div class="admin-form-group">
            <label>Project Title *</label>
            <input type="text" name="title" required value="${project.title}">
          </div>

          <div class="admin-form-group">
            <label>Description</label>
            <textarea name="description" rows="4">${project.description || ''}</textarea>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Category *</label>
              <select name="category" required>
                <option value="marketing" ${project.category === 'marketing' ? 'selected' : ''}>Marketing & Branding</option>
                <option value="development" ${project.category === 'development' ? 'selected' : ''}>Web & App Development</option>
                <option value="automation" ${project.category === 'automation' ? 'selected' : ''}>Automation & BI</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label>Status *</label>
              <select name="status" required>
                <option value="pending" ${project.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${project.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="launching" ${project.status === 'launching' ? 'selected' : ''}>Launching</option>
                <option value="optimizing" ${project.status === 'optimizing' ? 'selected' : ''}>Optimizing</option>
                <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Progress (%)</label>
              <input type="number" name="progress" min="0" max="100" value="${project.progress || 0}">
            </div>

            <div class="admin-form-group">
              <label>Budget (€)</label>
              <input type="number" name="budget" min="0" step="100" value="${project.budget || 0}">
            </div>
          </div>

          <div class="admin-form-group">
            <label>Notes</label>
            <textarea name="notes" rows="3">${project.notes || ''}</textarea>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitEditProject()">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    `);
  };

  window.submitEditProject = function() {
    const form = document.getElementById('edit-project-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    DataManager.projects.update(data.projectId, {
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      progress: parseInt(data.progress) || 0,
      budget: parseFloat(data.budget) || 0,
      notes: data.notes
    });

    closeModal();
    loadProjects();
  };

  window.assignClient = function(projectId) {
    const project = DataManager.projects.getById(projectId);
    const clients = DataManager.clients.getAll();

    showModal(`
      <div class="admin-modal-header">
        <h3>Assign Client to Project</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="assign-client-form">
          <input type="hidden" name="projectId" value="${projectId}">

          <div class="admin-form-group">
            <label>Project</label>
            <input type="text" value="${project.title}" disabled>
          </div>

          <div class="admin-form-group">
            <label>Select Client *</label>
            <select name="clientId" required>
              <option value="">Select a client...</option>
              ${clients.map(c => `
                <option value="${c.id}" ${project.clientId === c.id ? 'selected' : ''}>
                  ${c.firstName} ${c.lastName} (${c.email})
                </option>
              `).join('')}
            </select>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitAssignClient()">
          <i class="fas fa-check"></i> Assign
        </button>
      </div>
    `);
  };

  window.submitAssignClient = function() {
    const form = document.getElementById('assign-client-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    DataManager.projects.update(data.projectId, {
      clientId: data.clientId
    });

    closeModal();
    loadProjects();
  };

  window.deleteProject = function(projectId) {
    const project = DataManager.projects.getById(projectId);
    if (!project) return;

    if (confirm(`Are you sure you want to delete project "${project.title}"? This action cannot be undone.`)) {
      DataManager.projects.delete(projectId);
      loadProjects();
    }
  };

  // ============================================
  // Clients Section
  // ============================================
  function loadClients() {
    const clients = DataManager.clients.getAll();

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1>Clients Management</h1>
        <div class="admin-actions">
          <button class="btn-admin" onclick="showCreateClientModal()">
            <i class="fas fa-user-plus"></i>
            Add Client
          </button>
        </div>
      </div>

      ${clients.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <h3>No Clients</h3>
          <p>Add your first client to get started</p>
        </div>
      ` : `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Projects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${clients.map(c => {
                const projects = DataManager.projects.getByClient(c.id);
                return `
                  <tr>
                    <td><strong>${c.firstName} ${c.lastName}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.company || 'N/A'}</td>
                    <td>${projects.length} project(s)</td>
                    <td><span class="status-badge ${c.status || 'active'}">${c.status || 'active'}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick="viewClient('${c.id}')" title="View">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="editClient('${c.id}')" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteClient('${c.id}')" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

  window.showCreateClientModal = function() {
    showModal(`
      <div class="admin-modal-header">
        <h3>Add New Client</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="create-client-form">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" required>
            </div>

            <div class="admin-form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" required>
            </div>
          </div>

          <div class="admin-form-group">
            <label>Email *</label>
            <input type="email" name="email" required>
          </div>

          <div class="admin-form-group">
            <label>Company</label>
            <input type="text" name="company">
          </div>

          <div class="admin-form-group">
            <label>Phone</label>
            <input type="tel" name="phone">
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitCreateClient()">
          <i class="fas fa-user-plus"></i> Add Client
        </button>
      </div>
    `);
  };

  window.submitCreateClient = function() {
    const form = document.getElementById('create-client-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    DataManager.clients.create(data);

    closeModal();
    loadClients();
  };

  window.viewProjectDetailsFromClient = function(projectId) {
    closeModal();
    setTimeout(() => viewProjectDetails(projectId), 100);
  };

  window.viewClient = function(clientId) {
    const client = DataManager.clients.getById(clientId);
    const projects = DataManager.projects.getByClient(clientId);
    const invoices = DataManager.invoices.getByClient(clientId);

    showModal(`
      <div class="admin-modal-header">
        <h3>Client Details</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
          <div><strong>Name:</strong> ${client.firstName} ${client.lastName}</div>
          <div><strong>Email:</strong> ${client.email}</div>
          <div><strong>Company:</strong> ${client.company || 'N/A'}</div>
          <div><strong>Phone:</strong> ${client.phone || 'N/A'}</div>
        </div>

        <h4 style="margin-bottom: 1rem;">Projects (${projects.length})</h4>
        ${projects.length > 0 ? `
          <ul style="list-style: none; padding: 0; margin-bottom: 2rem;">
            ${projects.map(p => `
              <li onclick="viewProjectDetailsFromClient('${p.id}')" style="padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(197, 0, 119, 0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${p.title}</strong>
                    <div style="font-size: 0.85rem; color: var(--dashboard-text-muted); margin-top: 0.3rem;">
                      ${p.category || 'N/A'} • ${p.progress}% complete
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="status-badge ${p.status}">${p.status}</span>
                    <i class="fas fa-chevron-right" style="color: var(--dashboard-primary);"></i>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color: var(--dashboard-text-muted); margin-bottom: 2rem;">No projects assigned</p>'}

        <h4 style="margin-bottom: 1rem;">Invoices (${invoices.length})</h4>
        ${invoices.length > 0 ? `
          <ul style="list-style: none; padding: 0;">
            ${invoices.map(i => `
              <li style="padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${i.invoiceNumber}</strong> - €${i.amount.toLocaleString()}</span>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="status-badge ${i.status}">${i.status}</span>
                  <button class="btn-icon" onclick="viewInvoiceFromAdmin('${i.id}')" title="View Invoice">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color: var(--dashboard-text-muted);">No invoices</p>'}
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        <button class="btn-admin" onclick="editClient('${clientId}')">
          <i class="fas fa-edit"></i> Edit Client
        </button>
      </div>
    `);
  };

  // ============================================
  // Invoice View Functions
  // ============================================
  window.viewInvoiceFromAdmin = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);
    if (!invoice) return;

    const client = DataManager.clients.getById(invoice.clientId);
    const project = invoice.projectId ? DataManager.projects.getById(invoice.projectId) : null;

    const innerModal = document.createElement('div');
    innerModal.className = 'admin-modal-overlay';
    innerModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    innerModal.innerHTML = `
      <div style="background: var(--dashboard-card); border-radius: 12px; padding: 2rem; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid var(--dashboard-border); padding-bottom: 1rem;">
          <h2 style="margin: 0;">Invoice #${invoice.invoiceNumber}</h2>
          <button class="btn-icon" onclick="this.closest('.admin-modal-overlay').remove()" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Client</div>
            <strong>${client ? `${client.firstName} ${client.lastName}` : 'N/A'}</strong>
          </div>
          <div>
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Status</div>
            <span class="status-badge ${invoice.status}">${invoice.status}</span>
          </div>
          <div>
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Issue Date</div>
            <strong>${new Date(invoice.issueDate).toLocaleDateString()}</strong>
          </div>
          <div>
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Due Date</div>
            <strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong>
          </div>
        </div>

        ${project ? `
          <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Project</div>
            <strong>${project.title}</strong>
          </div>
        ` : ''}

        ${invoice.description ? `
          <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">Description</div>
            <p style="margin: 0; white-space: pre-wrap;">${invoice.description}</p>
          </div>
        ` : ''}

        <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(197, 0, 119, 0.1), rgba(255, 0, 149, 0.05)); border-radius: 8px; border: 2px solid var(--dashboard-primary); text-align: center;">
          <div style="color: var(--dashboard-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">Total Amount</div>
          <div style="font-size: 2rem; font-weight: bold; color: var(--dashboard-primary);">€${invoice.amount.toLocaleString()}</div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn-admin secondary" onclick="this.closest('.admin-modal-overlay').remove()" style="flex: 1;">Close</button>
          <button class="btn-admin" onclick="downloadInvoiceFromAdmin('${invoice.id}')" style="flex: 1;">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(innerModal);
  };

  window.downloadInvoiceFromAdmin = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);
    if (!invoice) return;

    const client = DataManager.clients.getById(invoice.clientId);
    const project = invoice.projectId ? DataManager.projects.getById(invoice.projectId) : null;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 2rem; border-bottom: 3px solid #c50077; padding-bottom: 1rem; }
          .header h1 { color: #c50077; margin: 0; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
          .detail-group { padding: 1rem; background: #f5f5f5; border-radius: 8px; }
          .label { font-size: 0.85rem; color: #666; margin-bottom: 0.3rem; }
          .value { font-weight: bold; }
          .total { text-align: center; padding: 2rem; background: linear-gradient(135deg, rgba(197, 0, 119, 0.1), rgba(255, 0, 149, 0.05)); border: 2px solid #c50077; border-radius: 8px; margin-top: 2rem; }
          .total .amount { font-size: 2rem; color: #c50077; font-weight: bold; }
          .status { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: #10b981; color: white; }
          .status.pending { background: #f59e0b; }
          .status.overdue { background: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice #${invoice.invoiceNumber}</h1>
          <p>Your Marketing Company</p>
        </div>

        <div class="details">
          <div class="detail-group">
            <div class="label">Client</div>
            <div class="value">${client ? `${client.firstName} ${client.lastName}` : 'N/A'}</div>
          </div>
          <div class="detail-group">
            <div class="label">Status</div>
            <div class="value"><span class="status ${invoice.status}">${invoice.status}</span></div>
          </div>
          <div class="detail-group">
            <div class="label">Issue Date</div>
            <div class="value">${new Date(invoice.issueDate).toLocaleDateString()}</div>
          </div>
          <div class="detail-group">
            <div class="label">Due Date</div>
            <div class="value">${new Date(invoice.dueDate).toLocaleDateString()}</div>
          </div>
        </div>

        ${project ? `
          <div class="detail-group" style="margin-bottom: 1.5rem;">
            <div class="label">Project</div>
            <div class="value">${project.title}</div>
          </div>
        ` : ''}

        ${invoice.description ? `
          <div class="detail-group" style="margin-bottom: 1.5rem;">
            <div class="label">Description</div>
            <div class="value" style="white-space: pre-wrap;">${invoice.description}</div>
          </div>
        ` : ''}

        <div class="total">
          <div class="label">Total Amount</div>
          <div class="amount">€${invoice.amount.toLocaleString()}</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  window.editClient = function(clientId) {
    const client = DataManager.clients.getById(clientId);
    if (!client) return;

    showModal(`
      <div class="admin-modal-header">
        <h3>Edit Client</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="edit-client-form">
          <input type="hidden" name="clientId" value="${client.id}">

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value="${client.firstName}" required>
            </div>

            <div class="admin-form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value="${client.lastName}" required>
            </div>
          </div>

          <div class="admin-form-group">
            <label>Email *</label>
            <input type="email" name="email" value="${client.email}" required>
          </div>

          <div class="admin-form-group">
            <label>Company</label>
            <input type="text" name="company" value="${client.company || ''}">
          </div>

          <div class="admin-form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value="${client.phone || ''}">
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitEditClient()">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    `);
  };

  window.submitEditClient = function() {
    const form = document.getElementById('edit-client-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    DataManager.clients.update(data.clientId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      company: data.company,
      phone: data.phone
    });

    closeModal();
    loadClients();
  };

  window.deleteClient = function(clientId) {
    const client = DataManager.clients.getById(clientId);
    const projects = DataManager.projects.getByClient(clientId);

    if (projects.length > 0) {
      alert(`Cannot delete client "${client.firstName} ${client.lastName}" because they have ${projects.length} active project(s). Please reassign or delete these projects first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete client "${client.firstName} ${client.lastName}"?`)) {
      DataManager.clients.delete(clientId);
      loadClients();
    }
  };

  // ============================================
  // Messages/Tickets Section
  // ============================================
  let currentAdminTicketId = null;

  function loadMessages() {
    const tickets = DataManager.tickets.getAll();
    updateMessagesBadge();

    if (tickets.length === 0) {
      mainContent.innerHTML = `
        <h1>Support Tickets</h1>
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <h3>No Tickets Yet</h3>
          <p>Support tickets from clients will appear here</p>
        </div>
      `;
      return;
    }

    // Group tickets by status
    const openTickets = tickets.filter(t => t.status === 'open');
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    const closedTickets = tickets.filter(t => t.status === 'closed');

    mainContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Support Tickets</h1>
        <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
          <span style="color: var(--dashboard-text-muted);">
            <strong>${openTickets.length}</strong> Open
          </span>
          <span style="color: var(--dashboard-text-muted);">
            <strong>${inProgressTickets.length}</strong> In Progress
          </span>
          <span style="color: var(--dashboard-text-muted);">
            <strong>${resolvedTickets.length}</strong> Resolved
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 400px 1fr; gap: 2rem;">
        <!-- Ticket List -->
        <div>
          <div style="margin-bottom: 1rem;">
            <select id="ticket-filter" onchange="filterAdminTickets(this.value)" style="width: 100%; padding: 0.6rem; background: var(--dashboard-card); border: 1px solid var(--dashboard-border); border-radius: 8px; color: var(--dashboard-text);">
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div id="tickets-list-container" style="display: flex; flex-direction: column; gap: 0.8rem; max-height: calc(100vh - 300px); overflow-y: auto;">
            ${renderAdminTicketsList(tickets)}
          </div>
        </div>

        <!-- Ticket Conversation -->
        <div id="ticket-conversation-container">
          ${tickets.length > 0 ? renderAdminTicketConversation(tickets[0]) : `
            <div style="text-align: center; padding: 3rem; color: var(--dashboard-text-muted);">
              <i class="fas fa-ticket-alt" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
              <p>Select a ticket to view conversation</p>
            </div>
          `}
        </div>
      </div>
    `;

    // Auto-select first ticket
    if (tickets.length > 0) {
      currentAdminTicketId = tickets[0].id;
    }

    // Scroll ticket conversation to bottom
    setTimeout(() => {
      const threadBody = document.getElementById('admin-ticket-thread');
      if (threadBody) {
        threadBody.scrollTop = threadBody.scrollHeight;
      }
    }, 100);
  }

  function renderAdminTicketsList(tickets, filterStatus = 'all') {
    const filtered = filterStatus === 'all' ? tickets : tickets.filter(t => t.status === filterStatus);

    if (filtered.length === 0) {
      return `<div style="text-align: center; padding: 2rem; color: var(--dashboard-text-muted);">No tickets in this category</div>`;
    }

    // Sort by updated date (newest first)
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return filtered.map(ticket => {
      const client = DataManager.clients.getById(ticket.clientId);
      const unreadCount = ticket.messages.filter(m => !m.fromAdmin && !m.read).length;

      const categoryIcons = {
        'project_inquiry': 'fa-project-diagram',
        'billing': 'fa-file-invoice-dollar',
        'feature_request': 'fa-lightbulb',
        'technical_support': 'fa-tools',
        'general': 'fa-question-circle'
      };

      const statusClasses = {
        'open': 'ticket-status-open',
        'in_progress': 'ticket-status-progress',
        'resolved': 'ticket-status-resolved',
        'closed': 'ticket-status-closed'
      };

      const statusLabels = {
        'open': 'Open',
        'in_progress': 'In Progress',
        'resolved': 'Resolved',
        'closed': 'Closed'
      };

      const priorityColors = {
        'low': '#999',
        'normal': '#3b82f6',
        'high': '#f59e0b',
        'urgent': '#ef4444'
      };

      return `
        <div class="admin-ticket-card ${currentAdminTicketId === ticket.id ? 'active' : ''}"
             onclick="loadAdminTicketConversation('${ticket.id}')"
             style="background: var(--dashboard-card); border: 1px solid var(--dashboard-border); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.3s ease; ${unreadCount > 0 ? 'border-left: 3px solid var(--dashboard-primary);' : ''}">
          <div style="display: flex; justify-content: between; align-items: start; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fas ${categoryIcons[ticket.category]}" style="color: var(--dashboard-primary); margin-top: 0.2rem;"></i>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--dashboard-text); margin-bottom: 0.3rem;">${ticket.subject}</div>
              <div style="font-size: 0.85rem; color: var(--dashboard-text-muted);">
                ${client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; font-size: 0.8rem;">
            <span class="${statusClasses[ticket.status]}" style="padding: 0.2rem 0.6rem; border-radius: 12px;">
              ${statusLabels[ticket.status]}
            </span>
            <span style="color: ${priorityColors[ticket.priority]}; font-weight: 600; text-transform: uppercase;">
              ${ticket.priority}
            </span>
            ${unreadCount > 0 ? `<span style="background: var(--dashboard-primary); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 600;">${unreadCount}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  window.filterAdminTickets = function(status) {
    const tickets = DataManager.tickets.getAll();
    const listContainer = document.getElementById('tickets-list-container');
    listContainer.innerHTML = renderAdminTicketsList(tickets, status);
  };

  window.loadAdminTicketConversation = function(ticketId) {
    currentAdminTicketId = ticketId;
    const ticket = DataManager.tickets.getById(ticketId);
    if (!ticket) return;

    // Mark messages as read (admin reading client messages)
    DataManager.tickets.markMessagesAsRead(ticketId, true);

    const container = document.getElementById('ticket-conversation-container');
    container.innerHTML = renderAdminTicketConversation(ticket);

    // Update ticket list to remove unread indicators
    const listContainer = document.getElementById('tickets-list-container');
    const filterValue = document.getElementById('ticket-filter').value;
    listContainer.innerHTML = renderAdminTicketsList(DataManager.tickets.getAll(), filterValue);

    // Scroll to bottom
    setTimeout(() => {
      const threadBody = document.getElementById('admin-ticket-thread');
      if (threadBody) {
        threadBody.scrollTop = threadBody.scrollHeight;
      }
    }, 100);

    updateMessagesBadge();
  };

  function renderAdminTicketConversation(ticket) {
    const client = DataManager.clients.getById(ticket.clientId);

    const statusClasses = {
      'open': 'ticket-status-open',
      'in_progress': 'ticket-status-progress',
      'resolved': 'ticket-status-resolved',
      'closed': 'ticket-status-closed'
    };

    const statusLabels = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };

    const categoryLabels = {
      'project_inquiry': 'Project Inquiry',
      'billing': 'Billing',
      'feature_request': 'Feature Request',
      'technical_support': 'Technical Support',
      'general': 'General'
    };

    return `
      <div class="message-thread">
        <div class="message-thread-header">
          <div>
            <h3>${ticket.subject}</h3>
            <p style="margin: 0.3rem 0 0 0; color: var(--dashboard-text-muted); font-size: 0.9rem;">
              ${client ? `${client.firstName} ${client.lastName} (${client.email})` : 'Unknown Client'} •
              ${categoryLabels[ticket.category] || ticket.category}
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="${statusClasses[ticket.status]}" style="padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem;">
              ${statusLabels[ticket.status]}
            </span>
            <select
              onchange="updateTicketStatus('${ticket.id}', this.value)"
              style="padding: 0.4rem 0.8rem; background: var(--dashboard-card); border: 1px solid var(--dashboard-border); border-radius: 8px; color: var(--dashboard-text); font-size: 0.85rem;">
              <option value="">Change Status...</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div class="message-thread-body" id="admin-ticket-thread">
          ${ticket.messages.length === 0 ? `
            <div style="text-align: center; color: var(--dashboard-text-muted); padding: 2rem;">
              <i class="fas fa-comment-slash" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
              <p>No messages yet.</p>
            </div>
          ` : ticket.messages.map(msg => `
            <div class="message-bubble ${msg.fromAdmin ? 'from-admin' : 'from-client'}">
              <div class="message-bubble-sender">${msg.fromAdmin ? (msg.senderName || 'Admin Team') : (msg.senderName || client.firstName)}</div>
              <div class="message-bubble-text">${msg.message}</div>
              <div class="message-bubble-time">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>

        ${ticket.status !== 'closed' ? `
          <div class="message-thread-footer">
            <div class="message-input-group">
              <input
                type="text"
                id="admin-ticket-message-input"
                placeholder="Type your reply..."
                onkeypress="if(event.key==='Enter') sendAdminTicketReply('${ticket.id}')"
              >
              <button onclick="sendAdminTicketReply('${ticket.id}')">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 1rem; background: rgba(100, 100, 100, 0.1); color: var(--dashboard-text-muted);">
            <i class="fas fa-lock"></i> Ticket is closed
          </div>
        `}
      </div>
    `;
  }

  window.sendAdminTicketReply = function(ticketId) {
    const input = document.getElementById('admin-ticket-message-input');
    const message = input.value.trim();

    if (!message) {
      alert('Please enter a message');
      return;
    }

    // Add message to ticket
    DataManager.tickets.addMessage(ticketId, {
      fromAdmin: true,
      senderName: 'Waarheid Support Team',
      message: message
    });

    // Clear input
    input.value = '';

    // Reload conversation
    loadAdminTicketConversation(ticketId);
  };

  window.updateTicketStatus = function(ticketId, newStatus) {
    if (!newStatus) return;

    DataManager.tickets.updateStatus(ticketId, newStatus);

    // Reload conversation
    loadAdminTicketConversation(ticketId);

    // Update ticket list
    const filterValue = document.getElementById('ticket-filter').value;
    const listContainer = document.getElementById('tickets-list-container');
    listContainer.innerHTML = renderAdminTicketsList(DataManager.tickets.getAll(), filterValue);
  };

  // ============================================
  // Invoices Section
  // ============================================
  function loadInvoices() {
    const invoices = DataManager.invoices.getAll();

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1>Invoices Management</h1>
        <div class="admin-actions">
          <button class="btn-admin" onclick="showCreateInvoiceModal()">
            <i class="fas fa-plus"></i>
            New Invoice
          </button>
        </div>
      </div>

      ${invoices.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-file-invoice-dollar"></i>
          <h3>No Invoices</h3>
          <p>Create your first invoice to get started</p>
        </div>
      ` : `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => {
                const client = inv.clientId ? DataManager.clients.getById(inv.clientId) : null;
                const project = inv.projectId ? DataManager.projects.getById(inv.projectId) : null;
                return `
                  <tr>
                    <td><strong>${inv.invoiceNumber}</strong></td>
                    <td>${client ? client.firstName + ' ' + client.lastName : 'N/A'}</td>
                    <td>${project ? project.title : 'N/A'}</td>
                    <td>€${(inv.amount || 0).toLocaleString()}</td>
                    <td>${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick="viewInvoice('${inv.id}')" title="View">
                          <i class="fas fa-eye"></i>
                        </button>
                        ${inv.status === 'pending' || inv.status === 'overdue' ? `
                          <button class="btn-icon success" onclick="markInvoiceAsPaid('${inv.id}')" title="Mark as Paid">
                            <i class="fas fa-check"></i>
                          </button>
                        ` : ''}
                        ${inv.status === 'paid' ? `
                          <button class="btn-icon warning" onclick="markInvoiceAsUnpaid('${inv.id}')" title="Mark as Unpaid">
                            <i class="fas fa-undo"></i>
                          </button>
                        ` : ''}
                        <button class="btn-icon danger" onclick="deleteInvoice('${inv.id}')" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

  window.showCreateInvoiceModal = function() {
    const clients = DataManager.clients.getAll();
    const projects = DataManager.projects.getAll();

    showModal(`
      <div class="admin-modal-header">
        <h3>Create New Invoice</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="create-invoice-form">
          <div class="admin-form-group">
            <label>Client *</label>
            <select name="clientId" required>
              <option value="">Select client...</option>
              ${clients.map(c => `
                <option value="${c.id}">${c.firstName} ${c.lastName}</option>
              `).join('')}
            </select>
          </div>

          <div class="admin-form-group">
            <label>Project (optional)</label>
            <select name="projectId">
              <option value="">Select project...</option>
              ${projects.map(p => `
                <option value="${p.id}">${p.title}</option>
              `).join('')}
            </select>
          </div>

          <div class="admin-form-group">
            <label>Description *</label>
            <textarea name="description" rows="3" required></textarea>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Amount (€) *</label>
              <input type="number" name="amount" min="0" step="0.01" required>
            </div>

            <div class="admin-form-group">
              <label>Due Date *</label>
              <input type="date" name="dueDate" required>
            </div>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="submitCreateInvoice()">
          <i class="fas fa-plus"></i> Create Invoice
        </button>
      </div>
    `);
  };

  window.submitCreateInvoice = function() {
    const form = document.getElementById('create-invoice-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    DataManager.invoices.create({
      clientId: data.clientId,
      projectId: data.projectId || null,
      description: data.description,
      amount: parseFloat(data.amount),
      dueDate: data.dueDate
    });

    closeModal();
    loadInvoices();
  };

  window.viewInvoice = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);
    const client = invoice.clientId ? DataManager.clients.getById(invoice.clientId) : null;
    const project = invoice.projectId ? DataManager.projects.getById(invoice.projectId) : null;

    showModal(`
      <div class="admin-modal-header">
        <h3>Invoice Details</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div style="display: grid; gap: 1rem;">
          <div><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>Client:</strong> ${client ? client.firstName + ' ' + client.lastName : 'N/A'}</div>
          <div><strong>Project:</strong> ${project ? project.title : 'N/A'}</div>
          <div><strong>Description:</strong> ${invoice.description}</div>
          <div><strong>Amount:</strong> €${(invoice.amount || 0).toLocaleString()}</div>
          <div><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
          <div><strong>Status:</strong> <span class="status-badge ${invoice.status}">${invoice.status}</span></div>
          ${invoice.paidDate ? `<div><strong>Paid Date:</strong> ${new Date(invoice.paidDate).toLocaleDateString()}</div>` : ''}
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        ${invoice.status === 'pending' ? `
          <button class="btn-admin" onclick="markInvoiceAsPaid('${invoice.id}'); closeModal();">
            <i class="fas fa-check"></i> Mark as Paid
          </button>
        ` : ''}
      </div>
    `);
  };

  window.markInvoiceAsPaid = function(invoiceId) {
    DataManager.invoices.markAsPaid(invoiceId);
    loadInvoices();
  };

  window.markInvoiceAsUnpaid = function(invoiceId) {
    DataManager.invoices.markAsUnpaid(invoiceId);
    loadInvoices();
  };

  window.deleteInvoice = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);

    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      const invoices = DataManager.invoices.getAll();
      const filtered = invoices.filter(i => i.id !== invoiceId);
      localStorage.setItem('waarheid_invoices', JSON.stringify(filtered));
      loadInvoices();
    }
  };

  // ============================================
  // Analytics Section
  // ============================================
  function loadAnalytics() {
    mainContent.innerHTML = `
      <h1>Analytics & Reports</h1>

      <div class="admin-action-bar">
        <div class="date-range-selector">
          <button class="date-btn active">Last 7 Days</button>
          <button class="date-btn">Last 30 Days</button>
          <button class="date-btn">Last 90 Days</button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Total Impressions</span>
            <span class="kpi-value">124.5K</span>
            <span class="kpi-change positive">
              <i class="fas fa-arrow-up"></i> 12.5%
            </span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-mouse-pointer"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Click-Through Rate</span>
            <span class="kpi-value">3.8%</span>
            <span class="kpi-change positive">
              <i class="fas fa-arrow-up"></i> 8.2%
            </span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Conversions</span>
            <span class="kpi-value">1,247</span>
            <span class="kpi-change positive">
              <i class="fas fa-arrow-up"></i> 15.3%
            </span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Revenue Generated</span>
            <span class="kpi-value">€42.8K</span>
            <span class="kpi-change positive">
              <i class="fas fa-arrow-up"></i> 22.1%
            </span>
          </div>
        </div>
      </div>

      <div class="empty-state" style="margin-top: 3rem;">
        <i class="fas fa-chart-line"></i>
        <h3>Advanced Analytics Coming Soon</h3>
        <p>Detailed analytics dashboards with charts and graphs will be available here</p>
      </div>
    `;
  }

  // ============================================
  // Modal Management
  // ============================================
  function showModal(content) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="admin-modal active">
        <div class="admin-modal-overlay" onclick="closeModal()"></div>
        <div class="admin-modal-content">
          ${content}
        </div>
      </div>
    `;
    document.body.style.overflow = 'hidden';
  }

  window.closeModal = function() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
    document.body.style.overflow = '';
  };

  // Close modal on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // ============================================
  // Profile Section
  // ============================================
  function loadProfile() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userEmail = localStorage.getItem('userEmail') || '';
    const userRole = localStorage.getItem('userRole') || 'admin';

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1><i class="fas fa-user-circle"></i> My Profile</h1>
      </div>

      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; max-width: 1200px;">
        <!-- Profile Sidebar -->
        <div>
          <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; text-align: center;">
            <div style="width: 150px; height: 150px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #c50077, #ff0095); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-${userRole === 'admin' ? 'crown' : 'user'}" style="font-size: 4rem; color: white;"></i>
            </div>
            <h2 style="margin: 0 0 0.5rem 0;">${userData.firstName || 'Admin'} ${userData.lastName || 'User'}</h2>
            <p style="color: var(--dashboard-text-muted); margin: 0 0 1rem 0;">${userEmail}</p>
            <span class="status-badge active" style="text-transform: capitalize;">${userRole}</span>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
              <button class="btn-admin" onclick="editProfilePicture()" style="width: 100%; margin-bottom: 0.5rem;">
                <i class="fas fa-camera"></i> Change Photo
              </button>
              <button class="btn-admin secondary" onclick="loadSettings()" style="width: 100%;">
                <i class="fas fa-cog"></i> Settings
              </button>
            </div>
          </div>

          <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-chart-line"></i> Quick Stats</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Active Projects:</span>
                <strong>${DataManager.projects.getAll().filter(p => p.status === 'in_progress').length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Total Clients:</span>
                <strong>${DataManager.clients.getAll().length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Pending Requests:</span>
                <strong>${DataManager.consultations.getByStatus('pending').length}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <div>
          <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <h2 style="margin: 0;"><i class="fas fa-info-circle"></i> Personal Information</h2>
              <button class="btn-admin" onclick="editProfile()">
                <i class="fas fa-edit"></i> Edit Profile
              </button>
            </div>

            <form id="profile-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="admin-form-group">
                  <label style="color: white;">First Name</label>
                  <input type="text" id="profile-firstname" value="${userData.firstName || ''}" readonly>
                </div>
                <div class="admin-form-group">
                  <label style="color: white;">Last Name</label>
                  <input type="text" id="profile-lastname" value="${userData.lastName || ''}" readonly>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="admin-form-group">
                  <label style="color: white;">Email Address</label>
                  <input type="email" id="profile-email" value="${userEmail}" readonly>
                </div>
                <div class="admin-form-group">
                  <label style="color: white;">Phone Number</label>
                  <input type="tel" id="profile-phone" value="${userData.phone || ''}" readonly>
                </div>
              </div>

              <div class="admin-form-group" style="margin-bottom: 1.5rem;">
                <label style="color: white;">Company/Organization</label>
                <input type="text" id="profile-company" value="${userData.company || ''}" readonly>
              </div>

              <div class="admin-form-group" style="margin-bottom: 1.5rem;">
                <label style="color: white;">Address</label>
                <input type="text" id="profile-address" value="${userData.address || ''}" readonly>
              </div>

              <div class="admin-form-group">
                <label style="color: white;">Bio</label>
                <textarea id="profile-bio" rows="4" readonly>${userData.bio || ''}</textarea>
              </div>
            </form>
          </div>

          <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; margin-top: 1.5rem;">
            <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-clock"></i> Account Activity</h2>
            <div style="display: grid; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <span><i class="fas fa-calendar-plus" style="margin-right: 0.5rem; color: #c50077;"></i> Account Created:</span>
                <strong>${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <span><i class="fas fa-sign-in-alt" style="margin-right: 0.5rem; color: #c50077;"></i> Last Login:</span>
                <strong>Today</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.editProfile = function() {
    const inputs = ['profile-firstname', 'profile-lastname', 'profile-phone', 'profile-company', 'profile-address', 'profile-bio'];
    const isEditing = document.getElementById('profile-firstname').hasAttribute('readonly');

    if (isEditing) {
      // Enable editing
      inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.removeAttribute('readonly');
      });

      // Show save/cancel buttons
      const form = document.getElementById('profile-form');
      if (form && !document.getElementById('profile-actions')) {
        form.insertAdjacentHTML('afterend', `
          <div id="profile-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="btn-admin" onclick="saveProfile()" style="flex: 1;">
              <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="btn-admin secondary" onclick="loadProfile()" style="flex: 1;">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        `);
      }

      // Update edit button
      event.target.innerHTML = '<i class="fas fa-times"></i> Cancel Edit';
      event.target.onclick = () => loadProfile();
    }
  };

  window.saveProfile = function() {
    const userData = {
      firstName: document.getElementById('profile-firstname').value,
      lastName: document.getElementById('profile-lastname').value,
      phone: document.getElementById('profile-phone').value,
      company: document.getElementById('profile-company').value,
      address: document.getElementById('profile-address').value,
      bio: document.getElementById('profile-bio').value,
      email: localStorage.getItem('userEmail'),
      createdAt: JSON.parse(localStorage.getItem('userData') || '{}').createdAt || new Date().toISOString()
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Profile updated successfully!');
    loadProfile();
  };

  window.editProfilePicture = function() {
    alert('Profile picture upload functionality would be implemented here with a file upload dialog.');
  };

  // ============================================
  // Settings Section
  // ============================================
  function loadSettings() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userEmail = localStorage.getItem('userEmail') || '';

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1><i class="fas fa-cog"></i> Settings</h1>
      </div>

      <div style="max-width: 900px;">
        <!-- Account Settings -->
        <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-user-shield"></i> Account Security</h2>

          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Change Password</h3>
            <form id="change-password-form" onsubmit="changePassword(event)">
              <div class="admin-form-group" style="margin-bottom: 1rem;">
                <label style="color: white;">Current Password</label>
                <input type="password" id="current-password" required>
              </div>
              <div class="admin-form-group" style="margin-bottom: 1rem;">
                <label style="color: white;">New Password</label>
                <input type="password" id="new-password" required minlength="8">
              </div>
              <div class="admin-form-group" style="margin-bottom: 1rem;">
                <label style="color: white;">Confirm New Password</label>
                <input type="password" id="confirm-password" required>
              </div>
              <button type="submit" class="btn-admin">
                <i class="fas fa-key"></i> Update Password
              </button>
            </form>
          </div>

          <div style="padding: 1.5rem; background: rgba(197, 0, 119, 0.1); border: 1px solid rgba(197, 0, 119, 0.3); border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">
                  <i class="fas fa-shield-alt" style="color: #c50077;"></i> Two-Factor Authentication
                </h3>
                <p style="margin: 0; color: var(--dashboard-text-muted); font-size: 0.9rem;">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button class="btn-admin secondary" onclick="enable2FA()">
                <i class="fas fa-plus"></i> Enable
              </button>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-bell"></i> Notification Preferences</h2>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Email Notifications</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Receive email updates about your projects</div>
              </div>
              <input type="checkbox" id="email-notifications" checked onchange="saveNotificationSettings()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">SMS Notifications</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Get text messages for urgent updates</div>
              </div>
              <input type="checkbox" id="sms-notifications" onchange="saveNotificationSettings()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">New Consultation Alerts</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Notify me when new consultation requests arrive</div>
              </div>
              <input type="checkbox" id="consultation-alerts" checked onchange="saveNotificationSettings()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Project Updates</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Get notified about project milestones and changes</div>
              </div>
              <input type="checkbox" id="project-updates" checked onchange="saveNotificationSettings()" style="width: 20px; height: 20px;">
            </label>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-palette"></i> Appearance</h2>

          <div class="admin-form-group" style="margin-bottom: 1.5rem;">
            <label>Theme</label>
            <select id="theme-select" onchange="changeTheme(this.value)">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="auto">Auto (System Preference)</option>
            </select>
          </div>

          <div class="admin-form-group">
            <label>Language</label>
            <select id="language-select" onchange="changeLanguage(this.value)">
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <!-- Danger Zone -->
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2rem; border-radius: 12px;">
          <h2 style="margin: 0 0 1rem 0; color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Danger Zone</h2>
          <p style="margin: 0 0 1.5rem 0; color: var(--dashboard-text-muted);">
            Irreversible and destructive actions
          </p>
          <div style="display: flex; gap: 1rem;">
            <button class="btn-admin secondary" onclick="clearAllData()" style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444;">
              <i class="fas fa-trash"></i> Clear All Data
            </button>
            <button class="btn-admin secondary" onclick="deleteAccount()" style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444;">
              <i class="fas fa-user-times"></i> Delete Account
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.changePassword = function(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // In a real app, verify current password against stored hash
    alert('Password changed successfully!');
    document.getElementById('change-password-form').reset();
  };

  window.enable2FA = function() {
    showModal(`
      <div class="admin-modal-header">
        <h3><i class="fas fa-shield-alt"></i> Enable Two-Factor Authentication</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <p>Two-factor authentication adds an extra layer of security to your account.</p>
        <ol style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
          <li>Scan the QR code below</li>
          <li>Enter the 6-digit code from your app</li>
        </ol>
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; margin: 1rem 0;">
          <div style="width: 200px; height: 200px; background: #f3f4f6; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #6b7280;">
            QR Code Placeholder
          </div>
        </div>
        <div class="admin-form-group">
          <label>Enter 6-digit code</label>
          <input type="text" maxlength="6" placeholder="000000" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;">
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="confirm2FA()">
          <i class="fas fa-check"></i> Enable 2FA
        </button>
      </div>
    `);
  };

  window.confirm2FA = function() {
    alert('Two-factor authentication has been enabled!');
    closeModal();
    loadSettings();
  };

  window.saveNotificationSettings = function() {
    const settings = {
      emailNotifications: document.getElementById('email-notifications').checked,
      smsNotifications: document.getElementById('sms-notifications').checked,
      consultationAlerts: document.getElementById('consultation-alerts').checked,
      projectUpdates: document.getElementById('project-updates').checked
    };

    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  window.changeTheme = function(theme) {
    localStorage.setItem('theme', theme);
    alert(`Theme changed to: ${theme}`);
  };

  window.changeLanguage = function(language) {
    localStorage.setItem('language', language);
    alert(`Language changed to: ${language}`);
  };

  window.clearAllData = function() {
    if (confirm('Are you sure? This will delete ALL data including projects, clients, and consultations. This action cannot be undone!')) {
      if (confirm('FINAL WARNING: This will permanently delete everything. Are you absolutely sure?')) {
        DataManager.clearAll();
        alert('All data has been cleared!');
        loadOverview();
      }
    }
  };

  window.deleteAccount = function() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      alert('Account deletion would be processed here. For this demo, the account will not be deleted.');
    }
  };

  // ============================================
  // User Management Section
  // ============================================
  function loadUsers() {
    const users = DataManager.users.getAll();

    mainContent.innerHTML = `
      <div class="admin-action-bar">
        <h1><i class="fas fa-users-cog"></i> User Management</h1>
        <div class="admin-actions">
          <button class="btn-admin" onclick="showCreateUserModal()">
            <i class="fas fa-user-plus"></i>
            Add New User
          </button>
        </div>
      </div>

      ${users.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-users-cog"></i>
          <h3>No Users Yet</h3>
          <p>Click "Add New User" to create your first user account</p>
        </div>
      ` : `
        <!-- User Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px;">
            <div style="font-size: 2rem; font-weight: 700; color: #c50077;">${users.length}</div>
            <div style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">Total Users</div>
          </div>
          <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px;">
            <div style="font-size: 2rem; font-weight: 700; color: #22c55e;">${users.filter(u => u.status === 'active').length}</div>
            <div style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">Active Users</div>
          </div>
          <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px;">
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">${users.filter(u => u.role === 'admin').length}</div>
            <div style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">Administrators</div>
          </div>
          <div style="background: var(--dashboard-card); padding: 1.5rem; border-radius: 12px;">
            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">${users.filter(u => u.role === 'client').length}</div>
            <div style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">Clients</div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #c50077, #ff0095); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${user.role === 'admin' ? 'crown' : 'user'}" style="color: white;"></i>
                      </div>
                      <div>
                        <strong>${user.firstName} ${user.lastName}</strong>
                        ${user.company ? `<br><small style="color: var(--dashboard-text-muted);">${user.company}</small>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>${user.email}</td>
                  <td>
                    <span class="status-badge ${user.role}" style="text-transform: capitalize;">
                      ${user.role}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge ${user.status}">
                      ${user.status}
                    </span>
                  </td>
                  <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-icon" onclick="viewUser('${user.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon" onclick="editUserRole('${user.id}')" title="Edit Role & Permissions">
                        <i class="fas fa-user-shield"></i>
                      </button>
                      <button class="btn-icon" onclick="editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      ${user.status === 'active' ? `
                        <button class="btn-icon danger" onclick="suspendUser('${user.id}')" title="Suspend">
                          <i class="fas fa-ban"></i>
                        </button>
                      ` : `
                        <button class="btn-icon success" onclick="activateUser('${user.id}')" title="Activate">
                          <i class="fas fa-check-circle"></i>
                        </button>
                      `}
                      <button class="btn-icon danger" onclick="deleteUser('${user.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

  window.showCreateUserModal = function() {
    showModal(`
      <div class="admin-modal-header">
        <h3><i class="fas fa-user-plus"></i> Add New User</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="create-user-form" onsubmit="createUser(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="admin-form-group">
              <label style="color: white;">First Name *</label>
              <input type="text" id="user-firstname" required>
            </div>
            <div class="admin-form-group">
              <label style="color: white;">Last Name *</label>
              <input type="text" id="user-lastname" required>
            </div>
          </div>

          <div class="admin-form-group" style="margin-bottom: 1rem;">
            <label style="color: white;">Email Address *</label>
            <input type="email" id="user-email" required>
          </div>

          <div class="admin-form-group" style="margin-bottom: 1rem;">
            <label style="color: white;">Password *</label>
            <input type="password" id="user-password" required minlength="8">
            <small style="color: var(--dashboard-text-muted);">Minimum 8 characters</small>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="admin-form-group">
              <label style="color: white;">Role *</label>
              <select id="user-role" required>
                <option value="client">Client</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label style="color: white;">Status *</label>
              <select id="user-status" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="admin-form-group" style="margin-bottom: 1rem;">
            <label style="color: white;">Phone</label>
            <input type="tel" id="user-phone">
          </div>

          <div class="admin-form-group">
            <label style="color: white;">Company</label>
            <input type="text" id="user-company">
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="document.getElementById('create-user-form').requestSubmit()">
          <i class="fas fa-save"></i> Create User
        </button>
      </div>
    `);
  };

  window.createUser = function(event) {
    event.preventDefault();

    try {
      const userData = {
        firstName: document.getElementById('user-firstname').value,
        lastName: document.getElementById('user-lastname').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value,
        status: document.getElementById('user-status').value,
        phone: document.getElementById('user-phone').value,
        company: document.getElementById('user-company').value
      };

      DataManager.users.create(userData);
      alert('User created successfully!');
      closeModal();
      loadUsers();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  window.viewUser = function(userId) {
    const user = DataManager.users.getById(userId);
    if (!user) return;

    showModal(`
      <div class="admin-modal-header">
        <h3><i class="fas fa-user-circle"></i> User Details</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 100px; height: 100px; margin: 0 auto 1rem; background: linear-gradient(135deg, #c50077, #ff0095); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-${user.role === 'admin' ? 'crown' : 'user'}" style="font-size: 2.5rem; color: white;"></i>
          </div>
          <h2 style="margin: 0 0 0.5rem 0;">${user.firstName} ${user.lastName}</h2>
          <p style="color: var(--dashboard-text-muted); margin: 0;">${user.email}</p>
        </div>

        <div style="display: grid; gap: 1rem;">
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Role:</strong>
            <span class="status-badge ${user.role}" style="text-transform: capitalize; width: fit-content;">${user.role}</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Status:</strong>
            <span class="status-badge ${user.status}" style="width: fit-content;">${user.status}</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Phone:</strong>
            <span>${user.phone || 'N/A'}</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Company:</strong>
            <span>${user.company || 'N/A'}</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Created:</strong>
            <span>${new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <strong>Last Login:</strong>
            <span>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Close</button>
        <button class="btn-admin" onclick="editUser('${user.id}')">
          <i class="fas fa-edit"></i> Edit User
        </button>
      </div>
    `);
  };

  window.editUser = function(userId) {
    const user = DataManager.users.getById(userId);
    if (!user) return;

    showModal(`
      <div class="admin-modal-header">
        <h3><i class="fas fa-user-edit"></i> Edit User</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="edit-user-form" onsubmit="saveUserChanges(event, '${userId}')">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="admin-form-group">
              <label style="color: white;">First Name</label>
              <input type="text" id="edit-firstname" value="${user.firstName}" required>
            </div>
            <div class="admin-form-group">
              <label style="color: white;">Last Name</label>
              <input type="text" id="edit-lastname" value="${user.lastName}" required>
            </div>
          </div>

          <div class="admin-form-group" style="margin-bottom: 1rem;">
            <label style="color: white;">Email</label>
            <input type="email" id="edit-email" value="${user.email}" required>
          </div>

          <div class="admin-form-group" style="margin-bottom: 1rem;">
            <label style="color: white;">Phone</label>
            <input type="tel" id="edit-phone" value="${user.phone || ''}">
          </div>

          <div class="admin-form-group">
            <label style="color: white;">Company</label>
            <input type="text" id="edit-company" value="${user.company || ''}">
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="document.getElementById('edit-user-form').requestSubmit()">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    `);
  };

  window.saveUserChanges = function(event, userId) {
    event.preventDefault();

    try {
      DataManager.users.update(userId, {
        firstName: document.getElementById('edit-firstname').value,
        lastName: document.getElementById('edit-lastname').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        company: document.getElementById('edit-company').value
      });

      alert('User updated successfully!');
      closeModal();
      loadUsers();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  window.editUserRole = function(userId) {
    const user = DataManager.users.getById(userId);
    if (!user) return;

    const permissions = user.permissions || {};
    const resources = ['dashboard', 'users', 'clients', 'projects', 'consultations', 'messages', 'invoices', 'analytics', 'settings'];

    showModal(`
      <div class="admin-modal-header">
        <h3><i class="fas fa-user-shield"></i> Manage Role & Permissions</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div class="admin-form-group" style="margin-bottom: 2rem;">
          <label style="color: white;">Role</label>
          <select id="role-select" onchange="loadRolePermissions(this.value)">
            <option value="client" ${user.role === 'client' ? 'selected' : ''}>Client</option>
            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>

        <h4 style="margin: 0 0 1rem 0;">Permissions</h4>
        <div id="permissions-grid" style="display: grid; gap: 0.5rem;">
          ${resources.map(resource => {
            const resPerms = permissions[resource] || {};
            return `
              <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 0.5rem; text-transform: capitalize;">${resource}</div>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                  ${['view', 'edit', 'delete'].map(action => `
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: white;">
                      <input type="checkbox"
                             class="perm-checkbox"
                             data-resource="${resource}"
                             data-action="${action}"
                             ${resPerms[action] ? 'checked' : ''}>
                      <span style="text-transform: capitalize;">${action}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="btn-admin secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-admin" onclick="saveUserPermissions('${userId}')">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    `);
  };

  window.loadRolePermissions = function(role) {
    const defaultPerms = DataManager.users.getDefaultPermissions(role);
    const checkboxes = document.querySelectorAll('.perm-checkbox');

    checkboxes.forEach(cb => {
      const resource = cb.dataset.resource;
      const action = cb.dataset.action;
      cb.checked = defaultPerms[resource] && defaultPerms[resource][action];
    });
  };

  window.saveUserPermissions = function(userId) {
    const role = document.getElementById('role-select').value;
    const permissions = {};

    document.querySelectorAll('.perm-checkbox').forEach(cb => {
      const resource = cb.dataset.resource;
      const action = cb.dataset.action;

      if (!permissions[resource]) {
        permissions[resource] = {};
      }

      permissions[resource][action] = cb.checked;
    });

    DataManager.users.update(userId, { role, permissions });
    alert('Role and permissions updated successfully!');
    closeModal();
    loadUsers();
  };

  window.suspendUser = function(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
      DataManager.users.suspend(userId);
      alert('User suspended successfully!');
      loadUsers();
    }
  };

  window.activateUser = function(userId) {
    DataManager.users.activate(userId);
    alert('User activated successfully!');
    loadUsers();
  };

  window.deleteUser = function(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
      DataManager.users.delete(userId);
      alert('User deleted successfully!');
      loadUsers();
    }
  };

  // ============================================
  // User Menu
  // ============================================
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userMenu = document.querySelector('.user-menu');

  if (userMenuToggle) {
    userMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      userMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
      }
    });
  }

  // Handle dropdown navigation links
  const dropdownLinks = document.querySelectorAll('.user-dropdown a[data-section]');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        userMenu.classList.remove('active');
        navigateToSection(section);
      }
    });
  });

  // Logout
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      window.location.href = 'index.html';
    });
  }

  // ============================================
  // Badge Updates
  // ============================================
  function updateConsultationsBadge() {
    const pending = DataManager.consultations.getByStatus('pending').length;
    const badge = document.getElementById('consultations-badge');
    if (badge) {
      badge.textContent = pending;
      badge.style.display = pending > 0 ? 'block' : 'none';
    }
    updateNotificationCount();
  }

  function updateMessagesBadge() {
    const unread = DataManager.tickets.getUnreadCount(null, true);
    const badge = document.getElementById('messages-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'block' : 'none';
    }
    updateNotificationCount();
  }

  function updateNotificationCount() {
    const pendingConsultations = DataManager.consultations.getByStatus('pending').length;
    const unreadMessages = DataManager.tickets.getUnreadCount(null, true);
    const total = pendingConsultations + unreadMessages;

    const notificationBadge = document.getElementById('notification-count');
    if (notificationBadge) {
      notificationBadge.textContent = total;
      notificationBadge.style.display = total > 0 ? 'block' : 'none';
    }
  }

  // ============================================
  // Notifications
  // ============================================
  document.getElementById('admin-notifications')?.addEventListener('click', function() {
    const pendingConsultations = DataManager.consultations.getByStatus('pending').length;
    const unreadMessages = DataManager.tickets.getUnreadCount(null, true);

    showModal(`
      <div class="admin-modal-header">
        <h3>Notifications</h3>
        <button class="admin-modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        ${pendingConsultations > 0 || unreadMessages > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${pendingConsultations > 0 ? `
              <div style="padding: 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; cursor: pointer;" onclick="navigateToSection('consultations'); closeModal();">
                <i class="fas fa-calendar-check" style="color: #f59e0b; margin-right: 0.5rem;"></i>
                <strong>${pendingConsultations} pending consultation request(s)</strong>
              </div>
            ` : ''}
            ${unreadMessages > 0 ? `
              <div style="padding: 1rem; background: rgba(197, 0, 119, 0.1); border: 1px solid rgba(197, 0, 119, 0.3); border-radius: 10px; cursor: pointer;" onclick="navigateToSection('messages'); closeModal();">
                <i class="fas fa-envelope" style="color: #c50077; margin-right: 0.5rem;"></i>
                <strong>${unreadMessages} unread message(s)</strong>
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="empty-state">
            <i class="fas fa-bell"></i>
            <p>No new notifications</p>
          </div>
        `}
      </div>
    `);
  });

  // ============================================
  // Initialize
  // ============================================
  loadOverview();
  updateConsultationsBadge();
  updateMessagesBadge();

  console.log('Waarheid Marketing - Admin Dashboard Loaded');
});
