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
          <h3>Milestones & Timeline</h3>
          <div class="project-milestones">
            ${project.milestones.map(milestone => `
              <div class="milestone-item">
                <div class="milestone-icon ${milestone.completed ? 'completed' : 'pending'}">
                  <i class="fas ${milestone.completed ? 'fa-check' : 'fa-clock'}"></i>
                </div>
                <div class="milestone-info">
                  <div class="milestone-title">${milestone.title}</div>
                  <div class="milestone-date">${milestone.date}</div>
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

    scheduleList.innerHTML = consultations.map(consultation => {
      const statusClasses = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'completed': 'status-completed'
      };

      const statusLabels = {
        'pending': 'Pending Review',
        'approved': 'Approved',
        'rejected': 'Declined',
        'completed': 'Completed'
      };

      const date = new Date(consultation.preferredDate);

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
        </div>
      `;
    }).join('');
  }

  // ============================================
  // Consultation Booking Modal
  // ============================================
  window.openConsultationModal = function() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const modal = document.createElement('div');
    modal.id = 'consultation-modal';
    modal.className = 'ticket-modal-overlay active';
    modal.innerHTML = `
      <div class="ticket-modal-container" style="max-width: 600px;">
        <div class="ticket-modal-header">
          <h2>Book a Consultation</h2>
          <button class="modal-close-btn" onclick="closeConsultationModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="ticket-modal-body">
          <form id="consultation-form" onsubmit="submitConsultation(event)">
            <div class="form-group">
              <label for="consultation-service">
                <i class="fas fa-briefcase"></i> Service Type *
              </label>
              <select id="consultation-service" required>
                <option value="">Select a service...</option>
                <option value="SEO Optimization">SEO Optimization</option>
                <option value="Social Media Marketing">Social Media Marketing</option>
                <option value="Content Marketing">Content Marketing</option>
                <option value="PPC Advertising">PPC Advertising</option>
                <option value="Web Design">Web Design</option>
                <option value="Branding Strategy">Branding Strategy</option>
                <option value="New Project Idea">New Project Idea</option>
                <option value="General Consultation">General Consultation</option>
              </select>
            </div>

            <div class="form-group">
              <label for="consultation-date">
                <i class="fas fa-calendar"></i> Preferred Date *
              </label>
              <input type="date" id="consultation-date" required min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
              <label for="consultation-time">
                <i class="fas fa-clock"></i> Preferred Time Slot *
              </label>
              <select id="consultation-time" required>
                <option value="">Select time slot...</option>
                <option value="09:00 - 10:00">09:00 - 10:00 (Morning)</option>
                <option value="10:00 - 11:00">10:00 - 11:00 (Morning)</option>
                <option value="11:00 - 12:00">11:00 - 12:00 (Late Morning)</option>
                <option value="13:00 - 14:00">13:00 - 14:00 (Afternoon)</option>
                <option value="14:00 - 15:00">14:00 - 15:00 (Afternoon)</option>
                <option value="15:00 - 16:00">15:00 - 16:00 (Afternoon)</option>
                <option value="16:00 - 17:00">16:00 - 17:00 (Late Afternoon)</option>
              </select>
            </div>

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
                rows="6"
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
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
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
    const date = document.getElementById('consultation-date').value;
    const time = document.getElementById('consultation-time').value;
    const phone = document.getElementById('consultation-phone').value;
    const message = document.getElementById('consultation-message').value;

    if (!service || !date || !time || !message) {
      alert('Please fill in all required fields');
      return;
    }

    // Create consultation request
    const consultation = DataManager.consultations.create({
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Client',
      email: userData.email || '',
      phone: phone,
      service: service,
      preferredDate: date,
      preferredTime: time,
      message: message,
      status: 'pending'
    });

    closeConsultationModal();
    alert('Consultation booked successfully! We will contact you to confirm the appointment.');
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

  console.log('Waarheid Marketing - Client Dashboard Loaded');
});
