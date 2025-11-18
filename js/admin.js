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
        <div class="admin-stat-card">
          <div class="admin-stat-header">
            <div class="admin-stat-icon warning">
              <i class="fas fa-calendar-check"></i>
            </div>
          </div>
          <div class="admin-stat-value">${pendingConsultations}</div>
          <div class="admin-stat-label">Pending Consultations</div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-header">
            <div class="admin-stat-icon info">
              <i class="fas fa-briefcase"></i>
            </div>
          </div>
          <div class="admin-stat-value">${activeProjects}</div>
          <div class="admin-stat-label">Active Projects</div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-header">
            <div class="admin-stat-icon primary">
              <i class="fas fa-users"></i>
            </div>
          </div>
          <div class="admin-stat-value">${clients.length}</div>
          <div class="admin-stat-label">Total Clients</div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-header">
            <div class="admin-stat-icon warning">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div class="admin-stat-value">${unpaidInvoices}</div>
          <div class="admin-stat-label">Unpaid Invoices</div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-header">
            <div class="admin-stat-icon success">
              <i class="fas fa-dollar-sign"></i>
            </div>
          </div>
          <div class="admin-stat-value">$${totalRevenue.toLocaleString()}</div>
          <div class="admin-stat-label">Total Revenue</div>
        </div>

        <div class="admin-stat-card">
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
          <h2 style="margin-bottom: 1rem;">Recent Consultations</h2>
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
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${consultations.map(c => `
              <tr>
                <td><strong>${c.name || 'N/A'}</strong></td>
                <td>${c.service || 'General'}</td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon" onclick="viewConsultation('${c.id}')" title="View">
                      <i class="fas fa-eye"></i>
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
  // Consultations Section
  // ============================================
  function loadConsultations() {
    const consultations = DataManager.consultations.getAll();
    updateConsultationsBadge();

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
            <tbody>
              ${consultations.map(c => `
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

  window.refreshConsultations = function() {
    loadConsultations();
  };

  // ============================================
  // Projects Section
  // ============================================
  function loadProjects() {
    const projects = DataManager.projects.getAll();

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

      ${projects.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-briefcase"></i>
          <h3>No Projects</h3>
          <p>Click "New Project" to create your first project</p>
        </div>
      ` : `
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
            <tbody>
              ${projects.map(p => {
                const client = p.clientId ? DataManager.clients.getById(p.clientId) : null;
                return `
                  <tr>
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
                    <td>$${(p.budget || 0).toLocaleString()}</td>
                    <td>
                      <div class="table-actions">
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
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

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
              <label>Budget ($)</label>
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
              <label>Budget ($)</label>
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
              <li style="padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem;">
                <strong>${p.title}</strong> - <span class="status-badge ${p.status}">${p.status}</span>
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color: var(--dashboard-text-muted); margin-bottom: 2rem;">No projects assigned</p>'}

        <h4 style="margin-bottom: 1rem;">Invoices (${invoices.length})</h4>
        ${invoices.length > 0 ? `
          <ul style="list-style: none; padding: 0;">
            ${invoices.map(i => `
              <li style="padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${i.invoiceNumber}</strong> - $${i.amount}</span>
                <span class="status-badge ${i.status}">${i.status}</span>
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
                    <td>$${(inv.amount || 0).toLocaleString()}</td>
                    <td>${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick="viewInvoice('${inv.id}')" title="View">
                          <i class="fas fa-eye"></i>
                        </button>
                        ${inv.status === 'pending' ? `
                          <button class="btn-icon success" onclick="markInvoiceAsPaid('${inv.id}')" title="Mark as Paid">
                            <i class="fas fa-check"></i>
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
              <label>Amount ($) *</label>
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
          <div><strong>Amount:</strong> $${(invoice.amount || 0).toLocaleString()}</div>
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
            <span class="kpi-value">$42.8K</span>
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
