'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { projectService, userService, activityService } from '@/lib/firestore';
import type { Project, ProjectStatus, User } from '@/types';
import { formatDate, formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { FolderKanban, Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminProjectsPage() {
  const { userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    status: 'pending' as ProjectStatus,
    budget: '',
    deadline: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ]);

      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setClients(usersData.filter((u) => u.role === 'client'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    try {
      const projectId = await projectService.create({
        title: formData.title,
        description: formData.description,
        clientId: formData.clientId,
        status: formData.status,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Log activity
      await activityService.create({
        projectId,
        type: 'created',
        message: `Project created by ${userData.name}`,
        userId: userData.id,
        userName: userData.name,
        createdAt: new Date(),
      });

      toast.success('Project created successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        clientId: '',
        status: 'pending',
        budget: '',
        deadline: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ];

  const statusFormOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ];

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-2">Manage all client projects</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Projects Grid */}
          {loading ? (
            <Card>
              <p className="text-gray-500">Loading projects...</p>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No projects found matching your filters'
                    : 'No projects yet'}
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {getClientName(project.clientId)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    {project.budget && (
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="font-medium text-gray-700">
                          {formatDate(project.deadline)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Last updated:</span>
                      <span className="font-medium text-gray-700">
                        {formatRelativeTime(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Create Project Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-6">
                  <Input
                    label="Project Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Website Redesign"
                  />

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Describe the project goals and deliverables..."
                  />

                  <Select
                    label="Client"
                    options={[
                      { value: '', label: 'Select a client' },
                      ...clients.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    required
                  />

                  <Select
                    label="Status"
                    options={statusFormOptions}
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProjectStatus })
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Budget (optional)"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="10000"
                    />

                    <Input
                      label="Deadline (optional)"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      Create Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
