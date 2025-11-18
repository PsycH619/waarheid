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
            <span class="project-meta-value">$${(project.budget || 0).toLocaleString()}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">Spent</span>
            <span class="project-meta-value">$${(project.spent || 0).toLocaleString()}</span>
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
        <button class="btn-view-details" onclick="openMessaging()" style="margin-top: 1rem;">
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
  // Messages Notification
  // ============================================
  function updateMessagesNotification() {
    if (!clientId) return;

    const unreadMessages = DataManager.messages.getUnread(false).filter(m => m.clientId === clientId);
    const notificationBadge = document.querySelector('.notification-badge');
    const navBadge = document.querySelector('#messages-badge');

    if (notificationBadge && unreadMessages.length > 0) {
      notificationBadge.textContent = unreadMessages.length;
      notificationBadge.style.display = 'block';
    } else if (notificationBadge) {
      notificationBadge.style.display = 'none';
    }

    // Update nav badge if exists
    const messagesLink = document.querySelector('[data-section="messages"]');
    if (messagesLink && unreadMessages.length > 0) {
      let badge = messagesLink.querySelector('.nav-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        messagesLink.appendChild(badge);
      }
      badge.textContent = unreadMessages.length;
    }
  }

  // Open messaging (placeholder - could open a messaging modal)
  window.openMessaging = function() {
    alert('Messaging feature: This would open a chat interface to communicate with the Waarheid Marketing team. For demo purposes, please contact us directly.');
    window.closeProjectDetail();
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
          <span class="kpi-value">$42.8K</span>
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
  // Messages Section
  // ============================================
  function loadMessagesSection() {
    const messagesList = document.getElementById('messages-list');

    if (!clientId) {
      messagesList.innerHTML = '<p style="text-align: center; color: var(--dashboard-text-muted); padding: 3rem;">No client data available</p>';
      return;
    }

    const messages = DataManager.messages.getAll().filter(m => m.clientId === clientId);

    if (messages.length === 0) {
      messagesList.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-comments" style="font-size: 4rem; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dashboard-text); margin-bottom: 0.5rem;">No Messages Yet</h3>
          <p style="color: var(--dashboard-text-muted);">Start a conversation with the Waarheid Marketing team.</p>
          <button class="btn-primary" onclick="openNewMessage()" style="margin-top: 2rem;">
            <i class="fas fa-plus"></i> New Message
          </button>
        </div>
      `;
      return;
    }

    // Sort messages by date (newest first)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    messagesList.innerHTML = messages.map(message => {
      const date = new Date(message.timestamp);
      const isFromAdmin = message.fromAdmin;

      return `
        <div class="message-card ${message.read ? 'read' : 'unread'}">
          <div class="message-header">
            <div class="message-sender">
              <i class="fas ${isFromAdmin ? 'fa-user-tie' : 'fa-user'}"></i>
              <span>${isFromAdmin ? 'Waarheid Marketing Team' : 'You'}</span>
            </div>
            <div class="message-date">${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
          </div>
          <div class="message-subject">${message.subject || 'No Subject'}</div>
          <div class="message-content">${message.message}</div>
          ${!message.read && !isFromAdmin ? '<div class="message-unread-badge">New</div>' : ''}
        </div>
      `;
    }).join('');

    // Mark messages as read
    messages.forEach(msg => {
      if (!msg.read && msg.fromAdmin) {
        DataManager.messages.markAsRead(msg.id);
      }
    });

    // Update notification count
    updateMessagesNotification();
  }

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
          <a href="booking.html" class="btn-primary" style="margin-top: 2rem; display: inline-block;">
            <i class="fas fa-calendar-plus"></i> Book Consultation
          </a>
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
              <span class="invoice-value invoice-amount">$${(invoice.amount || 0).toLocaleString()}</span>
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
    if (invoice) {
      alert(`Invoice #${invoice.invoiceNumber}\nAmount: $${invoice.amount.toLocaleString()}\nStatus: ${invoice.status}`);
    }
  };

  window.downloadInvoice = function(invoiceId) {
    alert('Download feature: This would download the invoice as a PDF. Demo mode only.');
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
