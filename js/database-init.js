/**
 * Waarheid Marketing - Database Initialization
 * Initialize localStorage database with demo data for testing
 * Prepares structure for Firebase migration
 */

(function() {
  'use strict';

  window.DatabaseInit = {
    // Check if database is initialized
    isInitialized: function() {
      return localStorage.getItem('waarheid_db_initialized') === 'true';
    },

    // Initialize database with demo data
    initialize: function(force = false) {
      if (this.isInitialized() && !force) {
        console.log('Database already initialized');
        return false;
      }

      console.log('Initializing Waarheid Marketing Database...');

      // Clear existing data if forcing
      if (force) {
        this.clearDatabase();
      }

      // Initialize demo clients
      this.initializeClients();

      // Initialize demo projects
      this.initializeProjects();

      // Initialize demo consultations
      this.initializeConsultations();

      // Initialize demo messages
      this.initializeMessages();

      // Initialize demo invoices
      this.initializeInvoices();

      // Initialize demo analytics
      this.initializeAnalytics();

      // Initialize demo tickets
      this.initializeTickets();

      // Mark as initialized
      localStorage.setItem('waarheid_db_initialized', 'true');
      localStorage.setItem('waarheid_db_init_date', new Date().toISOString());

      console.log('Database initialized successfully!');
      return true;
    },

    // Clear all database data
    clearDatabase: function() {
      const keys = [
        'waarheid_clients',
        'waarheid_projects',
        'waarheid_consultations',
        'waarheid_messages',
        'waarheid_invoices',
        'waarheid_analytics',
        'waarheid_tickets',
        'waarheid_db_initialized',
        'waarheid_db_init_date'
      ];

      keys.forEach(key => localStorage.removeItem(key));
      console.log('Database cleared');
    },

    // Initialize demo clients
    initializeClients: function() {
      const clients = [
        {
          id: 'client_demo_001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          password: 'password123',
          company: 'Tech Solutions Inc',
          phone: '+31 6 1234 5678',
          createdAt: new Date('2024-01-15').toISOString(),
          status: 'active'
        },
        {
          id: 'client_demo_002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          password: 'password123',
          company: 'Digital Marketing Co',
          phone: '+31 6 2345 6789',
          createdAt: new Date('2024-02-20').toISOString(),
          status: 'active'
        },
        {
          id: 'client_demo_003',
          firstName: 'Mike',
          lastName: 'Brown',
          email: 'mike@example.com',
          password: 'password123',
          company: 'E-commerce Solutions',
          phone: '+31 6 3456 7890',
          createdAt: new Date('2024-03-10').toISOString(),
          status: 'active'
        }
      ];

      localStorage.setItem('waarheid_clients', JSON.stringify(clients));
      console.log(`Initialized ${clients.length} demo clients`);
    },

    // Initialize demo projects
    initializeProjects: function() {
      const projects = [
        {
          id: 'project_001',
          clientId: 'client_demo_001',
          title: 'SEO Optimization Campaign',
          description: 'Comprehensive SEO strategy to improve organic search rankings',
          category: 'marketing',
          status: 'in_progress',
          progress: 65,
          startDate: new Date('2024-01-20').toISOString(),
          endDate: new Date('2024-04-20').toISOString(),
          budget: 15000,
          spent: 9750,
          milestones: [
            { title: 'Keyword Research', date: '2024-01-25', completed: true },
            { title: 'On-Page Optimization', date: '2024-02-15', completed: true },
            { title: 'Link Building Campaign', date: '2024-03-10', completed: false },
            { title: 'Performance Analysis', date: '2024-04-15', completed: false }
          ],
          notes: 'Campaign performing well. Rankings improved by 40% in targeted keywords.',
          createdAt: new Date('2024-01-20').toISOString()
        },
        {
          id: 'project_002',
          clientId: 'client_demo_001',
          title: 'Website Development',
          description: 'Modern responsive website with e-commerce functionality',
          category: 'development',
          status: 'launching',
          progress: 85,
          startDate: new Date('2024-02-01').toISOString(),
          endDate: new Date('2024-05-01').toISOString(),
          budget: 25000,
          spent: 21250,
          milestones: [
            { title: 'Design Mockups', date: '2024-02-10', completed: true },
            { title: 'Frontend Development', date: '2024-03-15', completed: true },
            { title: 'Backend Integration', date: '2024-04-10', completed: true },
            { title: 'Testing & Launch', date: '2024-04-30', completed: false }
          ],
          notes: 'Project ahead of schedule. Client very satisfied with design.',
          createdAt: new Date('2024-02-01').toISOString()
        },
        {
          id: 'project_003',
          clientId: 'client_demo_002',
          title: 'Social Media Marketing',
          description: 'Multi-platform social media campaign to increase brand awareness',
          category: 'marketing',
          status: 'in_progress',
          progress: 45,
          startDate: new Date('2024-02-25').toISOString(),
          endDate: new Date('2024-05-25').toISOString(),
          budget: 10000,
          spent: 4500,
          milestones: [
            { title: 'Content Strategy', date: '2024-03-01', completed: true },
            { title: 'Content Creation', date: '2024-03-20', completed: false },
            { title: 'Campaign Launch', date: '2024-04-01', completed: false },
            { title: 'Performance Review', date: '2024-05-20', completed: false }
          ],
          notes: 'Engagement rates exceeding expectations by 25%.',
          createdAt: new Date('2024-02-25').toISOString()
        },
        {
          id: 'project_004',
          clientId: 'client_demo_003',
          title: 'Marketing Automation',
          description: 'Implement automated marketing workflows and email campaigns',
          category: 'automation',
          status: 'pending',
          progress: 15,
          startDate: new Date('2024-03-15').toISOString(),
          endDate: new Date('2024-06-15').toISOString(),
          budget: 12000,
          spent: 1800,
          milestones: [
            { title: 'Platform Setup', date: '2024-03-20', completed: true },
            { title: 'Workflow Design', date: '2024-04-05', completed: false },
            { title: 'Email Templates', date: '2024-04-25', completed: false },
            { title: 'Launch & Monitor', date: '2024-06-10', completed: false }
          ],
          notes: 'Awaiting client approval on workflow designs.',
          createdAt: new Date('2024-03-15').toISOString()
        }
      ];

      localStorage.setItem('waarheid_projects', JSON.stringify(projects));
      console.log(`Initialized ${projects.length} demo projects`);
    },

    // Initialize demo consultations
    initializeConsultations: function() {
      const consultations = [
        {
          id: 'consult_001',
          name: 'Emma Wilson',
          email: 'emma@startup.com',
          phone: '+31 6 4567 8901',
          company: 'Startup Ventures',
          service: 'Digital Marketing Strategy',
          budget: '10000-25000',
          preferredDate: new Date('2024-11-25').toISOString(),
          preferredTime: '14:00',
          message: 'Looking to establish our digital presence and attract investors.',
          status: 'pending',
          createdAt: new Date('2024-11-18').toISOString()
        },
        {
          id: 'consult_002',
          name: 'David Lee',
          email: 'david@techcorp.nl',
          phone: '+31 6 5678 9012',
          company: 'TechCorp NL',
          service: 'Website Development',
          budget: '25000-50000',
          preferredDate: new Date('2024-11-22').toISOString(),
          preferredTime: '10:00',
          message: 'Need a complete website redesign with modern features.',
          status: 'approved',
          createdAt: new Date('2024-11-15').toISOString()
        },
        {
          id: 'consult_003',
          name: 'Lisa Anderson',
          email: 'lisa@boutique.com',
          phone: '+31 6 6789 0123',
          company: 'Fashion Boutique',
          service: 'E-commerce Solutions',
          budget: '5000-10000',
          preferredDate: new Date('2024-11-20').toISOString(),
          preferredTime: '15:30',
          message: 'Want to expand our retail store to online sales.',
          status: 'completed',
          createdAt: new Date('2024-11-10').toISOString()
        }
      ];

      localStorage.setItem('waarheid_consultations', JSON.stringify(consultations));
      console.log(`Initialized ${consultations.length} demo consultations`);
    },

    // Initialize demo messages
    initializeMessages: function() {
      const messages = [
        {
          id: 'msg_001',
          clientId: 'client_demo_001',
          subject: 'Project Update - SEO Campaign',
          message: 'Hi John, Great news! Your website is now ranking on page 1 for 5 of your target keywords. We\'re seeing a 40% increase in organic traffic. Let\'s schedule a call to discuss the next phase.',
          fromAdmin: true,
          read: false,
          timestamp: new Date('2024-11-17T10:30:00').toISOString()
        },
        {
          id: 'msg_002',
          clientId: 'client_demo_001',
          subject: 'Re: Project Update',
          message: 'That\'s fantastic! I\'m available for a call on Wednesday afternoon. The traffic increase is already showing in our sales.',
          fromAdmin: false,
          read: true,
          timestamp: new Date('2024-11-17T14:15:00').toISOString()
        },
        {
          id: 'msg_003',
          clientId: 'client_demo_001',
          subject: 'Website Launch Preparation',
          message: 'Your new website is ready for final review. Please check the staging environment and let us know if you have any changes before we go live this Friday.',
          fromAdmin: true,
          read: false,
          timestamp: new Date('2024-11-18T09:00:00').toISOString()
        },
        {
          id: 'msg_004',
          clientId: 'client_demo_002',
          subject: 'Social Media Performance Report',
          message: 'Hi Sarah, Your social media campaign is performing exceptionally well! Engagement is up 65% and we\'ve gained 2,500 new followers. Attached is the detailed analytics report.',
          fromAdmin: true,
          read: false,
          timestamp: new Date('2024-11-18T11:20:00').toISOString()
        },
        {
          id: 'msg_005',
          clientId: 'client_demo_003',
          subject: 'Workflow Approval Needed',
          message: 'Hi Mike, We\'ve designed the automated email workflows for your approval. Please review the attached documents and let us know which version you prefer.',
          fromAdmin: true,
          read: false,
          timestamp: new Date('2024-11-18T13:45:00').toISOString()
        }
      ];

      localStorage.setItem('waarheid_messages', JSON.stringify(messages));
      console.log(`Initialized ${messages.length} demo messages`);
    },

    // Initialize demo invoices
    initializeInvoices: function() {
      const invoices = [
        {
          id: 'inv_001',
          clientId: 'client_demo_001',
          invoiceNumber: 'WM-2024-001',
          projectTitle: 'SEO Optimization Campaign',
          amount: 5000,
          status: 'paid',
          issueDate: new Date('2024-01-25').toISOString(),
          dueDate: new Date('2024-02-10').toISOString(),
          paidDate: new Date('2024-02-08').toISOString(),
          createdAt: new Date('2024-01-25').toISOString()
        },
        {
          id: 'inv_002',
          clientId: 'client_demo_001',
          invoiceNumber: 'WM-2024-002',
          projectTitle: 'SEO Optimization Campaign - Phase 2',
          amount: 4750,
          status: 'paid',
          issueDate: new Date('2024-02-28').toISOString(),
          dueDate: new Date('2024-03-15').toISOString(),
          paidDate: new Date('2024-03-12').toISOString(),
          createdAt: new Date('2024-02-28').toISOString()
        },
        {
          id: 'inv_003',
          clientId: 'client_demo_001',
          invoiceNumber: 'WM-2024-007',
          projectTitle: 'Website Development - Milestone 1',
          amount: 10000,
          status: 'paid',
          issueDate: new Date('2024-03-15').toISOString(),
          dueDate: new Date('2024-04-01').toISOString(),
          paidDate: new Date('2024-03-28').toISOString(),
          createdAt: new Date('2024-03-15').toISOString()
        },
        {
          id: 'inv_004',
          clientId: 'client_demo_001',
          invoiceNumber: 'WM-2024-012',
          projectTitle: 'Website Development - Final Payment',
          amount: 11250,
          status: 'pending',
          issueDate: new Date('2024-11-15').toISOString(),
          dueDate: new Date('2024-12-01').toISOString(),
          createdAt: new Date('2024-11-15').toISOString()
        },
        {
          id: 'inv_005',
          clientId: 'client_demo_002',
          invoiceNumber: 'WM-2024-009',
          projectTitle: 'Social Media Marketing - Month 1',
          amount: 3500,
          status: 'paid',
          issueDate: new Date('2024-03-25').toISOString(),
          dueDate: new Date('2024-04-10').toISOString(),
          paidDate: new Date('2024-04-05').toISOString(),
          createdAt: new Date('2024-03-25').toISOString()
        },
        {
          id: 'inv_006',
          clientId: 'client_demo_002',
          invoiceNumber: 'WM-2024-013',
          projectTitle: 'Social Media Marketing - Month 2',
          amount: 3500,
          status: 'pending',
          issueDate: new Date('2024-11-10').toISOString(),
          dueDate: new Date('2024-11-25').toISOString(),
          createdAt: new Date('2024-11-10').toISOString()
        },
        {
          id: 'inv_007',
          clientId: 'client_demo_003',
          invoiceNumber: 'WM-2024-010',
          projectTitle: 'Marketing Automation - Setup Fee',
          amount: 1800,
          status: 'paid',
          issueDate: new Date('2024-03-20').toISOString(),
          dueDate: new Date('2024-04-05').toISOString(),
          paidDate: new Date('2024-04-02').toISOString(),
          createdAt: new Date('2024-03-20').toISOString()
        }
      ];

      localStorage.setItem('waarheid_invoices', JSON.stringify(invoices));
      console.log(`Initialized ${invoices.length} demo invoices`);
    },

    // Initialize demo analytics
    initializeAnalytics: function() {
      const analytics = {
        'client_demo_001': {
          impressions: 145000,
          clicks: 5800,
          ctr: 4.0,
          conversions: 1580,
          revenue: 58400,
          trend: 'up'
        },
        'client_demo_002': {
          impressions: 98000,
          clicks: 3920,
          ctr: 4.0,
          conversions: 980,
          revenue: 35200,
          trend: 'up'
        },
        'client_demo_003': {
          impressions: 52000,
          clicks: 1820,
          ctr: 3.5,
          conversions: 520,
          revenue: 18600,
          trend: 'stable'
        }
      };

      localStorage.setItem('waarheid_analytics', JSON.stringify(analytics));
      console.log(`Initialized analytics for ${Object.keys(analytics).length} clients`);
    },

    // Initialize demo tickets
    initializeTickets: function() {
      const tickets = [
        {
          id: 'ticket_001',
          clientId: 'client_demo_001',
          subject: 'Question about SEO campaign progress',
          category: 'project_inquiry',
          priority: 'normal',
          status: 'resolved',
          messages: [
            {
              id: 'msg_t1_001',
              fromAdmin: false,
              senderName: 'John Smith',
              message: 'Hi! I wanted to check on the progress of our SEO campaign. When can I expect to see the first results?',
              timestamp: new Date('2024-11-10T09:00:00').toISOString(),
              attachments: [],
              read: true
            },
            {
              id: 'msg_t1_002',
              fromAdmin: true,
              senderName: 'Waarheid Support Team',
              message: 'Hello John! Great to hear from you. Your SEO campaign is progressing well! You should start seeing improved rankings within 2-3 weeks. We\'ll send you a detailed report by the end of this week.',
              timestamp: new Date('2024-11-10T10:30:00').toISOString(),
              attachments: [],
              read: true
            },
            {
              id: 'msg_t1_003',
              fromAdmin: false,
              senderName: 'John Smith',
              message: 'Perfect, thank you! Looking forward to the report.',
              timestamp: new Date('2024-11-10T11:00:00').toISOString(),
              attachments: [],
              read: true
            }
          ],
          createdAt: new Date('2024-11-10T09:00:00').toISOString(),
          updatedAt: new Date('2024-11-10T11:00:00').toISOString(),
          assignedTo: 'Admin Team',
          tags: ['seo', 'project']
        },
        {
          id: 'ticket_002',
          clientId: 'client_demo_001',
          subject: 'Website launch date confirmation',
          category: 'billing',
          priority: 'high',
          status: 'in_progress',
          messages: [
            {
              id: 'msg_t2_001',
              fromAdmin: false,
              senderName: 'John Smith',
              message: 'Can you confirm the exact launch date for our new website? We need to coordinate with our marketing team.',
              timestamp: new Date('2024-11-17T14:00:00').toISOString(),
              attachments: [],
              read: true
            },
            {
              id: 'msg_t2_002',
              fromAdmin: true,
              senderName: 'Waarheid Support Team',
              message: 'Hi John, we\'re targeting November 29th for the official launch. Final testing is scheduled for November 25-27. I\'ll send you the detailed launch timeline by tomorrow.',
              timestamp: new Date('2024-11-17T16:30:00').toISOString(),
              attachments: [],
              read: false
            }
          ],
          createdAt: new Date('2024-11-17T14:00:00').toISOString(),
          updatedAt: new Date('2024-11-17T16:30:00').toISOString(),
          assignedTo: 'Admin Team',
          tags: ['website', 'launch']
        },
        {
          id: 'ticket_003',
          clientId: 'client_demo_002',
          subject: 'Request for additional social media platforms',
          category: 'feature_request',
          priority: 'normal',
          status: 'open',
          messages: [
            {
              id: 'msg_t3_001',
              fromAdmin: false,
              senderName: 'Sarah Johnson',
              message: 'Hello! We\'d like to expand our social media campaign to include TikTok and LinkedIn. Can you provide a quote for adding these platforms?',
              timestamp: new Date('2024-11-18T10:00:00').toISOString(),
              attachments: [],
              read: false
            }
          ],
          createdAt: new Date('2024-11-18T10:00:00').toISOString(),
          updatedAt: new Date('2024-11-18T10:00:00').toISOString(),
          assignedTo: null,
          tags: ['social-media', 'expansion']
        },
        {
          id: 'ticket_004',
          clientId: 'client_demo_003',
          subject: 'Technical support - Email automation not working',
          category: 'technical_support',
          priority: 'high',
          status: 'open',
          messages: [
            {
              id: 'msg_t4_001',
              fromAdmin: false,
              senderName: 'Mike Brown',
              message: 'Hi, I\'m having issues with the automated email workflows. The welcome email doesn\'t seem to be triggering when new customers sign up. Can you help?',
              timestamp: new Date('2024-11-18T13:00:00').toISOString(),
              attachments: [],
              read: false
            }
          ],
          createdAt: new Date('2024-11-18T13:00:00').toISOString(),
          updatedAt: new Date('2024-11-18T13:00:00').toISOString(),
          assignedTo: null,
          tags: ['automation', 'urgent']
        }
      ];

      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      console.log(`Initialized ${tickets.length} demo tickets`);
    },

    // Reset database (for testing)
    reset: function() {
      const confirmed = confirm('Are you sure you want to reset the database? This will delete all data and reinitialize with demo data.');
      if (confirmed) {
        this.initialize(true);
        alert('Database has been reset successfully!');
        window.location.reload();
      }
    },

    // Export database (for backup/migration)
    export: function() {
      const data = {
        clients: JSON.parse(localStorage.getItem('waarheid_clients') || '[]'),
        projects: JSON.parse(localStorage.getItem('waarheid_projects') || '[]'),
        consultations: JSON.parse(localStorage.getItem('waarheid_consultations') || '[]'),
        messages: JSON.parse(localStorage.getItem('waarheid_messages') || '[]'),
        invoices: JSON.parse(localStorage.getItem('waarheid_invoices') || '[]'),
        analytics: JSON.parse(localStorage.getItem('waarheid_analytics') || '{}'),
        tickets: JSON.parse(localStorage.getItem('waarheid_tickets') || '[]'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waarheid-database-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    // Get database info
    getInfo: function() {
      if (!this.isInitialized()) {
        return 'Database not initialized';
      }

      const clients = JSON.parse(localStorage.getItem('waarheid_clients') || '[]');
      const projects = JSON.parse(localStorage.getItem('waarheid_projects') || '[]');
      const consultations = JSON.parse(localStorage.getItem('waarheid_consultations') || '[]');
      const messages = JSON.parse(localStorage.getItem('waarheid_messages') || '[]');
      const invoices = JSON.parse(localStorage.getItem('waarheid_invoices') || '[]');
      const tickets = JSON.parse(localStorage.getItem('waarheid_tickets') || '[]');

      return {
        initialized: true,
        initDate: localStorage.getItem('waarheid_db_init_date'),
        counts: {
          clients: clients.length,
          projects: projects.length,
          consultations: consultations.length,
          messages: messages.length,
          invoices: invoices.length,
          tickets: tickets.length
        }
      };
    }
  };

  // Auto-initialize on first load if not initialized
  if (!window.DatabaseInit.isInitialized()) {
    console.log('Database not found. Auto-initializing...');
    window.DatabaseInit.initialize();
  } else {
    console.log('Database Info:', window.DatabaseInit.getInfo());
  }

})();
