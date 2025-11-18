/**
 * Waarheid Marketing - Data Management System
 * Handles all data operations using localStorage for demo purposes
 * In production, this would be replaced with proper API calls
 */

window.DataManager = (function() {
  'use strict';

  // ============================================
  // Initialization
  // ============================================
  function initializeData() {
    // Initialize all data stores if they don't exist

    if (!localStorage.getItem('waarheid_clients')) {
      localStorage.setItem('waarheid_clients', JSON.stringify([]));
    }

    if (!localStorage.getItem('waarheid_projects')) {
      // Initialize with demo projects
      const demoProjects = [
        {
          id: 'proj_001',
          clientId: null, // Unassigned demo project
          title: 'Social Media Campaign Q1',
          description: 'Instagram & Facebook advertising campaign with engagement optimization and conversion tracking.',
          category: 'marketing',
          status: 'in_progress',
          progress: 68,
          startDate: '2025-02-01',
          endDate: '2025-03-31',
          budget: 5000,
          spent: 3400,
          milestones: [
            { id: 'm1', title: 'Campaign Strategy & Planning', date: '2025-02-01', completed: true },
            { id: 'm2', title: 'Creative Asset Development', date: '2025-02-05', completed: true },
            { id: 'm3', title: 'Campaign Launch', date: '2025-02-10', completed: true },
            { id: 'm4', title: 'Mid-Campaign Optimization', date: '2025-02-20', completed: true },
            { id: 'm5', title: 'Performance Analysis', date: '2025-03-15', completed: false },
            { id: 'm6', title: 'Final Report & Recommendations', date: '2025-03-31', completed: false }
          ],
          visuals: [
            { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', title: 'Ad Creative 1' },
            { url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop', title: 'Ad Creative 2' }
          ],
          notes: 'Campaign is performing above expectations with a 3.8% CTR.',
          createdAt: new Date('2025-02-01').toISOString()
        },
        {
          id: 'proj_002',
          clientId: null,
          title: 'E-commerce Website Redesign',
          description: 'Complete website overhaul with modern UI/UX design, mobile optimization, and SEO improvements.',
          category: 'development',
          status: 'launching',
          progress: 92,
          startDate: '2025-01-15',
          endDate: '2025-02-28',
          budget: 12000,
          spent: 11040,
          milestones: [
            { id: 'm1', title: 'Discovery & Research', date: '2025-01-15', completed: true },
            { id: 'm2', title: 'Wireframing & Prototyping', date: '2025-01-20', completed: true },
            { id: 'm3', title: 'UI Design', date: '2025-01-28', completed: true },
            { id: 'm4', title: 'Development', date: '2025-02-05', completed: true },
            { id: 'm5', title: 'Testing & QA', date: '2025-02-20', completed: true },
            { id: 'm6', title: 'Launch & Monitoring', date: '2025-02-28', completed: false }
          ],
          visuals: [
            { url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop', title: 'Homepage Design' }
          ],
          notes: 'Website redesign is complete and ready for launch.',
          createdAt: new Date('2025-01-15').toISOString()
        }
      ];
      localStorage.setItem('waarheid_projects', JSON.stringify(demoProjects));
    }

    if (!localStorage.getItem('waarheid_consultations')) {
      localStorage.setItem('waarheid_consultations', JSON.stringify([]));
    }

    if (!localStorage.getItem('waarheid_messages')) {
      localStorage.setItem('waarheid_messages', JSON.stringify([]));
    }

    if (!localStorage.getItem('waarheid_invoices')) {
      localStorage.setItem('waarheid_invoices', JSON.stringify([]));
    }

    if (!localStorage.getItem('waarheid_analytics')) {
      localStorage.setItem('waarheid_analytics', JSON.stringify({}));
    }
  }

  // ============================================
  // Client Management
  // ============================================
  const ClientManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_clients') || '[]');
    },

    getById: function(clientId) {
      const clients = this.getAll();
      return clients.find(c => c.id === clientId);
    },

    getByEmail: function(email) {
      const clients = this.getAll();
      return clients.find(c => c.email === email);
    },

    create: function(clientData) {
      const clients = this.getAll();
      const newClient = {
        id: 'client_' + Date.now(),
        ...clientData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      clients.push(newClient);
      localStorage.setItem('waarheid_clients', JSON.stringify(clients));
      return newClient;
    },

    update: function(clientId, updates) {
      const clients = this.getAll();
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('waarheid_clients', JSON.stringify(clients));
        return clients[index];
      }
      return null;
    },

    delete: function(clientId) {
      const clients = this.getAll();
      const filtered = clients.filter(c => c.id !== clientId);
      localStorage.setItem('waarheid_clients', JSON.stringify(filtered));
      return true;
    },

    getProjects: function(clientId) {
      return ProjectManager.getByClient(clientId);
    }
  };

  // ============================================
  // Project Management
  // ============================================
  const ProjectManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_projects') || '[]');
    },

    getById: function(projectId) {
      const projects = this.getAll();
      return projects.find(p => p.id === projectId);
    },

    getByClient: function(clientId) {
      const projects = this.getAll();
      return projects.filter(p => p.clientId === clientId);
    },

    getByStatus: function(status) {
      const projects = this.getAll();
      return projects.filter(p => p.status === status);
    },

    create: function(projectData) {
      const projects = this.getAll();
      const newProject = {
        id: 'proj_' + Date.now(),
        clientId: null,
        status: 'pending',
        progress: 0,
        milestones: [],
        visuals: [],
        notes: '',
        ...projectData,
        createdAt: new Date().toISOString()
      };
      projects.push(newProject);
      localStorage.setItem('waarheid_projects', JSON.stringify(projects));
      return newProject;
    },

    update: function(projectId, updates) {
      const projects = this.getAll();
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('waarheid_projects', JSON.stringify(projects));
        return projects[index];
      }
      return null;
    },

    delete: function(projectId) {
      const projects = this.getAll();
      const filtered = projects.filter(p => p.id !== projectId);
      localStorage.setItem('waarheid_projects', JSON.stringify(filtered));
      return true;
    },

    updateProgress: function(projectId, progress) {
      return this.update(projectId, { progress });
    },

    addMilestone: function(projectId, milestone) {
      const project = this.getById(projectId);
      if (project) {
        const newMilestone = {
          id: 'm_' + Date.now(),
          completed: false,
          ...milestone
        };
        project.milestones.push(newMilestone);
        return this.update(projectId, { milestones: project.milestones });
      }
      return null;
    },

    updateMilestone: function(projectId, milestoneId, updates) {
      const project = this.getById(projectId);
      if (project) {
        const index = project.milestones.findIndex(m => m.id === milestoneId);
        if (index !== -1) {
          project.milestones[index] = { ...project.milestones[index], ...updates };
          return this.update(projectId, { milestones: project.milestones });
        }
      }
      return null;
    }
  };

  // ============================================
  // Consultation Request Management
  // ============================================
  const ConsultationManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_consultations') || '[]');
    },

    getById: function(consultationId) {
      const consultations = this.getAll();
      return consultations.find(c => c.id === consultationId);
    },

    getByStatus: function(status) {
      const consultations = this.getAll();
      return consultations.filter(c => c.status === status);
    },

    create: function(consultationData) {
      const consultations = this.getAll();
      const newConsultation = {
        id: 'consult_' + Date.now(),
        status: 'pending', // pending, approved, rejected, converted
        ...consultationData,
        createdAt: new Date().toISOString()
      };
      consultations.push(newConsultation);
      localStorage.setItem('waarheid_consultations', JSON.stringify(consultations));
      return newConsultation;
    },

    update: function(consultationId, updates) {
      const consultations = this.getAll();
      const index = consultations.findIndex(c => c.id === consultationId);
      if (index !== -1) {
        consultations[index] = { ...consultations[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('waarheid_consultations', JSON.stringify(consultations));
        return consultations[index];
      }
      return null;
    },

    approve: function(consultationId) {
      return this.update(consultationId, { status: 'approved' });
    },

    reject: function(consultationId, reason) {
      return this.update(consultationId, { status: 'rejected', rejectionReason: reason });
    },

    convertToProject: function(consultationId, projectData) {
      const consultation = this.getById(consultationId);
      if (consultation) {
        const project = ProjectManager.create({
          ...projectData,
          consultationId: consultationId
        });
        this.update(consultationId, { status: 'converted', projectId: project.id });
        return project;
      }
      return null;
    }
  };

  // ============================================
  // Message Management
  // ============================================
  const MessageManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_messages') || '[]');
    },

    getById: function(messageId) {
      const messages = this.getAll();
      return messages.find(m => m.id === messageId);
    },

    getByClient: function(clientId) {
      const messages = this.getAll();
      return messages.filter(m => m.clientId === clientId).sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    },

    getByProject: function(projectId) {
      const messages = this.getAll();
      return messages.filter(m => m.projectId === projectId).sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    },

    getUnread: function(isAdmin = false) {
      const messages = this.getAll();
      return messages.filter(m => !m.read && (isAdmin ? !m.isFromAdmin : m.isFromAdmin));
    },

    create: function(messageData) {
      const messages = this.getAll();
      const newMessage = {
        id: 'msg_' + Date.now(),
        read: false,
        ...messageData,
        createdAt: new Date().toISOString()
      };
      messages.push(newMessage);
      localStorage.setItem('waarheid_messages', JSON.stringify(messages));
      return newMessage;
    },

    markAsRead: function(messageId) {
      const messages = this.getAll();
      const index = messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        messages[index].read = true;
        localStorage.setItem('waarheid_messages', JSON.stringify(messages));
        return messages[index];
      }
      return null;
    },

    markAllAsRead: function(clientId, isAdmin = false) {
      const messages = this.getAll();
      messages.forEach(m => {
        if (m.clientId === clientId && (isAdmin ? !m.isFromAdmin : m.isFromAdmin)) {
          m.read = true;
        }
      });
      localStorage.setItem('waarheid_messages', JSON.stringify(messages));
    }
  };

  // ============================================
  // Invoice Management
  // ============================================
  const InvoiceManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_invoices') || '[]');
    },

    getById: function(invoiceId) {
      const invoices = this.getAll();
      return invoices.find(i => i.id === invoiceId);
    },

    getByClient: function(clientId) {
      const invoices = this.getAll();
      return invoices.filter(i => i.clientId === clientId);
    },

    getByProject: function(projectId) {
      const invoices = this.getAll();
      return invoices.filter(i => i.projectId === projectId);
    },

    getByStatus: function(status) {
      const invoices = this.getAll();
      return invoices.filter(i => i.status === status);
    },

    create: function(invoiceData) {
      const invoices = this.getAll();
      const invoiceNumber = 'INV-' + (invoices.length + 1).toString().padStart(4, '0');
      const newInvoice = {
        id: 'inv_' + Date.now(),
        invoiceNumber,
        status: 'pending', // pending, paid, overdue, cancelled
        ...invoiceData,
        createdAt: new Date().toISOString()
      };
      invoices.push(newInvoice);
      localStorage.setItem('waarheid_invoices', JSON.stringify(invoices));
      return newInvoice;
    },

    update: function(invoiceId, updates) {
      const invoices = this.getAll();
      const index = invoices.findIndex(i => i.id === invoiceId);
      if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('waarheid_invoices', JSON.stringify(invoices));
        return invoices[index];
      }
      return null;
    },

    markAsPaid: function(invoiceId, paymentDate) {
      return this.update(invoiceId, {
        status: 'paid',
        paidDate: paymentDate || new Date().toISOString()
      });
    }
  };

  // ============================================
  // Analytics Management
  // ============================================
  const AnalyticsManager = {
    get: function() {
      return JSON.parse(localStorage.getItem('waarheid_analytics') || '{}');
    },

    update: function(analyticsData) {
      const current = this.get();
      const updated = { ...current, ...analyticsData, updatedAt: new Date().toISOString() };
      localStorage.setItem('waarheid_analytics', JSON.stringify(updated));
      return updated;
    },

    addDataPoint: function(metric, value, date) {
      const analytics = this.get();
      if (!analytics[metric]) {
        analytics[metric] = [];
      }
      analytics[metric].push({
        value,
        date: date || new Date().toISOString()
      });
      localStorage.setItem('waarheid_analytics', JSON.stringify(analytics));
      return analytics;
    },

    getMetric: function(metric) {
      const analytics = this.get();
      return analytics[metric] || [];
    }
  };

  // ============================================
  // Ticket Management (Support/Chat System)
  // ============================================
  const TicketManager = {
    getAll: function() {
      return JSON.parse(localStorage.getItem('waarheid_tickets') || '[]');
    },

    getById: function(ticketId) {
      const tickets = this.getAll();
      return tickets.find(t => t.id === ticketId);
    },

    getByClient: function(clientId) {
      const tickets = this.getAll();
      return tickets.filter(t => t.clientId === clientId);
    },

    getByStatus: function(status) {
      const tickets = this.getAll();
      return tickets.filter(t => t.status === status);
    },

    create: function(ticketData) {
      const tickets = this.getAll();
      const newTicket = {
        id: DataManager.generateId('ticket'),
        clientId: ticketData.clientId,
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority || 'normal',
        status: 'open', // open, in_progress, resolved, closed
        messages: ticketData.initialMessage ? [{
          id: DataManager.generateId('msg'),
          fromAdmin: false,
          message: ticketData.initialMessage,
          timestamp: new Date().toISOString(),
          attachments: ticketData.attachments || []
        }] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: null,
        tags: ticketData.tags || []
      };
      tickets.push(newTicket);
      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return newTicket;
    },

    addMessage: function(ticketId, messageData) {
      const tickets = this.getAll();
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return null;

      const newMessage = {
        id: DataManager.generateId('msg'),
        fromAdmin: messageData.fromAdmin || false,
        senderName: messageData.senderName,
        message: messageData.message,
        timestamp: new Date().toISOString(),
        attachments: messageData.attachments || [],
        read: false
      };

      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date().toISOString();

      // Update status to in_progress if admin replies
      if (messageData.fromAdmin && ticket.status === 'open') {
        ticket.status = 'in_progress';
      }

      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return newMessage;
    },

    updateStatus: function(ticketId, status) {
      const tickets = this.getAll();
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return null;

      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return ticket;
    },

    updatePriority: function(ticketId, priority) {
      const tickets = this.getAll();
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return null;

      ticket.priority = priority;
      ticket.updatedAt = new Date().toISOString();
      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return ticket;
    },

    assignTo: function(ticketId, adminName) {
      const tickets = this.getAll();
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return null;

      ticket.assignedTo = adminName;
      ticket.updatedAt = new Date().toISOString();
      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return ticket;
    },

    markMessagesAsRead: function(ticketId, isAdmin) {
      const tickets = this.getAll();
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return null;

      ticket.messages.forEach(msg => {
        // Mark messages as read based on who is viewing
        if ((isAdmin && !msg.fromAdmin) || (!isAdmin && msg.fromAdmin)) {
          msg.read = true;
        }
      });

      localStorage.setItem('waarheid_tickets', JSON.stringify(tickets));
      return ticket;
    },

    getUnreadCount: function(clientId, isAdmin = false) {
      const tickets = isAdmin ? this.getAll() : this.getByClient(clientId);
      let unreadCount = 0;

      tickets.forEach(ticket => {
        ticket.messages.forEach(msg => {
          if ((isAdmin && !msg.fromAdmin && !msg.read) || (!isAdmin && msg.fromAdmin && !msg.read)) {
            unreadCount++;
          }
        });
      });

      return unreadCount;
    },

    delete: function(ticketId) {
      const tickets = this.getAll();
      const filtered = tickets.filter(t => t.id !== ticketId);
      localStorage.setItem('waarheid_tickets', JSON.stringify(filtered));
      return true;
    }
  };

  // Initialize data on load
  initializeData();

  // Public API
  return {
    clients: ClientManager,
    projects: ProjectManager,
    consultations: ConsultationManager,
    messages: MessageManager,
    invoices: InvoiceManager,
    analytics: AnalyticsManager,
    tickets: TicketManager,

    // Utility functions
    generateId: function(prefix) {
      return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    clearAll: function() {
      localStorage.removeItem('waarheid_clients');
      localStorage.removeItem('waarheid_projects');
      localStorage.removeItem('waarheid_consultations');
      localStorage.removeItem('waarheid_messages');
      localStorage.removeItem('waarheid_invoices');
      localStorage.removeItem('waarheid_analytics');
      initializeData();
    }
  };
})();

// Initialize data manager on script load
console.log('Waarheid Marketing - Data Manager Loaded');
