'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { userService, projectService } from '@/lib/firestore';
import { updateUserRole } from '@/lib/auth';
import type { User } from '@/types';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { Users, Search, Mail, Phone, Building2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [filteredClients, setFilteredClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      const allUsers = await userService.getAll();
      const clientUsers = allUsers.filter((u) => u.role === 'client');
      setClients(clientUsers);
      setFilteredClients(clientUsers);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClients(filtered);
  };

  const viewClientDetails = async (client: User) => {
    setSelectedClient(client);
    try {
      const projects = await projectService.getByClient(client.id);
      setClientProjects(projects);
    } catch (error) {
      console.error('Error loading client projects:', error);
    }
  };

  const makeAdmin = async (clientId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;

    try {
      await updateUserRole(clientId, 'admin');
      toast.success('User role updated to admin');
      loadClients();
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-2">Manage and view all client accounts</p>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </Card>

            <Card className="flex items-center">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-primary-100 text-primary-600 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Clients Grid */}
          {loading ? (
            <Card>
              <p className="text-gray-500">Loading clients...</p>
            </Card>
          ) : filteredClients.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => viewClientDetails(client)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                      {client.company && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building2 className="h-4 w-4 mr-1" />
                          {client.company}
                        </div>
                      )}
                    </div>
                    <Badge variant="info">Client</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {client.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Joined {formatRelativeTime(client.createdAt)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Client Detail Modal */}
          {selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                    {selectedClient.company && (
                      <p className="text-gray-600">{selectedClient.company}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">{selectedClient.email}</span>
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700">{selectedClient.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">
                          Member since {formatDate(selectedClient.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Projects ({clientProjects.length})
                    </h3>
                    {clientProjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No projects yet</p>
                    ) : (
                      <div className="space-y-2">
                        {clientProjects.map((project) => (
                          <div
                            key={project.id}
                            className="p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{project.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {formatRelativeTime(project.updatedAt)}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  project.status === 'completed'
                                    ? 'success'
                                    : project.status === 'in_progress'
                                    ? 'info'
                                    : 'default'
                                }
                              >
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => makeAdmin(selectedClient.id)}
                      className="w-full"
                    >
                      Promote to Admin
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
