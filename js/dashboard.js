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

  console.log('Waarheid Marketing - Client Dashboard Loaded');
});
