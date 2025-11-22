'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/lib/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface AppointmentBookingProps {
  projectId?: string;
  onSuccess?: () => void;
}

export default function AppointmentBooking({
  projectId,
  onSuccess,
}: AppointmentBookingProps) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      toast.error('You must be logged in to book an appointment');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + parseInt(formData.duration) * 60000);

      // Create appointment in Firestore
      const appointmentData: any = {
        clientId: userData.id,
        clientName: userData.name,
        clientEmail: userData.email,
        title: formData.title,
        description: formData.description,
        startTime,
        endTime,
        status: 'scheduled',
        createdAt: new Date(),
      };

      // Only include projectId if it's defined (Firestore doesn't accept undefined)
      if (projectId) {
        appointmentData.projectId = projectId;
      }

      const appointmentId = await appointmentService.create(appointmentData);

      // Call Cloud Function to create Google Meet link
      try {
        const createMeetingFunc = httpsCallable(functions, 'createGoogleMeeting');
        await createMeetingFunc({ appointmentId });
      } catch (funcError) {
        console.error('Error creating Google Meet link:', funcError);
        // Don't fail the appointment creation if Meet link fails
        toast.success('Appointment booked! (Google Meet link will be added shortly)');
      }

      toast.success('Appointment booked successfully!');
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '30',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Meeting Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="e.g., Project Kickoff Meeting"
      />

      <Textarea
        label="Description (Optional)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
        placeholder="What would you like to discuss?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          min={today}
        />

        <Input
          label="Time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <Select
        label="Duration"
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        options={durationOptions}
      />

      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        Book Appointment
      </Button>
    </form>
  );
}
