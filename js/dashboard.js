/**
 * Waarheid Marketing - Client Dashboard JavaScript
 * Handles client dashboard with real data from DataManager
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Authentication Check
  // ============================================
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!authToken) {
    window.location.href = 'index.html';
    return;
  }

  // Redirect admin to admin dashboard
  if (userRole === 'admin') {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  // Load user data
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const clientId = userData.clientId;

  if (!clientId) {
    console.error('No client ID found');
  }

  loadClientDashboard();

  // ============================================
  // Section Navigation
  // ============================================
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionName = this.getAttribute('data-section');

      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Switch sections
      const sections = document.querySelectorAll('.dashboard-section');
      sections.forEach(s => s.classList.remove('active'));

      const targetSection = document.getElementById('section-' + sectionName);
      if (targetSection) {
        targetSection.classList.add('active');

        // Load section content
        loadSectionContent(sectionName);
      }
    });
  });

  // Programmatic navigation function
  window.navigateToSection = function(sectionName) {
    // Update active nav link
    navLinks.forEach(l => l.classList.remove('active'));
    const targetNavLink = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
    if (targetNavLink) {
      targetNavLink.classList.add('active');
    }

    // Switch sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(s => s.classList.remove('active'));

    const targetSection = document.getElementById('section-' + sectionName);
    if (targetSection) {
      targetSection.classList.add('active');

      // Load section content
      loadSectionContent(sectionName);
    }
  };

  // ============================================
  // Load Client Dashboard
  // ============================================
  function loadClientDashboard() {
    const firstName = userData.firstName || 'User';

    // Update user name displays
    document.querySelectorAll('.user-name-display').forEach(el => {
      el.textContent = firstName;
    });

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = userData.firstName && userData.lastName
        ? `${userData.firstName} ${userData.lastName}`
        : userData.email || 'User';
    });

    // Load client's projects
    loadClientProjects();

    // Load unread messages count
    updateMessagesNotification();

    // Initialize charts
    initializeCharts();
  }

  // ============================================
  // Load Client Projects
  // ============================================
  function loadClientProjects() {
    if (!clientId) {
      showEmptyProjectsState();
      return;
    }

    const projects = DataManager.projects.getByClient(clientId);

    if (projects.length === 0) {
      showEmptyProjectsState();
      return;
    }

    // Update stats
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'launching' || p.status === 'optimizing').length;
    const pendingReviews = projects.filter(p => p.status === 'pending').length;

    document.querySelector('.welcome-stats').innerHTML = `
      <div class="stat-item">
        <div class="stat-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${activeProjects}</span>
          <span class="stat-label">Active Projects</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${pendingReviews}</span>
          <span class="stat-label">Pending Reviews</span>
        </div>
      </div>
    `;

    // Render project cards
    const packagesGrid = document.querySelector('.packages-grid');
    packagesGrid.innerHTML = projects.map(project => renderProjectCard(project)).join('');

    // Reattach filter functionality
    attachFilterListeners();
  }

  function renderProjectCard(project) {
    const statusClasses = {
      'pending': 'pending',
      'in_progress': 'in-progress',
      'launching': 'launching',
      'optimizing': 'optimizing',
      'completed': 'completed'
    };

    const statusLabels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'launching': 'Launching',
      'optimizing': 'Optimizing',
      'completed': 'Completed'
    };

    const thumbnails = {
      'marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      'development': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop',
      'automation': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
    };

    return `
      <div class="package-card" data-category="${project.category}" data-project-id="${project.id}">
        <div class="package-thumbnail">
          <img src="${thumbnails[project.category] || thumbnails.marketing}" alt="${project.title}">
          <div class="package-badge ${statusClasses[project.status] || 'pending'}">
            ${statusLabels[project.status] || 'Pending'}
          </div>
        </div>
        <div class="package-content">
          <h3>${project.title}</h3>
          <p>${project.description || 'No description available'}</p>
          <div class="package-meta">
            <span class="meta-item">
              <i class="fas fa-calendar"></i>
              Started ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
            </span>
            <span class="meta-item">
              <i class="fas fa-chart-line"></i>
              ${project.progress || 0}% Complete
            </span>
          </div>
          <div class="package-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
            </div>
          </div>
          <button class="btn-view-details" onclick="openProjectDetail('${project.id}')">
            View Details
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  function showEmptyProjectsState() {
    const packagesGrid = document.querySelector('.packages-grid');
    packagesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-briefcase" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
        <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Projects Yet</h3>
        <p style="color: var(--dashboard-text-muted);">Your projects will appear here once they are assigned by our team.</p>
        <a href="booking.html" class="btn-book" style="margin-top: 2rem; display: inline-block;">Book a Consultation</a>
      </div>
    `;
  }

  // ============================================
  // Filter Functionality
  // ============================================
  function attachFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const packageCards = document.querySelectorAll('.package-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Filter cards
        packageCards.forEach(card => {
          const category = card.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // ============================================
  // Project Detail Modal
  // ============================================
  window.openProjectDetail = function(projectId) {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('project-detail-content');
    const project = DataManager.projects.getById(projectId);

    if (!project) return;

    const statusClasses = {
      'pending': 'pending',
      'in_progress': 'in-progress',
      'launching': 'launching',
      'optimizing': 'optimizing',
      'completed': 'completed'
    };

    const statusLabels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'launching': 'Launching',
      'optimizing': 'Optimizing',
      'completed': 'Completed'
    };

    // Build modal HTML
    const modalHTML = `
      <div class="project-detail-header">
        <div class="project-status-tag ${statusClasses[project.status] || 'pending'}">
          ${statusLabels[project.status] || 'Pending'}
        </div>
        <h2>${project.title}</h2>
        <p style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">${project.description || 'No description available'}</p>

        <div class="project-meta-grid">
          <div class="project-meta-item">
            <span class="project-meta-label">Start Date</span>
            <span class="project-meta-value">${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">End Date</span>
            <span class="project-meta-value">${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">Budget</span>
            <span class="project-meta-value">€${(project.budget || 0).toLocaleString()}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">Spent</span>
            <span class="project-meta-value">€${(project.spent || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="project-progress-section">
        <h3>Overall Progress</h3>
        <div class="package-progress" style="margin-top: 1rem;">
          <div class="progress-bar" style="height: 12px;">
            <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
          </div>
        </div>
        <p style="text-align: center; margin-top: 0.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${project.progress || 0}% Complete</p>
      </div>

      ${project.milestones && project.milestones.length > 0 ? `
        <div class="project-progress-section">
          <h3><i class="fas fa-tasks"></i> Milestones & Timeline</h3>
          <div class="project-milestones">
            ${project.milestones.map(milestone => `
              <div class="milestone-item" style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${milestone.completed ? '#10b981' : '#c50077'}; margin-bottom: 1rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                  <div style="flex-shrink: 0; margin-top: 0.2rem;">
                    <div class="milestone-icon ${milestone.completed ? 'completed' : 'pending'}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${milestone.completed ? '#10b981' : 'rgba(197, 0, 119, 0.2)'}; color: ${milestone.completed ? 'white' : 'var(--dashboard-primary)'};">
                      <i class="fas ${milestone.completed ? 'fa-check' : 'fa-clock'}" style="font-size: 0.75rem;"></i>
                    </div>
                  </div>
                  <div style="flex: 1;">
                    <div class="milestone-title" style="font-weight: 600; margin-bottom: 0.3rem; ${milestone.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${milestone.title}</div>
                    ${milestone.dueDate ? `<div class="milestone-date" style="font-size: 0.85rem; color: var(--dashboard-text-muted); margin-bottom: 0.3rem;"><i class="fas fa-calendar"></i> Due: ${new Date(milestone.dueDate).toLocaleDateString()}</div>` : ''}
                    ${milestone.description ? `<p style="margin: 0.5rem 0 0 0; color: var(--dashboard-text-muted); font-size: 0.9rem;">${milestone.description}</p>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${project.deliverables && project.deliverables.length > 0 ? `
        <div class="project-progress-section">
          <h3><i class="fas fa-box"></i> Deliverables</h3>
          <div style="margin-top: 1rem;">
            ${project.deliverables.map(deliverable => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${deliverable.delivered ? '#10b981' : '#f59e0b'}; margin-bottom: 1rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                  <div style="flex-shrink: 0; margin-top: 0.2rem;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${deliverable.delivered ? '#10b981' : 'rgba(245, 158, 11, 0.2)'}; color: ${deliverable.delivered ? 'white' : '#f59e0b'};">
                      <i class="fas ${deliverable.delivered ? 'fa-check' : 'fa-hourglass-half'}" style="font-size: 0.75rem;"></i>
                    </div>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.3rem; ${deliverable.delivered ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${deliverable.name}</div>
                    ${deliverable.deliveryDate ? `<div style="font-size: 0.85rem; color: var(--dashboard-text-muted); margin-bottom: 0.3rem;"><i class="fas fa-calendar"></i> Expected: ${new Date(deliverable.deliveryDate).toLocaleDateString()}</div>` : ''}
                    ${deliverable.description ? `<p style="margin: 0.5rem 0 0 0; color: var(--dashboard-text-muted); font-size: 0.9rem;">${deliverable.description}</p>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${project.files && project.files.length > 0 ? `
        <div class="project-progress-section">
          <h3><i class="fas fa-folder-open"></i> Project Files</h3>
          <div style="margin-top: 1rem;">
            ${project.files.map(file => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <i class="fas fa-file" style="font-size: 1.5rem; color: var(--dashboard-primary);"></i>
                  <div>
                    <div style="font-weight: 600;">${file.name}</div>
                    <div style="font-size: 0.85rem; color: var(--dashboard-text-muted);">
                      ${file.size ? `${(file.size / 1024).toFixed(1)} KB • ` : ''}${file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                </div>
                ${file.url ? `
                  <a href="${file.url}" target="_blank" class="btn-view-details" style="padding: 0.5rem 1rem; margin: 0;">
                    <i class="fas fa-download"></i>
                  </a>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${project.team && project.team.length > 0 ? `
        <div class="project-progress-section">
          <h3><i class="fas fa-users"></i> Team Members</h3>
          <div style="margin-top: 1rem;">
            ${project.team.map(member => `
              <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="font-weight: 600;">${member.name}</div>
                <div style="font-size: 0.85rem; color: var(--dashboard-text-muted); margin-top: 0.3rem;">
                  ${member.role || 'Team Member'}${member.email ? ` • ${member.email}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${project.visuals && project.visuals.length > 0 ? `
        <div class="project-visuals">
          <h3>Project Visuals</h3>
          <div class="visuals-grid">
            ${project.visuals.map(visual => `
              <div class="visual-item">
                <img src="${visual.url}" alt="${visual.title}">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${project.notes ? `
        <div class="project-progress-section">
          <h3>Notes & Updates</h3>
          <p style="color: var(--dashboard-text-muted); line-height: 1.6; margin-top: 1rem;">${project.notes}</p>
        </div>
      ` : ''}

      <div class="project-progress-section">
        <h3>Need Help?</h3>
        <p style="color: var(--dashboard-text-muted); line-height: 1.6; margin-top: 1rem;">
          Have questions about this project? Send us a message and we'll get back to you shortly.
        </p>
        <button class="btn-view-details" onclick="openMessaging('${project.id}', '${project.title.replace(/'/g, "\\'")}', '${(project.description || '').replace(/'/g, "\\'")}' )" style="margin-top: 1rem;">
          <i class="fas fa-comments"></i>
          Send Message
        </button>
      </div>
    `;

    modalContent.innerHTML = modalHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectDetail = function() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeProjectDetail();
    }
  });

  // ============================================
  // Messages/Tickets Notification
  // ============================================
  function updateMessagesNotification() {
    if (!clientId) return;

    const unreadCount = DataManager.tickets.getUnreadCount(clientId, false);
    const notificationBadge = document.querySelector('.notification-badge');

    if (notificationBadge && unreadCount > 0) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = 'block';
    } else if (notificationBadge) {
      notificationBadge.style.display = 'none';
    }

    // Update nav badge if exists
    const messagesLink = document.querySelector('[data-section="messages"]');
    if (messagesLink) {
      let badge = messagesLink.querySelector('.nav-badge');
      if (unreadCount > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'nav-badge';
          messagesLink.appendChild(badge);
        }
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else if (badge) {
        badge.style.display = 'none';
      }
    }
  }

  // Open messaging (placeholder - could open a messaging modal)
  window.openMessaging = function(projectId, projectTitle, projectDescription) {
    // Close project detail modal
    window.closeProjectDetail();

    // Navigate to messages section
    navigateToSection('messages');

    // Open new ticket modal with pre-filled information
    setTimeout(() => {
      openNewTicketModal({
        category: 'project_inquiry',
        subject: `Question about: ${projectTitle}`,
        projectId: projectId,
        projectTitle: projectTitle,
        projectDescription: projectDescription
      });
    }, 300);
  };

  // ============================================
  // Notifications Button
  // ============================================
  const notificationsBtn = document.querySelector('.notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      const unreadMessages = DataManager.messages.getUnread(false).filter(m => m.clientId === clientId);
      const pendingInvoices = DataManager.invoices.getByClient(clientId).filter(i => i.status === 'pending');

      let notifications = [];

      if (unreadMessages.length > 0) {
        notifications.push(`You have ${unreadMessages.length} unread message(s) from Waarheid Marketing`);
      }

      if (pendingInvoices.length > 0) {
        notifications.push(`You have ${pendingInvoices.length} pending invoice(s)`);
      }

      if (notifications.length === 0) {
        alert('No new notifications');
      } else {
        alert('Notifications:\n\n' + notifications.join('\n'));
      }
    });
  }

  // ============================================
  // User Menu Dropdown
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

  // Logout functionality
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
  // Date Range Selector
  // ============================================
  const dateButtons = document.querySelectorAll('.date-btn');

  dateButtons.forEach(button => {
    button.addEventListener('click', function() {
      dateButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ============================================
  // Initialize Charts
  // ============================================
  function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') return;

    // Configure Chart.js defaults
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Performance Line Chart
    const performanceCtx = document.getElementById('performance-chart');
    if (performanceCtx) {
      new Chart(performanceCtx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Progress',
              data: [15, 35, 52, 68],
              borderColor: '#c50077',
              backgroundColor: 'rgba(197, 0, 119, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 36, 0.95)',
              borderColor: 'rgba(197, 0, 119, 0.5)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // Traffic Sources Bar Chart
    const trafficCtx = document.getElementById('traffic-chart');
    if (trafficCtx) {
      new Chart(trafficCtx, {
        type: 'bar',
        data: {
          labels: ['Organic', 'Paid Ads', 'Social', 'Direct', 'Referral'],
          datasets: [{
            label: 'Visitors',
            data: [3500, 2800, 2100, 1800, 1200],
            backgroundColor: [
              'rgba(197, 0, 119, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: [
              '#c50077',
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 36, 0.95)',
              borderColor: 'rgba(197, 0, 119, 0.5)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                callback: function(value) {
                  return value >= 1000 ? (value/1000) + 'K' : value;
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  // ============================================
  // Load Section Content
  // ============================================
  function loadSectionContent(sectionName) {
    switch(sectionName) {
      case 'overview':
        // Already loaded on page load
        break;
      case 'projects':
        loadProjectsSection();
        break;
      case 'analytics':
        loadAnalyticsSection();
        break;
      case 'messages':
        loadMessagesSection();
        break;
      case 'schedule':
        loadScheduleSection();
        break;
      case 'invoices':
        loadInvoicesSection();
        break;
      case 'reports':
        loadReportsSection();
        break;
      case 'profile':
        loadProfileSection();
        break;
      case 'settings':
        loadSettingsSection();
        break;
    }
  }

  // ============================================
  // Projects Section
  // ============================================
  function loadProjectsSection() {
    const projectsGrid = document.getElementById('projects-section-grid');

    if (!clientId) {
      projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const projects = DataManager.projects.getByClient(clientId);

    if (projects.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-briefcase" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Projects Yet</h3>
          <p style="color: var(--dashboard-text-muted);">Your projects will appear here once they are assigned by our team.</p>
          <a href="booking.html" class="btn-book" style="margin-top: 2rem; display: inline-block;">Book a Consultation</a>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = projects.map(project => renderProjectCard(project)).join('');
  }

  // ============================================
  // Analytics Section
  // ============================================
  function loadAnalyticsSection() {
    const kpisContainer = document.getElementById('analytics-kpis');
    const chartsContainer = document.getElementById('analytics-charts');

    // Load KPIs
    kpisContainer.innerHTML = `
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
    `;

    // Load Charts
    chartsContainer.innerHTML = `
      <div class="chart-card">
        <div class="chart-header">
          <h3>Campaign Performance</h3>
        </div>
        <div class="chart-container">
          <canvas id="analytics-performance-chart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>Traffic Sources</h3>
        </div>
        <div class="chart-container">
          <canvas id="analytics-traffic-chart"></canvas>
        </div>
      </div>
    `;

    // Reinitialize charts for analytics section
    setTimeout(() => {
      initializeAnalyticsCharts();
    }, 100);
  }

  function initializeAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;

    const performanceCtx = document.getElementById('analytics-performance-chart');
    if (performanceCtx) {
      new Chart(performanceCtx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Progress',
            data: [15, 35, 52, 68],
            borderColor: '#c50077',
            backgroundColor: 'rgba(197, 0, 119, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 36, 0.95)',
              borderColor: 'rgba(197, 0, 119, 0.5)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { callback: value => value + '%' }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const trafficCtx = document.getElementById('analytics-traffic-chart');
    if (trafficCtx) {
      new Chart(trafficCtx, {
        type: 'bar',
        data: {
          labels: ['Organic', 'Paid Ads', 'Social', 'Direct', 'Referral'],
          datasets: [{
            label: 'Visitors',
            data: [3500, 2800, 2100, 1800, 1200],
            backgroundColor: [
              'rgba(197, 0, 119, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: ['#c50077', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 36, 0.95)',
              borderColor: 'rgba(197, 0, 119, 0.5)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { callback: value => value >= 1000 ? (value/1000) + 'K' : value }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }

  // ============================================
  // Messages/Tickets Section
  // ============================================
  let currentView = 'list'; // 'list' or 'conversation'
  let currentTicketId = null;

  function loadMessagesSection() {
    // Always start with ticket list view
    currentView = 'list';
    currentTicketId = null;
    loadTicketsList();
  }

  window.loadTicketsList = function() {
    // Reset view state
    currentView = 'list';
    currentTicketId = null;

    const messagesList = document.getElementById('messages-list');

    if (!clientId) {
      messagesList.innerHTML = '<p style="text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const tickets = DataManager.tickets.getByClient(clientId);

    // Count unread messages
    const unreadCount = DataManager.tickets.getUnreadCount(clientId, false);

    // Header with create button
    const headerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h3 style="color: var(--dashboard-text); margin: 0 0 0.5rem 0;">Support Tickets</h3>
          <p style="color: var(--dashboard-text-muted); margin: 0;">
            ${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}
            ${unreadCount > 0 ? `• ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}` : ''}
          </p>
        </div>
        <button class="btn-primary" onclick="openNewTicketModal()">
          <i class="fas fa-plus"></i> New Ticket
        </button>
      </div>
    `;

    if (tickets.length === 0) {
      messagesList.innerHTML = headerHTML + `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--dashboard-card); border-radius: 12px;">
          <i class="fas fa-ticket-alt" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Tickets Yet</h3>
          <p style="color: var(--dashboard-text-muted); margin-bottom: 2rem;">Create a support ticket to get help from our team.</p>
          <button class="btn-primary" onclick="openNewTicketModal()">
            <i class="fas fa-plus"></i> Create Your First Ticket
          </button>
        </div>
      `;
      return;
    }

    // Sort tickets by updated date (newest first)
    tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const ticketsHTML = tickets.map(ticket => renderTicketCard(ticket)).join('');
    messagesList.innerHTML = headerHTML + `<div class="tickets-grid">${ticketsHTML}</div>`;

    // Update notification count
    updateMessagesNotification();
  }

  function renderTicketCard(ticket) {
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

    const categoryIcons = {
      'project_inquiry': 'fa-project-diagram',
      'billing': 'fa-file-invoice-dollar',
      'feature_request': 'fa-lightbulb',
      'technical_support': 'fa-tools',
      'general': 'fa-question-circle'
    };

    const categoryLabels = {
      'project_inquiry': 'Project Inquiry',
      'billing': 'Billing',
      'feature_request': 'Feature Request',
      'technical_support': 'Technical Support',
      'general': 'General'
    };

    const priorityClasses = {
      'low': 'priority-low',
      'normal': 'priority-normal',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };

    // Get last message
    const lastMessage = ticket.messages[ticket.messages.length - 1];
    const lastMessageDate = lastMessage ? new Date(lastMessage.timestamp) : new Date(ticket.createdAt);
    const lastMessageText = lastMessage ? lastMessage.message : 'No messages yet';

    // Count unread messages in this ticket
    const unreadInTicket = ticket.messages.filter(m => m.fromAdmin && !m.read).length;

    // Get relative time
    const getRelativeTime = (date) => {
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    };

    return `
      <div class="ticket-card ${unreadInTicket > 0 ? 'has-unread' : ''}" onclick="openTicketConversation('${ticket.id}')">
        <div class="ticket-card-header">
          <div class="ticket-meta">
            <span class="ticket-category">
              <i class="fas ${categoryIcons[ticket.category] || 'fa-ticket-alt'}"></i>
              ${categoryLabels[ticket.category] || ticket.category}
            </span>
            <span class="ticket-priority ${priorityClasses[ticket.priority]}">
              ${ticket.priority}
            </span>
          </div>
          <span class="ticket-status ${statusClasses[ticket.status]}">
            ${statusLabels[ticket.status] || ticket.status}
          </span>
        </div>
        <h4 class="ticket-subject">${ticket.subject}</h4>
        <div class="ticket-last-message">
          <div class="last-message-preview">${lastMessageText.substring(0, 100)}${lastMessageText.length > 100 ? '...' : ''}</div>
          <div class="ticket-footer">
            <span class="ticket-messages-count">
              <i class="fas fa-comments"></i> ${ticket.messages.length} ${ticket.messages.length === 1 ? 'message' : 'messages'}
            </span>
            <span class="ticket-updated">${getRelativeTime(lastMessageDate)}</span>
            ${unreadInTicket > 0 ? `<span class="ticket-unread-badge">${unreadInTicket} new</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // Ticket Conversation View
  // ============================================
  window.openTicketConversation = function(ticketId) {
    currentTicketId = ticketId;
    currentView = 'conversation';

    const ticket = DataManager.tickets.getById(ticketId);
    if (!ticket) {
      alert('Ticket not found');
      return;
    }

    // Mark messages as read
    DataManager.tickets.markMessagesAsRead(ticketId, false);

    const messagesList = document.getElementById('messages-list');

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

    // Render conversation view
    messagesList.innerHTML = `
      <div class="ticket-conversation">
        <!-- Back button and header -->
        <div class="conversation-header">
          <button class="btn-back" onclick="loadTicketsList()">
            <i class="fas fa-arrow-left"></i> Back to Tickets
          </button>
          <div class="conversation-title">
            <h3>${ticket.subject}</h3>
            <div class="conversation-meta">
              <span class="ticket-category-badge">${categoryLabels[ticket.category] || ticket.category}</span>
              <span class="ticket-status ${statusClasses[ticket.status]}">${statusLabels[ticket.status]}</span>
              <span class="ticket-id">Ticket #${ticket.id.split('_')[ticket.id.split('_').length - 1].substring(0, 8)}</span>
            </div>
          </div>
        </div>

        <!-- Messages thread -->
        <div class="messages-thread" id="messages-thread">
          ${ticket.messages.length === 0 ? `
            <div style="text-align: center; padding: 3rem; color: var(--dashboard-text-muted);">
              <i class="fas fa-comment-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
              <p>No messages yet. Start the conversation below.</p>
            </div>
          ` : ticket.messages.map(msg => renderConversationMessage(msg)).join('')}
        </div>

        <!-- Reply form -->
        ${ticket.status !== 'closed' ? `
          <div class="reply-form">
            <form id="ticket-reply-form" onsubmit="sendTicketReply(event, '${ticket.id}')">
              <div class="reply-input-container">
                <textarea
                  id="reply-message"
                  placeholder="Type your message here..."
                  rows="3"
                  required
                  style="width: 100%; padding: 1rem; background: var(--dashboard-card); border: 1px solid var(--dashboard-border); border-radius: 8px; color: var(--dashboard-text); font-family: inherit; resize: vertical;"
                ></textarea>
              </div>
              <div class="reply-actions">
                <button type="submit" class="btn-primary">
                  <i class="fas fa-paper-plane"></i> Send Reply
                </button>
              </div>
            </form>
          </div>
        ` : `
          <div class="ticket-closed-notice">
            <i class="fas fa-lock"></i> This ticket is closed. Contact support to reopen.
          </div>
        `}
      </div>
    `;

    // Scroll to bottom of messages
    setTimeout(() => {
      const thread = document.getElementById('messages-thread');
      if (thread) {
        thread.scrollTop = thread.scrollHeight;
      }
    }, 100);

    // Update notification count
    updateMessagesNotification();
  };

  function renderConversationMessage(msg) {
    const date = new Date(msg.timestamp);
    const isFromAdmin = msg.fromAdmin;

    return `
      <div class="conversation-message ${isFromAdmin ? 'from-admin' : 'from-client'}">
        <div class="message-avatar">
          <i class="fas ${isFromAdmin ? 'fa-user-tie' : 'fa-user'}"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender-name">
            ${isFromAdmin ? (msg.senderName || 'Waarheid Support Team') : 'You'}
          </div>
          <div class="message-text">${msg.message}</div>
          <div class="message-timestamp">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
        </div>
      </div>
    `;
  }

  window.sendTicketReply = function(event, ticketId) {
    event.preventDefault();

    const messageTextarea = document.getElementById('reply-message');
    const messageText = messageTextarea.value.trim();

    if (!messageText) {
      alert('Please enter a message');
      return;
    }

    // Add message to ticket
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const senderName = userData.firstName && userData.lastName ?
      `${userData.firstName} ${userData.lastName}` :
      (userData.firstName || 'Client');

    DataManager.tickets.addMessage(ticketId, {
      fromAdmin: false,
      senderName: senderName,
      message: messageText
    });

    // Clear form
    messageTextarea.value = '';

    // Reload conversation
    openTicketConversation(ticketId);
  };

  // ============================================
  // New Ticket Modal
  // ============================================
  let currentTicketContext = null; // Store context for ticket creation

  window.openNewTicketModal = function(prefillData = null) {
    // Store prefill data for use in submitNewTicket
    currentTicketContext = prefillData;

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'new-ticket-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container">
        <div class="ticket-modal-header">
          <h2>${prefillData ? `Question about: ${prefillData.projectTitle}` : 'Create New Support Ticket'}</h2>
          <button class="modal-close-btn" onclick="closeNewTicketModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body">
          ${prefillData ? `
            <div style="background: rgba(197, 0, 119, 0.1); border-left: 3px solid var(--dashboard-primary); padding: 1rem; margin-bottom: 1.5rem; border-radius: 8px;">
              <p style="color: var(--dashboard-text); font-size: 0.9rem; margin: 0;">
                <i class="fas fa-info-circle" style="color: var(--dashboard-primary);"></i>
                This ticket will be linked to your project: <strong>${prefillData.projectTitle}</strong>
              </p>
            </div>
          ` : ''}
          <form id="new-ticket-form" onsubmit="submitNewTicket(event)">
            ${!prefillData ? `
              <div class="form-group">
                <label for="ticket-category">
                  <i class="fas fa-tag"></i> Category *
                </label>
                <select id="ticket-category" required>
                  <option value="">Select a category...</option>
                  <option value="project_inquiry">Project Inquiry</option>
                  <option value="billing">Billing Question</option>
                  <option value="technical_support">Technical Support</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="general">General Question</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ticket-priority">
                  <i class="fas fa-exclamation-circle"></i> Priority
                </label>
                <select id="ticket-priority">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ticket-subject">
                  <i class="fas fa-heading"></i> Subject *
                </label>
                <input
                  type="text"
                  id="ticket-subject"
                  placeholder="Brief description of your issue or question"
                  required
                  maxlength="200"
                />
              </div>
            ` : ''}

            <div class="form-group">
              <label for="ticket-message">
                <i class="fas fa-comment"></i> Your Message *
              </label>
              <textarea
                id="ticket-message"
                rows="6"
                placeholder="${prefillData ? 'What would you like to know about this project?' : 'Please provide details about your request...'}"
                required
                autofocus
              ></textarea>
            </div>

            <div class="ticket-modal-actions">
              <button type="button" class="btn-secondary" onclick="closeNewTicketModal()">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-paper-plane"></i> ${prefillData ? 'Send Message' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Focus on message textarea after modal renders
    setTimeout(() => {
      const textarea = document.getElementById('ticket-message');
      if (textarea) textarea.focus();
    }, 100);
  };

  window.closeNewTicketModal = function() {
    const modal = document.getElementById('new-ticket-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
    // Clear context
    currentTicketContext = null;
  };

  window.submitNewTicket = function(event) {
    event.preventDefault();

    const message = document.getElementById('ticket-message').value.trim();

    if (!message) {
      alert('Please enter a message');
      return;
    }

    let category, priority, subject;

    // Check if we have pre-filled context (from project)
    if (currentTicketContext) {
      category = currentTicketContext.category;
      priority = 'normal';
      subject = currentTicketContext.subject;
    } else {
      // Get values from form
      category = document.getElementById('ticket-category').value;
      priority = document.getElementById('ticket-priority').value;
      subject = document.getElementById('ticket-subject').value.trim();

      if (!category || !subject) {
        alert('Please fill in all required fields');
        return;
      }
    }

    // Create ticket
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const ticket = DataManager.tickets.create({
      clientId: clientId,
      subject: subject,
      category: category,
      priority: priority,
      initialMessage: message
    });

    // Close modal
    closeNewTicketModal();

    // Show success message
    alert('Ticket created successfully! Our team will respond soon.');

    // Reload tickets list
    loadTicketsList();
  };

  // Replace old openNewMessage function
  window.openNewMessage = function() {
    openNewTicketModal();
  };

  // ============================================
  // Schedule Section
  // ============================================
  function loadScheduleSection() {
    const scheduleList = document.getElementById('schedule-list');

    if (!clientId) {
      scheduleList.innerHTML = '<p style="text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const consultations = DataManager.consultations.getAll().filter(c => {
      const client = DataManager.clients.getByEmail(c.email);
      return client && client.id === clientId;
    });

    if (consultations.length === 0) {
      scheduleList.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-calendar-alt" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Scheduled Consultations</h3>
          <p style="color: var(--dashboard-text-muted);">Book a consultation to discuss your project needs.</p>
          <button class="btn-primary" onclick="openConsultationModal()" style="margin-top: 2rem;">
            <i class="fas fa-calendar-plus"></i> Book Consultation
          </button>
        </div>
      `;
      return;
    }

    // Sort by date
    consultations.sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

    const consultationCards = consultations.map(consultation => {
      const statusClasses = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      };

      const statusLabels = {
        'pending': 'Pending Review',
        'approved': 'Approved',
        'rejected': 'Declined',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };

      const date = new Date(consultation.preferredDate);
      const canModify = consultation.status === 'pending' || consultation.status === 'approved';

      return `
        <div class="schedule-card">
          <div class="schedule-header">
            <div class="schedule-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="schedule-info">
              <h3>${consultation.service || 'Consultation'}</h3>
              <p style="color: var(--dashboard-text-muted); font-size: 0.9rem;">${consultation.name}</p>
            </div>
            <div class="schedule-status ${statusClasses[consultation.status]}">
              ${statusLabels[consultation.status] || 'Pending'}
            </div>
          </div>
          <div class="schedule-details">
            <div class="schedule-detail-item">
              <i class="fas fa-calendar"></i>
              <span>${date.toLocaleDateString()}</span>
            </div>
            <div class="schedule-detail-item">
              <i class="fas fa-clock"></i>
              <span>${consultation.preferredTime || 'N/A'}</span>
            </div>
            <div class="schedule-detail-item">
              <i class="fas fa-envelope"></i>
              <span>${consultation.email}</span>
            </div>
            ${consultation.phone ? `
              <div class="schedule-detail-item">
                <i class="fas fa-phone"></i>
                <span>${consultation.phone}</span>
              </div>
            ` : ''}
          </div>
          ${consultation.message ? `
            <div class="schedule-message">
              <strong>Message:</strong> ${consultation.message}
            </div>
          ` : ''}
          ${canModify ? `
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--dashboard-border);">
              <button class="btn-secondary" onclick="rescheduleConsultation('${consultation.id}')" style="flex: 1;">
                <i class="fas fa-calendar-alt"></i> Reschedule
              </button>
              <button class="btn-secondary" onclick="cancelConsultation('${consultation.id}')" style="flex: 1; background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444;">
                <i class="fas fa-times-circle"></i> Cancel
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Always show Book Consultation button at the bottom
    scheduleList.innerHTML = consultationCards + `
      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn-primary" onclick="openConsultationModal()">
          <i class="fas fa-calendar-plus"></i> Book Another Consultation
        </button>
      </div>
    `;
  }

  // ============================================
  // Consultation Booking Modal
  // ============================================
  let clientBookingCalendarDate = new Date();
  let selectedTimeSlot = null;

  window.openConsultationModal = function() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const availableSlots = DataManager.timeslots.getAvailable();

    const modal = document.createElement('div');
    modal.id = 'consultation-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container" style="max-width: 800px;">
        <div class="ticket-modal-header">
          <h2>Book a Consultation</h2>
          <button class="modal-close-btn" onclick="closeConsultationModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body" style="max-height: 70vh; overflow-y: auto;">
          <form id="consultation-form" onsubmit="submitConsultation(event)">
            <div class="form-group">
              <label for="consultation-service">
                <i class="fas fa-briefcase"></i> Service Type *
              </label>
              <select id="consultation-service" required>
                <option value="">Select a service...</option>
                <option value="Website Development">Website Development</option>
                <option value="Brand Identity">Brand Identity</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="SEO Optimization">SEO Optimization</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Content Creation">Content Creation</option>
                <option value="E-commerce Solutions">E-commerce Solutions</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            ${availableSlots.length === 0 ? `
              <div style="padding: 2rem; text-align: center; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="color: #ef4444; margin-bottom: 0.5rem;">No Time Slots Available</h3>
                <p style="color: var(--dashboard-text-muted);">There are currently no available time slots. Please check back later or contact us directly.</p>
              </div>
            ` : `
              <div class="form-group">
                <label>
                  <i class="fas fa-calendar"></i> Select Date & Time *
                </label>
                <div id="client-booking-calendar"></div>
              </div>

              <input type="hidden" id="selected-slot-id" required>

              <div class="form-group">
                <label for="consultation-phone">
                  <i class="fas fa-phone"></i> Phone Number
                </label>
                <input type="tel" id="consultation-phone" placeholder="Your contact number">
              </div>

              <div class="form-group">
                <label for="consultation-message">
                  <i class="fas fa-comment"></i> Description *
                </label>
                <textarea
                  id="consultation-message"
                  rows="4"
                  placeholder="Please describe your project idea, goals, or what you'd like to discuss during the consultation..."
                  required
                ></textarea>
              </div>

              <div class="ticket-modal-actions">
                <button type="button" class="btn-secondary" onclick="closeConsultationModal()">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fas fa-calendar-check"></i> Book Consultation
                </button>
              </div>
            `}
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    if (availableSlots.length > 0) {
      renderClientBookingCalendar(clientBookingCalendarDate);
    }
  };

  function renderClientBookingCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthDays = prevLastDay.getDate();

    const availableSlots = DataManager.timeslots.getAvailable();
    const slotsByDate = {};

    availableSlots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });

    let calendarHTML = `
      <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--dashboard-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <button type="button" class="btn-secondary" onclick="previousBookingMonth()" style="padding: 0.5rem 1rem;">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 style="margin: 0;">${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button type="button" class="btn-secondary" onclick="nextBookingMonth()" style="padding: 0.5rem 1rem;">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.3rem; margin-bottom: 0.5rem;">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            `<div style="text-align: center; font-weight: 700; padding: 0.3rem; font-size: 0.85rem; color: var(--dashboard-text-muted);">${day}</div>`
          ).join('')}
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.3rem;">
    `;

    // Previous month days
    const startDay = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      calendarHTML += `
        <div style="padding: 0.75rem; text-align: center; opacity: 0.3; background: rgba(255,255,255,0.02); border-radius: 6px; min-height: 50px;">
          <div style="font-size: 0.9rem;">${day}</div>
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
      const daySlots = slotsByDate[dateStr] || [];
      const isPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();
      const hasSlots = daySlots.length > 0;

      calendarHTML += `
        <div onclick="${hasSlots && !isPast ? `showAvailableSlots('${dateStr}')` : ''}" style="
          padding: 0.5rem;
          background: ${isToday ? 'rgba(197, 0, 119, 0.2)' : 'rgba(255,255,255,0.05)'};
          border: ${isToday ? '2px solid var(--dashboard-primary)' : '1px solid var(--dashboard-border)'};
          border-radius: 6px;
          cursor: ${hasSlots && !isPast ? 'pointer' : 'default'};
          transition: all 0.2s;
          opacity: ${isPast ? '0.4' : hasSlots ? '1' : '0.6'};
          min-height: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        " ${hasSlots && !isPast ? `onmouseover="this.style.background='rgba(197, 0, 119, 0.3)'" onmouseout="this.style.background='${isToday ? 'rgba(197, 0, 119, 0.2)' : 'rgba(255,255,255,0.05)'}'"` : ''}>
          <div style="font-weight: ${isToday ? '700' : '500'}; font-size: 0.95rem;">
            ${day}
          </div>
          ${hasSlots ? `
            <div style="margin-top: 0.2rem; font-size: 0.65rem; color: #10b981;">
              ${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    // Next month days
    const remainingCells = 42 - (startDay + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      calendarHTML += `
        <div style="padding: 0.75rem; text-align: center; opacity: 0.3; background: rgba(255,255,255,0.02); border-radius: 6px; min-height: 50px;">
          <div style="font-size: 0.9rem;">${i}</div>
        </div>
      `;
    }

    calendarHTML += `
        </div>
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 6px; border: 1px solid #10b981;">
          <p style="margin: 0; font-size: 0.85rem; color: #10b981; text-align: center;">
            <i class="fas fa-info-circle"></i> Click on a date with available slots to select your time
          </p>
        </div>
      </div>
    `;

    const container = document.getElementById('client-booking-calendar');
    if (container) {
      container.innerHTML = calendarHTML;
    }
  }

  window.previousBookingMonth = function() {
    clientBookingCalendarDate.setMonth(clientBookingCalendarDate.getMonth() - 1);
    renderClientBookingCalendar(clientBookingCalendarDate);
  };

  window.nextBookingMonth = function() {
    clientBookingCalendarDate.setMonth(clientBookingCalendarDate.getMonth() + 1);
    renderClientBookingCalendar(clientBookingCalendarDate);
  };

  window.showAvailableSlots = function(dateStr) {
    const availableSlots = DataManager.timeslots.getAvailable();
    const daySlots = availableSlots.filter(s => s.date === dateStr);
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const existingSlotSelector = document.getElementById('slot-selector-panel');
    if (existingSlotSelector) existingSlotSelector.remove();

    const panel = document.createElement('div');
    panel.id = 'slot-selector-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--dashboard-card);
      border: 2px solid var(--dashboard-primary);
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10001;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;

    panel.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: var(--dashboard-primary);">
        <i class="fas fa-calendar-day"></i> ${formattedDate}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${daySlots.map(slot => `
          <button type="button" onclick="selectTimeSlot('${slot.id}', '${dateStr}', '${slot.startTime}', '${slot.endTime}')" style="
            padding: 1rem;
            background: rgba(255,255,255,0.05);
            border: 2px solid ${selectedTimeSlot === slot.id ? 'var(--dashboard-primary)' : 'var(--dashboard-border)'};
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
            font-size: 1rem;
            color: white;
          " onmouseover="this.style.borderColor='var(--dashboard-primary)'" onmouseout="this.style.borderColor='${selectedTimeSlot === slot.id ? 'var(--dashboard-primary)' : 'var(--dashboard-border)'}'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <i class="fas fa-clock"></i> <strong>${slot.startTime} - ${slot.endTime}</strong>
              </div>
              ${selectedTimeSlot === slot.id ? '<i class="fas fa-check-circle" style="color: var(--dashboard-primary);"></i>' : ''}
            </div>
          </button>
        `).join('')}
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
        <button type="button" onclick="closeSlotSelector()" class="btn-secondary" style="flex: 1;">
          Cancel
        </button>
        <button type="button" onclick="confirmSlotSelection()" class="btn-primary" style="flex: 1;" ${!selectedTimeSlot ? 'disabled' : ''}>
          <i class="fas fa-check"></i> Confirm
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  };

  window.selectTimeSlot = function(slotId, date, startTime, endTime) {
    selectedTimeSlot = slotId;
    document.getElementById('selected-slot-id').value = slotId;

    // Update all slot buttons
    const slotButtons = document.querySelectorAll('#slot-selector-panel button[type="button"]');
    slotButtons.forEach(btn => {
      if (btn.onclick && btn.onclick.toString().includes(slotId)) {
        btn.style.borderColor = 'var(--dashboard-primary)';
        if (!btn.querySelector('.fa-check-circle')) {
          btn.querySelector('div').innerHTML += '<i class="fas fa-check-circle" style="color: var(--dashboard-primary);"></i>';
        }
      } else if (btn.onclick && btn.onclick.toString().includes('selectTimeSlot')) {
        btn.style.borderColor = 'var(--dashboard-border)';
        const checkIcon = btn.querySelector('.fa-check-circle');
        if (checkIcon) checkIcon.remove();
      }
    });

    // Enable confirm button
    const confirmBtn = document.querySelector('#slot-selector-panel button.btn-primary');
    if (confirmBtn) confirmBtn.disabled = false;
  };

  window.confirmSlotSelection = function() {
    closeSlotSelector();
    // Visual feedback
    const calendarContainer = document.getElementById('client-booking-calendar');
    if (calendarContainer) {
      const slot = DataManager.timeslots.getAll().find(s => s.id === selectedTimeSlot);
      if (slot) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'padding: 1rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 1rem; text-align: center;';
        successMsg.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> Selected: ${new Date(slot.date).toLocaleDateString()} at ${slot.startTime} - ${slot.endTime}`;
        calendarContainer.parentElement.insertBefore(successMsg, calendarContainer);
      }
    }
  };

  window.closeSlotSelector = function() {
    const panel = document.getElementById('slot-selector-panel');
    if (panel) panel.remove();
  };

  window.closeConsultationModal = function() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  };

  window.submitConsultation = function(event) {
    event.preventDefault();

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const service = document.getElementById('consultation-service').value;
    const slotIdInput = document.getElementById('selected-slot-id');
    const slotId = slotIdInput ? slotIdInput.value : null;
    const phone = document.getElementById('consultation-phone').value;
    const message = document.getElementById('consultation-message').value;

    if (!service || !message) {
      alert('Please fill in all required fields');
      return;
    }

    if (!slotId) {
      alert('Please select a time slot from the calendar');
      return;
    }

    // Get the selected slot details
    const slot = DataManager.timeslots.getAll().find(s => s.id === slotId);
    if (!slot || !slot.available) {
      alert('Selected time slot is no longer available. Please choose another slot.');
      closeConsultationModal();
      setTimeout(() => openConsultationModal(), 300);
      return;
    }

    // Create consultation request
    const consultation = DataManager.consultations.create({
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Client',
      email: userData.email || '',
      phone: phone,
      service: service,
      preferredDate: slot.date,
      preferredTime: slot.startTime,
      message: message,
      status: 'pending',
      timeSlotId: slotId
    });

    // Book the time slot
    DataManager.timeslots.book(slotId, consultation.id, clientId);

    // Reset selection
    selectedTimeSlot = null;

    closeConsultationModal();
    alert('Consultation booked successfully! We will review your request and contact you soon.');
    loadScheduleSection();
  };

  // Cancel Consultation
  window.cancelConsultation = function(consultationId) {
    const modal = document.createElement('div');
    modal.id = 'cancel-consultation-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container" style="max-width: 500px;">
        <div class="ticket-modal-header">
          <h2>Cancel Consultation</h2>
          <button class="modal-close-btn" onclick="closeCancelModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body">
          <form id="cancel-form" onsubmit="submitCancellation(event, '${consultationId}')">
            <div class="form-group">
              <label for="cancel-reason">
                <i class="fas fa-comment"></i> Reason for Cancellation *
              </label>
              <textarea
                id="cancel-reason"
                rows="4"
                placeholder="Please let us know why you need to cancel..."
                required
              ></textarea>
            </div>
            <div class="ticket-modal-actions">
              <button type="button" class="btn-secondary" onclick="closeCancelModal()">
                Keep Consultation
              </button>
              <button type="submit" class="btn-secondary" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444;">
                <i class="fas fa-times-circle"></i> Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  };

  window.closeCancelModal = function() {
    const modal = document.getElementById('cancel-consultation-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  };

  window.submitCancellation = function(event, consultationId) {
    event.preventDefault();
    const reason = document.getElementById('cancel-reason').value;

    // Update consultation status to cancelled
    DataManager.consultations.update(consultationId, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    });

    // Release the time slot if it was booked
    const consultation = DataManager.consultations.getById(consultationId);
    if (consultation && consultation.timeSlotId) {
      DataManager.timeslots.release(consultation.timeSlotId);
    }

    closeCancelModal();
    alert('Consultation cancelled successfully.');
    loadScheduleSection();
  };

  // Reschedule Consultation
  window.rescheduleConsultation = function(consultationId) {
    const availableSlots = DataManager.timeslots.getAvailable();
    const consultation = DataManager.consultations.getById(consultationId);

    const modal = document.createElement('div');
    modal.id = 'reschedule-consultation-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container" style="max-width: 600px;">
        <div class="ticket-modal-header">
          <h2>Reschedule Consultation</h2>
          <button class="modal-close-btn" onclick="closeRescheduleModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body">
          <form id="reschedule-form" onsubmit="submitReschedule(event, '${consultationId}')">
            <div class="form-group">
              <label for="reschedule-reason">
                <i class="fas fa-comment"></i> Reason for Rescheduling *
              </label>
              <textarea
                id="reschedule-reason"
                rows="3"
                placeholder="Please let us know why you need to reschedule..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="new-slot">
                <i class="fas fa-clock"></i> Select New Time Slot *
              </label>
              <select id="new-slot" required>
                <option value="">Choose available slot...</option>
                ${availableSlots.map(slot => `
                  <option value="${slot.id}">
                    ${new Date(slot.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}
                    - ${slot.startTime} to ${slot.endTime}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="ticket-modal-actions">
              <button type="button" class="btn-secondary" onclick="closeRescheduleModal()">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-calendar-check"></i> Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  };

  window.closeRescheduleModal = function() {
    const modal = document.getElementById('reschedule-consultation-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  };

  window.submitReschedule = function(event, consultationId) {
    event.preventDefault();
    const reason = document.getElementById('reschedule-reason').value;
    const newSlotId = document.getElementById('new-slot').value;

    if (!newSlotId) {
      alert('Please select a new time slot');
      return;
    }

    const consultation = DataManager.consultations.getById(consultationId);
    const newSlot = DataManager.timeslots.getAll().find(s => s.id === newSlotId);

    if (!newSlot) {
      alert('Selected time slot not found');
      return;
    }

    // Release old time slot if it exists
    if (consultation.timeSlotId) {
      DataManager.timeslots.release(consultation.timeSlotId);
    }

    // Book new time slot
    DataManager.timeslots.book(newSlotId, consultationId, consultation.clientId);

    // Update consultation
    DataManager.consultations.update(consultationId, {
      preferredDate: newSlot.date,
      preferredTime: newSlot.startTime,
      timeSlotId: newSlotId,
      rescheduleReason: reason,
      rescheduledAt: new Date().toISOString()
    });

    closeRescheduleModal();
    alert('Consultation rescheduled successfully!');
    loadScheduleSection();
  };

  // ============================================
  // Invoices Section
  // ============================================
  function loadInvoicesSection() {
    const invoicesList = document.getElementById('invoices-list');

    if (!clientId) {
      invoicesList.innerHTML = '<p style="text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const invoices = DataManager.invoices.getByClient(clientId);

    if (invoices.length === 0) {
      invoicesList.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-file-invoice-dollar" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Invoices Yet</h3>
          <p style="color: var(--dashboard-text-muted);">Your invoices will appear here once projects begin.</p>
        </div>
      `;
      return;
    }

    // Sort by date (newest first)
    invoices.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    invoicesList.innerHTML = invoices.map(invoice => {
      const statusClasses = {
        'pending': 'invoice-status-pending',
        'paid': 'invoice-status-paid',
        'overdue': 'invoice-status-overdue'
      };

      const statusLabels = {
        'pending': 'Pending',
        'paid': 'Paid',
        'overdue': 'Overdue'
      };

      const issueDate = new Date(invoice.issueDate);
      const dueDate = new Date(invoice.dueDate);

      return `
        <div class="invoice-card">
          <div class="invoice-header">
            <div class="invoice-number">
              <i class="fas fa-file-invoice"></i>
              <span>Invoice #${invoice.invoiceNumber}</span>
            </div>
            <div class="invoice-status ${statusClasses[invoice.status]}">
              ${statusLabels[invoice.status] || 'Pending'}
            </div>
          </div>
          <div class="invoice-details">
            <div class="invoice-detail-row">
              <span class="invoice-label">Project:</span>
              <span class="invoice-value">${invoice.projectTitle || 'N/A'}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-label">Amount:</span>
              <span class="invoice-value invoice-amount">€${(invoice.amount || 0).toLocaleString()}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-label">Issue Date:</span>
              <span class="invoice-value">${issueDate.toLocaleDateString()}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-label">Due Date:</span>
              <span class="invoice-value">${dueDate.toLocaleDateString()}</span>
            </div>
          </div>
          <div class="invoice-actions">
            <button class="btn-secondary" onclick="viewInvoice('${invoice.id}')">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn-secondary" onclick="downloadInvoice('${invoice.id}')">
              <i class="fas fa-download"></i> Download
            </button>
            ${invoice.status === 'pending' || invoice.status === 'overdue' ? `
              <button class="btn-primary" onclick="payInvoice('${invoice.id}')">
                <i class="fas fa-credit-card"></i> Pay Now
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // Reports Section
  // ============================================
  function loadReportsSection() {
    const reportsList = document.getElementById('reports-list');

    if (!clientId) {
      reportsList.innerHTML = '<p style="text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const projects = DataManager.projects.getByClient(clientId);

    reportsList.innerHTML = `
      <div class="reports-intro">
        <p style="color: var(--dashboard-text-muted); margin-bottom: 2rem;">
          Generate comprehensive reports for your projects including performance metrics, analytics data, and campaign summaries.
        </p>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <div class="report-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Performance Report</h3>
          <p>Detailed analytics and KPI tracking for all your active campaigns</p>
          <button class="btn-secondary" onclick="generatePerformanceReport()">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>

        <div class="report-card">
          <div class="report-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <h3>Project Summary</h3>
          <p>Comprehensive overview of all project milestones and deliverables</p>
          <button class="btn-secondary" onclick="generateProjectReport()">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>

        <div class="report-card">
          <div class="report-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <h3>Financial Report</h3>
          <p>Complete breakdown of invoices, payments, and budget allocation</p>
          <button class="btn-secondary" onclick="generateFinancialReport()">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>

        <div class="report-card">
          <div class="report-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <h3>Monthly Summary</h3>
          <p>Month-by-month breakdown of activities and achievements</p>
          <button class="btn-secondary" onclick="generateMonthlyReport()">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>

      ${projects.length > 0 ? `
        <div class="recent-reports" style="margin-top: 3rem;">
          <h3 style="margin-bottom: 1.5rem;">Project-Specific Reports</h3>
          <div class="project-reports-list">
            ${projects.map(project => `
              <div class="project-report-item">
                <i class="fas fa-file-pdf"></i>
                <span>${project.title}</span>
                <button class="btn-secondary" onclick="generateProjectSpecificReport('${project.id}')">
                  <i class="fas fa-download"></i> Generate
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  // ============================================
  // Helper Functions for Sections
  // ============================================
  window.openNewMessage = function() {
    const message = prompt('Enter your message to the Waarheid Marketing team:');
    if (message && message.trim()) {
      DataManager.messages.create({
        clientId: clientId,
        subject: 'Message from Client',
        message: message.trim(),
        fromAdmin: false,
        read: false
      });
      alert('Message sent successfully!');
      loadMessagesSection();
    }
  };

  window.bookConsultation = function() {
    window.location.href = 'booking.html';
  };

  window.generateReport = function() {
    alert('Report generation feature: This would generate a comprehensive report. For demo purposes, reports are generated per type.');
  };

  window.viewInvoice = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);
    if (!invoice) return;

    const client = DataManager.clients.getById(invoice.clientId);
    const project = invoice.projectId ? DataManager.projects.getById(invoice.projectId) : null;
    const issueDate = new Date(invoice.issueDate);
    const dueDate = new Date(invoice.dueDate);

    const modal = document.createElement('div');
    modal.id = 'invoice-view-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container" style="max-width: 700px;">
        <div class="ticket-modal-header">
          <h2>Invoice Details</h2>
          <button class="modal-close-btn" onclick="closeInvoiceViewModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body">
          <div style="background: var(--dashboard-card); padding: 2rem; border-radius: 12px; border: 1px solid var(--dashboard-border);">
            <!-- Invoice Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--dashboard-border);">
              <div>
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--dashboard-primary);">INVOICE</h1>
                <p style="color: var(--dashboard-text-muted); font-size: 0.9rem;">${invoice.invoiceNumber}</p>
              </div>
              <div style="text-align: right;">
                <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">Waarheid Marketing</h3>
                <p style="color: var(--dashboard-text-muted); font-size: 0.85rem; line-height: 1.6;">
                  Digital Marketing Agency<br>
                  info@waarheid.nl<br>
                  +31 20 123 4567
                </p>
              </div>
            </div>

            <!-- Bill To & Invoice Info -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
              <div>
                <h4 style="color: var(--dashboard-primary); margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Bill To:</h4>
                <p style="color: var(--dashboard-text); line-height: 1.8; font-size: 0.95rem;">
                  <strong>${client ? client.firstName + ' ' + client.lastName : 'N/A'}</strong><br>
                  ${client ? client.company || '' : ''}<br>
                  ${client ? client.email : ''}
                </p>
              </div>
              <div>
                <h4 style="color: var(--dashboard-primary); margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Invoice Details:</h4>
                <div style="line-height: 1.8; font-size: 0.95rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--dashboard-text-muted);">Issue Date:</span>
                    <strong style="color: var(--dashboard-text);">${issueDate.toLocaleDateString()}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--dashboard-text-muted);">Due Date:</span>
                    <strong style="color: var(--dashboard-text);">${dueDate.toLocaleDateString()}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--dashboard-text-muted);">Status:</span>
                    <span class="invoice-status-${invoice.status}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${invoice.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Info -->
            ${project ? `
              <div style="background: rgba(197, 0, 119, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 3px solid var(--dashboard-primary);">
                <p style="color: var(--dashboard-text); font-size: 0.95rem;">
                  <strong>Project:</strong> ${project.title}
                </p>
              </div>
            ` : ''}

            <!-- Description -->
            <div style="margin-bottom: 2rem;">
              <h4 style="color: var(--dashboard-primary); margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Description:</h4>
              <p style="color: var(--dashboard-text); line-height: 1.6;">${invoice.description || 'Marketing services'}</p>
            </div>

            <!-- Amount -->
            <div style="background: rgba(197, 0, 119, 0.1); padding: 1.5rem; border-radius: 8px; margin-top: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: var(--dashboard-text); font-size: 1.2rem;">Total Amount:</h3>
                <h2 style="color: var(--dashboard-primary); font-size: 2rem; font-weight: 700;">€${(invoice.amount || 0).toLocaleString()}</h2>
              </div>
            </div>

            ${invoice.paidDate ? `
              <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <p style="color: #10b981; font-size: 0.9rem; margin: 0;">
                  <i class="fas fa-check-circle"></i> Paid on ${new Date(invoice.paidDate).toLocaleDateString()}
                </p>
              </div>
            ` : ''}
          </div>

          <div class="ticket-modal-actions" style="margin-top: 1.5rem;">
            <button class="btn-secondary" onclick="closeInvoiceViewModal()">
              Close
            </button>
            <button class="btn-primary" onclick="downloadInvoice('${invoiceId}'); closeInvoiceViewModal();">
              <i class="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  };

  window.closeInvoiceViewModal = function() {
    const modal = document.getElementById('invoice-view-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  };

  window.downloadInvoice = function(invoiceId) {
    const invoice = DataManager.invoices.getById(invoiceId);
    if (!invoice) return;

    const client = DataManager.clients.getById(invoice.clientId);
    const project = invoice.projectId ? DataManager.projects.getById(invoice.projectId) : null;

    // Create printable HTML content
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #c50077; }
    .company-info h1 { color: #c50077; font-size: 32px; margin-bottom: 10px; }
    .invoice-info { text-align: right; }
    .section { margin-bottom: 30px; }
    .section h3 { color: #c50077; margin-bottom: 15px; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .total-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 30px; }
    .total-amount { font-size: 28px; color: #c50077; font-weight: bold; text-align: right; }
    .status-badge { padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; color: #c50077; font-weight: 600; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="company-info">
      <h1>INVOICE</h1>
      <p><strong>${invoice.invoiceNumber}</strong></p>
    </div>
    <div class="invoice-info">
      <h2 style="color: #c50077; margin-bottom: 10px;">Waarheid Marketing</h2>
      <p>Digital Marketing Agency</p>
      <p>info@waarheid.nl</p>
      <p>+31 20 123 4567</p>
    </div>
  </div>

  <div class="details-grid">
    <div class="section">
      <h3>Bill To:</h3>
      <p><strong>${client ? client.firstName + ' ' + client.lastName : 'N/A'}</strong></p>
      <p>${client ? client.company || '' : ''}</p>
      <p>${client ? client.email : ''}</p>
    </div>
    <div class="section">
      <h3>Invoice Details:</h3>
      <table style="border: none;">
        <tr><td style="border: none;"><strong>Issue Date:</strong></td><td style="border: none;">${new Date(invoice.issueDate).toLocaleDateString()}</td></tr>
        <tr><td style="border: none;"><strong>Due Date:</strong></td><td style="border: none;">${new Date(invoice.dueDate).toLocaleDateString()}</td></tr>
        <tr><td style="border: none;"><strong>Status:</strong></td><td style="border: none;"><span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span></td></tr>
      </table>
    </div>
  </div>

  ${project ? `
    <div class="section" style="background: #fef3f2; padding: 15px; border-radius: 8px; border-left: 4px solid #c50077;">
      <p><strong>Project:</strong> ${project.title}</p>
    </div>
  ` : ''}

  <div class="section">
    <h3>Description:</h3>
    <p>${invoice.description || 'Marketing services'}</p>
  </div>

  <div class="total-section">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="color: #333;">Total Amount:</h3>
      <div class="total-amount">€${(invoice.amount || 0).toLocaleString()}</div>
    </div>
  </div>

  ${invoice.paidDate ? `
    <div style="margin-top: 20px; padding: 15px; background: #d1fae5; border-radius: 8px; border: 1px solid #10b981;">
      <p style="color: #065f46; font-weight: bold;">✓ Paid on ${new Date(invoice.paidDate).toLocaleDateString()}</p>
    </div>
  ` : ''}

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
    <p>Thank you for your business!</p>
    <p>If you have any questions, please contact us at info@waarheid.nl</p>
  </div>
</body>
</html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  window.payInvoice = function(invoiceId) {
    if (confirm('Proceed to payment gateway?')) {
      alert('Payment feature: This would redirect to a secure payment processor. Demo mode only.');
    }
  };

  window.generatePerformanceReport = function() {
    alert('Generating Performance Report... This would create a PDF with all analytics and KPIs. Demo mode only.');
  };

  window.generateProjectReport = function() {
    alert('Generating Project Summary Report... This would create a detailed project overview. Demo mode only.');
  };

  window.generateFinancialReport = function() {
    alert('Generating Financial Report... This would create a complete financial breakdown. Demo mode only.');
  };

  window.generateMonthlyReport = function() {
    alert('Generating Monthly Summary Report... This would create a month-by-month report. Demo mode only.');
  };

  window.generateProjectSpecificReport = function(projectId) {
    const project = DataManager.projects.getById(projectId);
    if (project) {
      alert(`Generating report for: ${project.title}... This would create a project-specific report. Demo mode only.`);
    }
  };

  // ============================================
  // Profile Section
  // ============================================
  function loadProfileSection() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userEmail = localStorage.getItem('userEmail') || '';

    mainContent.innerHTML = `
      <div class="dashboard-section-header">
        <h2><i class="fas fa-user-circle"></i> My Profile</h2>
      </div>

      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; max-width: 1200px;">
        <!-- Profile Sidebar -->
        <div>
          <div class="dashboard-card" style="text-align: center;">
            <div style="width: 150px; height: 150px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #c50077, #ff0095); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-user" style="font-size: 4rem; color: white;"></i>
            </div>
            <h2 style="margin: 0 0 0.5rem 0;">${userData.firstName || 'Client'} ${userData.lastName || ''}</h2>
            <p style="color: var(--dashboard-text-muted); margin: 0 0 1rem 0;">${userEmail}</p>
            <span class="status-badge active">Client</span>

            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
              <button class="btn-primary" onclick="editProfilePhoto()" style="width: 100%; margin-bottom: 0.5rem;">
                <i class="fas fa-camera"></i> Change Photo
              </button>
              <button class="btn-secondary" onclick="navigateToSection('settings')" style="width: 100%;">
                <i class="fas fa-cog"></i> Settings
              </button>
            </div>
          </div>

          <div class="dashboard-card" style="margin-top: 1rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-chart-line"></i> My Projects</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Active:</span>
                <strong>${DataManager.projects.getAll().filter(p => p.status === 'in_progress').length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Completed:</span>
                <strong>${DataManager.projects.getAll().filter(p => p.status === 'completed').length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--dashboard-text-muted);">Total:</span>
                <strong>${DataManager.projects.getAll().length}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <div>
          <div class="dashboard-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <h2 style="margin: 0;"><i class="fas fa-info-circle"></i> Personal Information</h2>
              <button class="btn-primary" onclick="editProfileInfo()">
                <i class="fas fa-edit"></i> Edit Profile
              </button>
            </div>

            <form id="client-profile-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" id="profile-firstname" value="${userData.firstName || ''}" readonly>
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" id="profile-lastname" value="${userData.lastName || ''}" readonly>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" id="profile-email" value="${userEmail}" readonly>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" id="profile-phone" value="${userData.phone || ''}" readonly>
                </div>
              </div>

              <div class="form-group">
                <label>Company</label>
                <input type="text" id="profile-company" value="${userData.company || ''}" readonly>
              </div>
            </form>
          </div>

          <div class="dashboard-card" style="margin-top: 1.5rem;">
            <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-clock"></i> Account Information</h2>
            <div style="display: grid; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <span><i class="fas fa-calendar-plus" style="margin-right: 0.5rem; color: #c50077;"></i> Member Since:</span>
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

  window.editProfileInfo = function() {
    const inputs = ['profile-firstname', 'profile-lastname', 'profile-phone', 'profile-company'];
    const isEditing = document.getElementById('profile-firstname').hasAttribute('readonly');

    if (isEditing) {
      // Enable editing
      inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.removeAttribute('readonly');
      });

      // Show save/cancel buttons
      const form = document.getElementById('client-profile-form');
      if (form && !document.getElementById('profile-actions')) {
        form.insertAdjacentHTML('afterend', `
          <div id="profile-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="btn-primary" onclick="saveProfileInfo()" style="flex: 1;">
              <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="btn-secondary" onclick="loadProfileSection()" style="flex: 1;">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        `);
      }

      // Update edit button
      event.target.innerHTML = '<i class="fas fa-times"></i> Cancel Edit';
      event.target.onclick = () => loadProfileSection();
    }
  };

  window.saveProfileInfo = function() {
    const userData = {
      firstName: document.getElementById('profile-firstname').value,
      lastName: document.getElementById('profile-lastname').value,
      phone: document.getElementById('profile-phone').value,
      company: document.getElementById('profile-company').value,
      email: localStorage.getItem('userEmail'),
      createdAt: JSON.parse(localStorage.getItem('userData') || '{}').createdAt || new Date().toISOString()
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Profile updated successfully!');
    loadProfileSection();
  };

  window.editProfilePhoto = function() {
    alert('Profile picture upload functionality would be implemented here with a file upload dialog.');
  };

  // ============================================
  // Settings Section
  // ============================================
  function loadSettingsSection() {
    mainContent.innerHTML = `
      <div class="dashboard-section-header">
        <h2><i class="fas fa-cog"></i> Settings</h2>
      </div>

      <div style="max-width: 900px;">
        <!-- Account Security -->
        <div class="dashboard-card" style="margin-bottom: 1.5rem;">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-user-shield"></i> Account Security</h2>

          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Change Password</h3>
            <form id="change-password-form" onsubmit="changeClientPassword(event)">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label>Current Password</label>
                <input type="password" id="current-password" required>
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label>New Password</label>
                <input type="password" id="new-password" required minlength="8">
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label>Confirm New Password</label>
                <input type="password" id="confirm-password" required>
              </div>
              <button type="submit" class="btn-primary">
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
              <button class="btn-secondary" onclick="enableClient2FA()">
                <i class="fas fa-plus"></i> Enable
              </button>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div class="dashboard-card" style="margin-bottom: 1.5rem;">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-bell"></i> Notification Preferences</h2>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Email Notifications</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Receive email updates about your projects</div>
              </div>
              <input type="checkbox" id="client-email-notifications" checked onchange="saveClientNotifications()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Project Updates</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Get notified about project milestones and changes</div>
              </div>
              <input type="checkbox" id="client-project-updates" checked onchange="saveClientNotifications()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Invoice Reminders</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Receive reminders for pending invoices</div>
              </div>
              <input type="checkbox" id="client-invoice-reminders" checked onchange="saveClientNotifications()" style="width: 20px; height: 20px;">
            </label>

            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">Marketing Communications</div>
                <div style="font-size: 0.9rem; color: var(--dashboard-text-muted);">Receive newsletters and promotional updates</div>
              </div>
              <input type="checkbox" id="client-marketing" onchange="saveClientNotifications()" style="width: 20px; height: 20px;">
            </label>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="dashboard-card">
          <h2 style="margin: 0 0 1.5rem 0;"><i class="fas fa-palette"></i> Appearance</h2>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label>Theme</label>
            <select id="client-theme-select" onchange="changeClientTheme(this.value)">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="auto">Auto (System Preference)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Language</label>
            <select id="client-language-select" onchange="changeClientLanguage(this.value)">
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  window.changeClientPassword = function(event) {
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

  window.enableClient2FA = function() {
    alert('Two-factor authentication setup would be implemented here. You would scan a QR code with an authenticator app.');
  };

  window.saveClientNotifications = function() {
    const settings = {
      emailNotifications: document.getElementById('client-email-notifications').checked,
      projectUpdates: document.getElementById('client-project-updates').checked,
      invoiceReminders: document.getElementById('client-invoice-reminders').checked,
      marketing: document.getElementById('client-marketing').checked
    };

    localStorage.setItem('clientNotificationSettings', JSON.stringify(settings));
  };

  window.changeClientTheme = function(theme) {
    localStorage.setItem('theme', theme);
    alert(`Theme changed to: ${theme}`);
  };

  window.changeClientLanguage = function(language) {
    localStorage.setItem('language', language);
    alert(`Language changed to: ${language}`);
  };

  // ============================================
  // User Menu - Dropdown Event Listeners
  // ============================================
  const userDropdownLinks = document.querySelectorAll('.user-dropdown a[data-section]');
  userDropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        // Close the user menu
        document.querySelector('.user-menu').classList.remove('active');
        // Navigate to the section
        navigateToSection(section);
      }
    });
  });

  console.log('Waarheid Marketing - Client Dashboard Loaded');
});
