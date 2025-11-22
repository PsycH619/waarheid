'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectService, appointmentService } from '@/lib/firestore';
import type { Project, Appointment } from '@/types';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { FolderKanban, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

export default function ClientDashboardPage() {
  const { userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      loadDashboardData();
    }
  }, [userData]);

  const loadDashboardData = async () => {
    if (!userData) return;

    try {
      const [projectsData, appointmentsData] = await Promise.all([
        projectService.getByClient(userData.id),
        appointmentService.getByClient(userData.id),
      ]);

      setProjects(projectsData.slice(0, 5)); // Show only recent 5
      setUpcomingAppointments(
        appointmentsData
          .filter((apt) => apt.status === 'scheduled')
          .slice(0, 3)
      );
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const stats = [
    {
      icon: FolderKanban,
      label: 'Active Projects',
      value: projects.filter((p) => p.status === 'in_progress').length,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Calendar,
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: TrendingUp,
      label: 'Completed Projects',
      value: projects.filter((p) => p.status === 'completed').length,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <ProtectedRoute requiredRole="client">
      <DashboardLayout role="client">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userData?.name}!
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your projects.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
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
              );
            })}
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Link href="/client/projects">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-gray-500">No projects yet.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/client/projects/${project.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatRelativeTime(project.updatedAt)}</span>
                            {project.deadline && (
                              <span>• Due {formatDate(project.deadline)}</span>
                            )}
                          </div>
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
                <Link href="/client/appointments">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading appointments...</p>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No upcoming appointments.</p>
                  <Link href="/client/appointments">
                    <Button>Book an Appointment</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {appointment.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDate(appointment.startTime, 'PPP p')}
                          </p>
                          {appointment.googleMeetLink && (
                            <a
                              href={appointment.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline"
                            >
                              Join Google Meet
                            </a>
                          )}
                        </div>
                        <Badge variant="info">{appointment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/client/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/client/appointments">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Meeting
                  </Button>
                </Link>
                <Link href="/client/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderKanban className="h-5 w-5 mr-2" />
                    View Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
