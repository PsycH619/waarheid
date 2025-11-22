'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AppointmentBooking from '@/components/booking/AppointmentBooking';
import { useEffect, useState } from 'react';
import { appointmentService } from '@/lib/firestore';
import type { Appointment } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Calendar, ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientAppointmentsPage() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (userData) {
      loadAppointments();
    }
  }, [userData]);

  const loadAppointments = async () => {
    if (!userData) return;

    try {
      const data = await appointmentService.getByClient(userData.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    loadAppointments();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && new Date(apt.startTime.toString()) > new Date()
  );

  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || new Date(apt.startTime.toString()) <= new Date()
  );

  return (
    <ProtectedRoute requiredRole="client">
      <DashboardLayout role="client">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-2">Manage your meetings and consultations</p>
            </div>
            <Button onClick={() => setShowBookingForm(!showBookingForm)}>
              <Plus className="h-5 w-5 mr-2" />
              Book Appointment
            </Button>
          </div>

          {/* Booking Form */}
          {showBookingForm && (
            <Card>
              <CardHeader>
                <CardTitle>Book New Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentBooking onSuccess={handleBookingSuccess} />
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading appointments...</p>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Button onClick={() => setShowBookingForm(true)}>
                    Book Your First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {appointment.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {appointment.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(appointment.startTime, 'PPP p')}
                            </span>
                            {appointment.projectTitle && (
                              <span>• {appointment.projectTitle}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      {appointment.googleMeetLink && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={appointment.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Join Google Meet
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border border-gray-200 rounded-lg opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {appointment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.startTime, 'PPP p')}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
