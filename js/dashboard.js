/**
 * Waarheid Marketing - Dashboard JavaScript
 * Handles dashboard interactivity, charts, and project details
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Authentication Check
  // ============================================
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    // Redirect to signin if not authenticated
    window.location.href = 'signin.html';
    return;
  }

  // Load user data
  loadUserData();

  // ============================================
  // Load User Data
  // ============================================
  function loadUserData() {
    const userEmail = localStorage.getItem('userEmail');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    // Update user name displays
    const firstName = userData.firstName || userEmail?.split('@')[0] || 'User';

    document.querySelectorAll('.user-name-display').forEach(el => {
      el.textContent = firstName;
    });

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = userData.firstName && userData.lastName
        ? `${userData.firstName} ${userData.lastName}`
        : userEmail || 'User';
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

    // Close on outside click
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
      window.location.href = 'signin.html';
    });
  }

  // ============================================
  // Package Filtering
  // ============================================
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

  // ============================================
  // Date Range Selector
  // ============================================
  const dateButtons = document.querySelectorAll('.date-btn');

  dateButtons.forEach(button => {
    button.addEventListener('click', function() {
      dateButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // In production, this would update charts with new data
      console.log('Date range changed:', this.textContent);
    });
  });

  // ============================================
  // Initialize Charts
  // ============================================

  // Check if Chart.js is loaded
  if (typeof Chart !== 'undefined') {
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
          labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
          datasets: [
            {
              label: 'Impressions',
              data: [12000, 15000, 18000, 16000, 22000, 25000, 28000],
              borderColor: '#c50077',
              backgroundColor: 'rgba(197, 0, 119, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Clicks',
              data: [450, 580, 690, 620, 850, 980, 1100],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(26, 26, 36, 0.95)',
              borderColor: 'rgba(197, 0, 119, 0.5)',
              borderWidth: 1,
              padding: 12,
              titleColor: '#fff',
              bodyColor: 'rgba(255, 255, 255, 0.8)',
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
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
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
          labels: ['Organic', 'Paid Ads', 'Social Media', 'Direct', 'Referral', 'Email'],
          datasets: [{
            label: 'Visitors',
            data: [3500, 2800, 2100, 1800, 1200, 900],
            backgroundColor: [
              'rgba(197, 0, 119, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
              '#c50077',
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#ec4899'
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
              titleColor: '#fff',
              bodyColor: 'rgba(255, 255, 255, 0.8)',
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return context.parsed.y.toLocaleString() + ' visitors';
                }
              }
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
  // Project Detail Modal
  // ============================================

  // Demo project data
  const projectsData = {
    1: {
      title: 'Social Media Campaign Q1',
      status: 'In Progress',
      statusClass: 'in-progress',
      description: 'Instagram & Facebook advertising campaign with engagement optimization and conversion tracking.',
      startDate: 'February 1, 2025',
      endDate: 'March 31, 2025',
      progress: 68,
      budget: '$5,000',
      spent: '$3,400',
      milestones: [
        { title: 'Campaign Strategy & Planning', date: 'Feb 1, 2025', completed: true },
        { title: 'Creative Asset Development', date: 'Feb 5, 2025', completed: true },
        { title: 'Campaign Launch', date: 'Feb 10, 2025', completed: true },
        { title: 'Mid-Campaign Optimization', date: 'Feb 20, 2025', completed: true },
        { title: 'Performance Analysis', date: 'Mar 15, 2025', completed: false },
        { title: 'Final Report & Recommendations', date: 'Mar 31, 2025', completed: false }
      ],
      visuals: [
        { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', title: 'Ad Creative 1' },
        { url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop', title: 'Ad Creative 2' },
        { url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c5e3?w=400&h=300&fit=crop', title: 'Performance Dashboard' }
      ],
      notes: 'Campaign is performing above expectations with a 3.8% CTR. Currently testing new ad variations to improve conversion rate.'
    },
    2: {
      title: 'E-commerce Website Redesign',
      status: 'Launching',
      statusClass: 'launching',
      description: 'Complete website overhaul with modern UI/UX design, mobile optimization, and SEO improvements.',
      startDate: 'January 15, 2025',
      endDate: 'February 28, 2025',
      progress: 92,
      budget: '$12,000',
      spent: '$11,040',
      milestones: [
        { title: 'Discovery & Research', date: 'Jan 15, 2025', completed: true },
        { title: 'Wireframing & Prototyping', date: 'Jan 20, 2025', completed: true },
        { title: 'UI Design', date: 'Jan 28, 2025', completed: true },
        { title: 'Development', date: 'Feb 5, 2025', completed: true },
        { title: 'Testing & QA', date: 'Feb 20, 2025', completed: true },
        { title: 'Launch & Monitoring', date: 'Feb 28, 2025', completed: false }
      ],
      visuals: [
        { url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop', title: 'Homepage Design' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', title: 'Product Page' },
        { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop', title: 'Mobile View' },
        { url: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&h=300&fit=crop', title: 'Checkout Flow' }
      ],
      notes: 'Website redesign is complete and ready for launch. All testing phases passed successfully. Preparing for go-live on Feb 28.'
    },
    3: {
      title: 'SEO Optimization Campaign',
      status: 'Optimizing',
      statusClass: 'optimizing',
      description: 'Comprehensive SEO strategy including technical SEO, content optimization, and link building.',
      startDate: 'December 1, 2024',
      endDate: 'March 31, 2025',
      progress: 45,
      budget: '$8,000',
      spent: '$3,600',
      milestones: [
        { title: 'SEO Audit', date: 'Dec 1, 2024', completed: true },
        { title: 'Technical SEO Fixes', date: 'Dec 15, 2024', completed: true },
        { title: 'Keyword Research', date: 'Jan 1, 2025', completed: true },
        { title: 'Content Optimization', date: 'Jan 20, 2025', completed: false },
        { title: 'Link Building Campaign', date: 'Feb 15, 2025', completed: false },
        { title: 'Performance Review', date: 'Mar 31, 2025', completed: false }
      ],
      visuals: [
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', title: 'SEO Analytics' },
        { url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=300&fit=crop', title: 'Keyword Rankings' }
      ],
      notes: 'Organic traffic has increased by 35% since campaign start. Currently focusing on content optimization and building high-quality backlinks.'
    },
    4: {
      title: 'Business Intelligence Dashboard',
      status: 'In Progress',
      statusClass: 'in-progress',
      description: 'Custom analytics dashboard with real-time KPI tracking, data visualization, and automated reporting.',
      startDate: 'January 20, 2025',
      endDate: 'March 15, 2025',
      progress: 55,
      budget: '$15,000',
      spent: '$8,250',
      milestones: [
        { title: 'Requirements Gathering', date: 'Jan 20, 2025', completed: true },
        { title: 'Data Integration Setup', date: 'Jan 28, 2025', completed: true },
        { title: 'Dashboard Design', date: 'Feb 5, 2025', completed: true },
        { title: 'Development & Testing', date: 'Feb 25, 2025', completed: false },
        { title: 'Training & Documentation', date: 'Mar 10, 2025', completed: false },
        { title: 'Deployment', date: 'Mar 15, 2025', completed: false }
      ],
      visuals: [
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', title: 'Dashboard Overview' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', title: 'KPI Metrics' },
        { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop', title: 'Data Visualization' }
      ],
      notes: 'Dashboard framework is in place with key integrations completed. Currently building out custom visualizations and automated reporting features.'
    }
  };

  // Open project detail modal
  window.openProjectDetail = function(projectId) {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('project-detail-content');
    const project = projectsData[projectId];

    if (!project) return;

    // Build modal HTML
    const modalHTML = `
      <div class="project-detail-header">
        <div class="project-status-tag ${project.statusClass}">${project.status}</div>
        <h2>${project.title}</h2>
        <p style="color: var(--dashboard-text-muted); margin-top: 0.5rem;">${project.description}</p>

        <div class="project-meta-grid">
          <div class="project-meta-item">
            <span class="project-meta-label">Start Date</span>
            <span class="project-meta-value">${project.startDate}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">End Date</span>
            <span class="project-meta-value">${project.endDate}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">Budget</span>
            <span class="project-meta-value">${project.budget}</span>
          </div>
          <div class="project-meta-item">
            <span class="project-meta-label">Spent</span>
            <span class="project-meta-value">${project.spent}</span>
          </div>
        </div>
      </div>

      <div class="project-progress-section">
        <h3>Overall Progress</h3>
        <div class="package-progress" style="margin-top: 1rem;">
          <div class="progress-bar" style="height: 12px;">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
          </div>
        </div>
        <p style="text-align: center; margin-top: 0.5rem; color: var(--dashboard-text-muted); font-size: 0.9rem;">${project.progress}% Complete</p>
      </div>

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
    `;

    modalContent.innerHTML = modalHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Close project detail modal
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
  // Sidebar Navigation Highlighting
  // ============================================
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // For demo purposes, prevent navigation and just highlight
      if (this.getAttribute('href') === '#') {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // ============================================
  // Notifications (Demo)
  // ============================================
  const notificationsBtn = document.querySelector('.notifications-btn');

  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      alert('Notifications feature - Coming soon!\n\nYou have 3 new notifications:\n- Project update on Social Media Campaign\n- New message from Waarheid Marketing\n- Invoice ready for review');
    });
  }

  console.log('Waarheid Marketing - Dashboard Loaded Successfully');
});
