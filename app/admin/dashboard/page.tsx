'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { userService, projectService, appointmentService, conversationService } from '@/lib/firestore';
import type { DashboardStats, Project, Appointment, Conversation } from '@/types';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { Users, FolderKanban, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [users, projects, appointments, conversations] = await Promise.all([
        userService.getAll(),
        projectService.getAll(),
        appointmentService.getUpcoming(),
        conversationService.getAll(),
      ]);

      // Calculate stats
      const clients = users.filter((u) => u.role === 'client');
      const projectsByStatus = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalClients: clients.length,
        activeProjects: projectsByStatus['in_progress'] || 0,
        completedProjects: projectsByStatus['completed'] || 0,
        upcomingAppointments: appointments.length,
        projectsByStatus,
      });

      setRecentProjects(projects.slice(0, 5));
      setUpcomingAppointments(appointments.slice(0, 5));
      setActiveConversations(conversations.filter((c) => !c.isClosed).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Users,
      label: 'Total Clients',
      value: stats.totalClients || 0,
      color: 'text-blue-600 bg-blue-100',
      href: '/admin/clients',
    },
    {
      icon: FolderKanban,
      label: 'Active Projects',
      value: stats.activeProjects || 0,
      color: 'text-green-600 bg-green-100',
      href: '/admin/projects',
    },
    {
      icon: TrendingUp,
      label: 'Completed Projects',
      value: stats.completedProjects || 0,
      color: 'text-purple-600 bg-purple-100',
      href: '/admin/projects',
    },
    {
      icon: Calendar,
      label: 'Upcoming Meetings',
      value: stats.upcomingAppointments || 0,
      color: 'text-orange-600 bg-orange-100',
      href: '/admin/appointments',
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {userData?.name}! Here's your business overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} href={stat.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link
                    href="/admin/projects"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : recentProjects.length === 0 ? (
                  <p className="text-gray-500">No projects yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/admin/projects/${project.id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatRelativeTime(project.updatedAt)}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Link
                    href="/admin/appointments"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500">No upcoming appointments.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.clientName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(appointment.startTime, 'PPP p')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Support Conversations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Support Chats</CardTitle>
                <Link
                  href="/admin/chats"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : activeConversations.length === 0 ? (
                <p className="text-gray-500">No active conversations.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeConversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/admin/chats/${conversation.id}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <Badge variant={conversation.isClosed ? 'default' : 'info'}>
                          {conversation.isClosed ? 'Closed' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
